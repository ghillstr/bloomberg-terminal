import { NextRequest } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

// yahoo-finance2 v4: must instantiate with new
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols') || 'AAPL,TSLA,NVDA,MSFT';
  const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);

  try {
    const results = await Promise.allSettled(
      symbols.map((symbol: string) => yf.quote(symbol) as Promise<Record<string, unknown>>)
    );

    const quotes = results.map((result, i) => {
      if (result.status === 'fulfilled') {
        const q = result.value as Record<string, unknown>;
        return {
          symbol: symbols[i],
          name: (q?.shortName || q?.longName || symbols[i]) as string,
          price: (q?.regularMarketPrice ?? null) as number | null,
          change: (q?.regularMarketChange ?? null) as number | null,
          changePct: (q?.regularMarketChangePercent ?? null) as number | null,
          volume: (q?.regularMarketVolume ?? null) as number | null,
          marketCap: (q?.marketCap ?? null) as number | null,
          open: (q?.regularMarketOpen ?? null) as number | null,
          high: (q?.regularMarketDayHigh ?? null) as number | null,
          low: (q?.regularMarketDayLow ?? null) as number | null,
          prevClose: (q?.regularMarketPreviousClose ?? null) as number | null,
          fiftyTwoWeekHigh: (q?.fiftyTwoWeekHigh ?? null) as number | null,
          fiftyTwoWeekLow: (q?.fiftyTwoWeekLow ?? null) as number | null,
          earningsTimestamp: (q?.earningsTimestamp ?? null) as number | null,
        };
      }
      return { symbol: symbols[i], error: true, price: null, change: null, changePct: null };
    });

    return Response.json(quotes);
  } catch (err) {
    console.error('Quotes error:', err);
    return Response.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
