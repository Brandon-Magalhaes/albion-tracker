import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/cache';
import { Event } from '@/types/albion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GLOBAL_EVENTS_TTL = 30 * 1000;
const GLOBAL_EVENTS_TIMEOUTS_MS = [8000, 12000];

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchGlobalEvents(url: string) {
  let lastError: Error | null = null;

  for (const timeoutMs of GLOBAL_EVENTS_TIMEOUTS_MS) {
    try {
      const response = await fetchWithTimeout(url, timeoutMs);

      if (response.ok) {
        return response;
      }

      if (response.status < 500) {
        return response;
      }
    } catch (error: unknown) {
      lastError = error as Error;
      if ((error as Error).name !== 'AbortError') {
        break;
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch global events');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';
  const cacheKey = `global_events_${limit}_${offset}`;

  const cached = getCached<unknown[]>(cacheKey);

  try {
    const res = await fetchGlobalEvents(
      `https://gameinfo.albiononline.com/api/gameinfo/events?limit=${limit}&offset=${offset}`
    );
    
    if (!res.ok) {
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'X-Cache': 'STALE' },
        });
      }

      return NextResponse.json([], {
        headers: {
          'X-Cache': 'EMPTY',
          'X-Upstream-Status': String(res.status),
        },
      });
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      setCached(cacheKey, data, GLOBAL_EVENTS_TTL);

      for (const event of data as Event[]) {
        if (event?.EventId) {
          setCached(`event_detail_${event.EventId}`, event, GLOBAL_EVENTS_TTL);
        }
      }
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });

  } catch (error: unknown) {
    console.warn('Global events fallback:', error);

    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'STALE' },
      });
    }

    return NextResponse.json([], {
      headers: { 'X-Cache': 'EMPTY' },
    });
  }
}
