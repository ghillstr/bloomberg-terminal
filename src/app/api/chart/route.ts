import { NextRequest } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ['yahooSurvey'] });

type Period = '1d' | '5d' | '1mo' | '3mo' | '1y';

const periodConfig: Record<Period, { interval: string }> = {
  '1d': { interval: '5m' },
  '5d': { interval: '15m' },
  '1mo': { interval: '1d' },
  '3mo': { interval: '1d' },
  '1y': { interval: '1wk' },
};

const periodMs: Record<Period, number> = {
  '1d': 86400000,
  '5d': 5 * 86400000,
  '1mo': 30 * 86400000,
  '3mo': 90 * 86400000,
  '1y': 365 * 86400000,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'AAPL';
  const period = (searchParams.get('period') || '1d') as Period;

  const config = periodConfig[period] || periodConfig['1d'];

  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - (periodMs[period] || 86400000));

    const historical = await yf.chart(symbol, {
      period1: startDate,
      period2: now,
      interval: config.interval,
    }) as Record<string, unknown>;

    const rawQuotes = (historical?.quotes as unknown[]) || [];
    const candles = rawQuotes
      .filter((q) => {
        const r = q as Record<string, unknown>;
        // v4 uses 'date', older versions use 'timestamp'
        const ts = r.date || r.timestamp;
        return ts && r.open && r.high && r.low && r.close;
      })
      .map((q) => {
        const r = q as Record<string, unknown>;
        const ts = r.date || r.timestamp;
        return {
          time: Math.floor(new Date(ts as string | number).getTime() / 1000),
          open: r.open as number,
          high: r.high as number,
          low: r.low as number,
          close: r.close as number,
          volume: (r.volume as number) ?? 0,
        };
      });

    return Response.json({ symbol, period, candles });
  } catch (err) {
    console.error('Chart error:', err);
    return Response.json({ error: 'Failed to fetch chart data', symbol, period, candles: [] }, { status: 500 });
  }
}
