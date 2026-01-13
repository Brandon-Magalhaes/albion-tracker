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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const player = searchParams.get('player');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const cacheKey = `event_detail_${id}`;
  const cached = getCached<Event>(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  try {
    // 1. Try Direct Fetch (Fastest)
    const res = await fetchWithTimeout(`${ALBION_API_BASE}/events/${id}`);
    
    if (res.ok) {
        const data = await res.json();
        setCached(cacheKey, data, 60 * 1000);
        return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } });
    }

    // 2. Fallback: Search in Recent Events (if player name provided)
    // The API deletes old events or direct access might be restricted/flaky.
    // If we know the player involved, we can search their recent history.
    if (!res.ok && player) {
        console.log(`Event ${id} not found directly. Trying fallback for player: ${player}`);
        
        // Use our internal logic or call the external API directly again?
        // Let's call external to keep it self-contained or call our internal /events endpoint?
        // Internal call might be circular or weird in Next.js serverless.
        // Let's replicate the logic: Search Player -> Get ID -> Get Events -> Find ID.
        
        // 2a. Search Player ID
        const searchRes = await fetchWithTimeout(`${ALBION_API_BASE}/search?q=${encodeURIComponent(player)}`);
        if (!searchRes.ok) throw new Error('Search failed in fallback');
        const searchData = await searchRes.json();
        const foundPlayer = searchData.players.find((p: { Name: string }) => p.Name.toLowerCase() === player.toLowerCase());

        if (foundPlayer) {
            const playerId = foundPlayer.Id;
            // 2b. Fetch Deaths & TopKills (Limit 50 to have a good chance)
             const [deathsResult, topKillsResult] = await Promise.allSettled([
                fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/deaths?limit=50`),
                fetchWithTimeout(`${ALBION_API_BASE}/players/${playerId}/topkills?limit=50`)
            ]);

            const events: Event[] = [];
            if (deathsResult.status === 'fulfilled' && deathsResult.value.ok) {
                const d = await deathsResult.value.json();
                if (Array.isArray(d)) events.push(...d);
            }
            if (topKillsResult.status === 'fulfilled' && topKillsResult.value.ok) {
                const k = await topKillsResult.value.json();
                if (Array.isArray(k)) events.push(...k);
            }

            // 2c. Find specific event
            const foundEvent = events.find(e => e.EventId.toString() === id);
            
            if (foundEvent) {
                setCached(cacheKey, foundEvent, 60 * 1000);
                return NextResponse.json(foundEvent, { headers: { 'X-Cache': 'FALLBACK_MISS' } });
            }
        }
    }

    // If we reached here, we couldn't find it.
    throw new Error(`Event not found or API error: ${res.status}`);

  } catch (error: unknown) {
    console.error('Event detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch event details', details: (error as Error).message }, { status: 404 });
  }
}
