import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/cache';
import { SearchResult, Event } from '@/types/albion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALBION_API_BASE = 'https://gameinfo.albiononline.com/api/gameinfo';

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 
  try {
    // Ensure no caching for fresh data
    const res = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const player = searchParams.get('player');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!player) {
    return NextResponse.json({ error: 'Missing query param player' }, { status: 400 });
  }

  // We keep a short in-memory cache to prevent spamming the API on rapid reloads,
  // but the upstream fetch MUST be fresh.
  const cacheKey = `events_v7_${player}_${limit}_${offset}`;
  
  // Try cache first
  const cached = getCached<Event[]>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 
        'X-Cache': 'HIT',
        'X-Total-Count': cached.length.toString()
      },
    });
  }

  try {
    // 1. Resolve Name -> ID
    const searchRes = await fetchWithTimeout(`${ALBION_API_BASE}/search?q=${encodeURIComponent(player)}`);
    if (!searchRes.ok) throw new Error('Search failed');
    const searchData: SearchResult = await searchRes.json();
    
    const foundPlayer = searchData.players.find(p => p.Name.toLowerCase() === player.toLowerCase()) || searchData.players[0];
    
    if (!foundPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const playerId = foundPlayer.Id;
    let guildId = foundPlayer.GuildId;
    let allianceId = foundPlayer.AllianceId;

    const profileRes = await fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}`);
    if (profileRes.ok) {
      const profile = await profileRes.json();
      guildId = profile.GuildId || guildId;
      allianceId = profile.AllianceId || allianceId;
    }

    const [deaths, kills, topKills, soloKills, guildEventsRaw, allianceEventsRaw] = await Promise.all([
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/deaths?limit=50`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/kills?limit=50`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/topkills?limit=50`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/solokills?limit=50`).then(r => r.ok ? r.json() : []).catch(() => []),
      guildId
        ? fetchWithTimeout(`${ALBION_API_BASE}/events?guildId=${guildId}&limit=100`).then(r => r.ok ? r.json() : []).catch(() => [])
        : Promise.resolve([]),
      allianceId
        ? fetchWithTimeout(`${ALBION_API_BASE}/events?allianceId=${allianceId}&limit=100`).then(r => r.ok ? r.json() : []).catch(() => [])
        : Promise.resolve([])
    ]);
    
    const events: Event[] = [];

    if (Array.isArray(deaths)) events.push(...deaths);
    if (Array.isArray(kills)) events.push(...kills);
    if (Array.isArray(topKills)) events.push(...topKills);
    if (Array.isArray(soloKills)) events.push(...soloKills);

    if (Array.isArray(guildEventsRaw)) {
      const guildEvents = (guildEventsRaw as Event[]).filter((e: Event) => 
        e.Killer.Id === playerId || 
        e.Victim.Id === playerId || 
        (e.Participants && e.Participants.some((p) => p.Id === playerId))
      );
      events.push(...guildEvents);
    }

    if (Array.isArray(allianceEventsRaw)) {
      const allianceEvents = (allianceEventsRaw as Event[]).filter((e: Event) => 
        e.Killer.Id === playerId || 
        e.Victim.Id === playerId || 
        (e.Participants && e.Participants.some((p) => p.Id === playerId))
      );
      events.push(...allianceEvents);
    }

    // 3. Deduplicate (by EventId) & Sort
    const uniqueEvents = Array.from(new Map(events.map(item => [item.EventId, item])).values());
    uniqueEvents.sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime());

    // Debug logging to verify fresh data
    if (uniqueEvents.length > 0) {
      console.log(`[API] Fetched ${uniqueEvents.length} events for ${player}. Latest: ${uniqueEvents[0].TimeStamp}`);
    }

    // 4. Paginate
    // Note: Since we are merging two sources, offset/limit is applied in memory after fetching recent history
    const paginated = uniqueEvents.slice(offset, offset + limit);

    // 5. Cache
    setCached(cacheKey, paginated, 60 * 1000);

    return NextResponse.json(paginated, {
      headers: { 
        'X-Cache': 'MISS',
        'X-Total-Count': uniqueEvents.length.toString()
      },
    });

  } catch (error: unknown) {
    console.error('Events fetch error:', error);
    const status = (error as Error).name === 'AbortError' ? 504 : 500;
    return NextResponse.json({ error: 'Failed to fetch events', details: (error as Error).message }, { status });
  }
}
