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
  const cacheKey = `events_v6_${player}_${limit}_${offset}`;
  
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
    const guildId = foundPlayer.GuildId;

    // Fetch in parallel
    // We combine standard player endpoints (limited to 10) with Guild Events (if available) to get more history.
    
    const promises: Promise<any>[] = [
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/deaths?limit=50`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/kills?limit=50`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/topkills?limit=50`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/solokills?limit=50`).then(r => r.ok ? r.json() : []).catch(() => [])
    ];

    if (guildId) {
      // Fetch recent guild events (limit 100 to maximize chance of finding player events)
      promises.push(
        fetchWithTimeout(`${ALBION_API_BASE}/events?guildId=${guildId}&limit=100`)
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
      );
    }

    const results = await Promise.all(promises);
    
    const events: Event[] = [];

    // Process standard endpoints
    if (Array.isArray(results[0])) events.push(...results[0]); // Deaths
    if (Array.isArray(results[1])) events.push(...results[1]); // Kills
    if (Array.isArray(results[2])) events.push(...results[2]); // Top
    if (Array.isArray(results[3])) events.push(...results[3]); // Solo

    // Process Guild Events (Filter for current player)
    if (guildId && Array.isArray(results[4])) {
      const guildEvents = results[4].filter((e: any) => 
        e.Killer.Id === playerId || 
        e.Victim.Id === playerId || 
        (e.Participants && e.Participants.some((p: any) => p.Id === playerId))
      );
      console.log(`[API] Found ${guildEvents.length} extra events via Guild feed`);
      events.push(...guildEvents);
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
