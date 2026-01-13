import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/cache';
import { SearchResult } from '@/types/albion';

const ALBION_API_BASE = 'https://gameinfo.albiononline.com/api/gameinfo';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query param q' }, { status: 400 });
  }

  const cacheKey = `search_${q}`;
  const cached = getCached<SearchResult>(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${ALBION_API_BASE}/search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Albion API error: ${res.status}`);
    }

    const data = await res.json();
    setCached(cacheKey, data, 60 * 1000); // 1 min cache

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
