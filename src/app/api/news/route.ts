import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || '';
  const apiKey = process.env.FINNHUB_API_KEY || '';

  try {
    let url: string;
    if (symbol && apiKey) {
      url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${getDateStr(-7)}&to=${getDateStr(0)}&token=${apiKey}`;
    } else if (apiKey) {
      url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;
    } else {
      // Fallback to Yahoo Finance RSS-style via a proxy
      return Response.json(getFallbackNews());
    }

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Finnhub error: ${res.status}`);

    const data = await res.json();
    const articles = (Array.isArray(data) ? data : [])
      .slice(0, 15)
      .map((item: { headline?: string; summary?: string; url?: string; datetime?: number; source?: string; image?: string }) => ({
        headline: item.headline || '',
        summary: item.summary || '',
        url: item.url || '',
        datetime: item.datetime || 0,
        source: item.source || '',
        image: item.image || '',
      }));

    return Response.json(articles);
  } catch (err) {
    console.error('News error:', err);
    return Response.json(getFallbackNews());
  }
}

function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function getFallbackNews() {
  return [
    { headline: 'Add FINNHUB_API_KEY to .env.local for live news', summary: 'Get a free API key at finnhub.io', url: '', datetime: Date.now() / 1000, source: 'System' },
  ];
}
