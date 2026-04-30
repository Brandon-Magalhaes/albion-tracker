import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/cache';
import { Event } from '@/types/albion';

const ALBION_API_BASE = 'https://gameinfo.albiononline.com/api/gameinfo';

// We reuse the fetch with timeout utility
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

async function findEventByPlayer(player: string, eventId: string) {
  const searchRes = await fetchWithTimeout(`${ALBION_API_BASE}/search?q=${encodeURIComponent(player)}`);
  if (!searchRes.ok) {
    return null;
  }

  const searchData = await searchRes.json();
  const foundPlayer =
    searchData.players.find((p: { Name: string }) => p.Name.toLowerCase() === player.toLowerCase()) ||
    searchData.players[0];

  if (!foundPlayer) {
    return null;
  }

  const playerId = foundPlayer.Id;
  const [deathsResult, killsResult, topKillsResult, soloKillsResult] = await Promise.allSettled([
    fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/deaths?limit=100`),
    fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/kills?limit=100`),
    fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/topkills?limit=100`),
    fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/solokills?limit=100`),
  ]);

  const events: Event[] = [];

  for (const result of [deathsResult, killsResult, topKillsResult, soloKillsResult]) {
    if (result.status === 'fulfilled' && result.value.ok) {
      const data = await result.value.json();
      if (Array.isArray(data)) {
        events.push(...data);
      }
    }
  }

  return events.find((event) => event.EventId.toString() === eventId) ?? null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const player = searchParams.get('player');
  const otherPlayer = searchParams.get('otherPlayer');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const cacheKey = `event_detail_${id}`;
  const cached = getCached<Event>(cacheKey);
  const fallbackPlayers = Array.from(new Set([player, otherPlayer].filter(Boolean) as string[]));

  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  try {
    let res: Response | null = null;
    let directFetchError: Error | null = null;

    try {
      res = await fetchWithTimeout(`${ALBION_API_BASE}/events/${id}`);
    } catch (error: unknown) {
      directFetchError = error as Error;
    }
    
    if (res?.ok) {
      const data = await res.json();
      setCached(cacheKey, data, 60 * 1000);
      return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } });
    }

    for (const fallbackPlayer of fallbackPlayers) {
      console.log(`Event ${id} not found directly. Trying fallback for player: ${fallbackPlayer}`);
      const foundEvent = await findEventByPlayer(fallbackPlayer, id);

      if (foundEvent) {
        setCached(cacheKey, foundEvent, 60 * 1000);
        return NextResponse.json(foundEvent, { headers: { 'X-Cache': 'FALLBACK_MISS' } });
      }
    }

    const statusOrReason = res ? res.status : directFetchError?.message ?? 'unknown';
    throw new Error(`Event not found or API error: ${statusOrReason}`);

  } catch (error: unknown) {
    console.error('Event detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch event details', details: (error as Error).message }, { status: 404 });
  }
}
