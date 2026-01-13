import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/cache';
import { SearchResult, Event } from '@/types/albion';

const ALBION_API_BASE = 'https://gameinfo.albiononline.com/api/gameinfo';

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 
  try {
    const res = await fetch(url, { signal: controller.signal });
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

  const cacheKey = `events_v3_${player}_${limit}_${offset}`;
  
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
    // We assume the player name is exact or close enough for the first result
    const searchRes = await fetchWithTimeout(`${ALBION_API_BASE}/search?q=${encodeURIComponent(player)}`);
    if (!searchRes.ok) throw new Error('Search failed');
    const searchData: SearchResult = await searchRes.json();
    
    const foundPlayer = searchData.players.find(p => p.Name.toLowerCase() === player.toLowerCase()) || searchData.players[0];
    
    if (!foundPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const playerId = foundPlayer.Id;

    // 2. Fetch Deaths & Top Kills (Parallel)
    // The generic /events endpoint does not reliably filter by player name.
    // We must use specific endpoints to guarantee accurate history.
    const [deathsResult, topKillsResult] = await Promise.allSettled([
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/deaths`),
      fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/topkills`)
    ]);

    const events: Event[] = [];

    if (deathsResult.status === 'fulfilled' && deathsResult.value.ok) {
      const deaths = await deathsResult.value.json();
      if (Array.isArray(deaths)) events.push(...deaths);
    }

    if (topKillsResult.status === 'fulfilled' && topKillsResult.value.ok) {
      const kills = await topKillsResult.value.json();
      if (Array.isArray(kills)) events.push(...kills);
    }

    // 3. Deduplicate (by EventId) & Sort
    const uniqueEvents = Array.from(new Map(events.map(item => [item.EventId, item])).values());
    uniqueEvents.sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime());

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
