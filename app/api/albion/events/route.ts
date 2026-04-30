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
  const cacheKey = `events_v8_${player}_${limit}_${offset}`;
  
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
    const historyWindow = Math.max(limit + offset, 20);

    const [deaths, kills] = await Promise.all([
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/deaths?limit=${historyWindow}`)
        .then(r => r.ok ? r.json() : [])
        .catch(() => []),
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/kills?limit=${historyWindow}`)
        .then(r => r.ok ? r.json() : [])
        .catch(() => []),
    ]);
    
    const events: Event[] = [];

    if (Array.isArray(deaths)) events.push(...deaths);
    if (Array.isArray(kills)) events.push(...kills);
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

    for (const event of paginated) {
      setCached(`event_detail_${event.EventId}`, event, 60 * 1000);
    }

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
