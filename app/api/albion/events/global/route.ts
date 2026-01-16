import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';

  try {
    // Albion Online Public API - Global Events
    const res = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/events?limit=${limit}&offset=${offset}`, {
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache'
        }
    });
    
    if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch from Albion API' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Global events error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
