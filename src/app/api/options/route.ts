import { NextRequest } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'AAPL';

  try {
    const result = await yf.options(symbol) as Record<string, unknown>;

    // v4 structure: result.options[0].calls, result.options[0].puts
    const optionsArr = result?.options as Array<Record<string, unknown>> | undefined;
    const firstExpiry = optionsArr?.[0];
    const expirationDate = firstExpiry?.expirationDate
      ? new Date(firstExpiry.expirationDate as string).toISOString().split('T')[0]
      : null;

    const mapContract = (c: unknown) => {
      const r = c as Record<string, unknown>;
      const iv = r?.impliedVolatility as number | null;
      return {
        strike: (r?.strike ?? null) as number | null,
        bid: (r?.bid ?? null) as number | null,
        ask: (r?.ask ?? null) as number | null,
        iv: iv != null ? +((iv * 100).toFixed(1)) : null,
        delta: (r?.delta ?? null) as number | null,
        gamma: (r?.gamma ?? null) as number | null,
        oi: (r?.openInterest ?? null) as number | null,
        volume: (r?.volume ?? null) as number | null,
        lastPrice: (r?.lastPrice ?? null) as number | null,
        inTheMoney: ((r?.inTheMoney ?? false) as boolean),
      };
    };

    const calls = ((firstExpiry?.calls as unknown[]) || []).map(mapContract);
    const puts = ((firstExpiry?.puts as unknown[]) || []).map(mapContract);

    return Response.json({ symbol, expirationDate, calls, puts });
  } catch (err) {
    console.error('Options error:', err);
    return Response.json({ symbol, expirationDate: null, calls: [], puts: [], error: 'Failed to fetch options' }, { status: 500 });
  }
}
