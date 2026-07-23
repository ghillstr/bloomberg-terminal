import YahooFinanceClass from 'yahoo-finance2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ['yahooSurvey'] });

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NVDA', 'TSLA', 'AMD', 'NFLX', 'CRM'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  const symbols = symbolsParam
    ? symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    : DEFAULT_SYMBOLS;

  try {
    const results = await Promise.allSettled(
      symbols.map((symbol: string) => yf.quote(symbol) as Promise<Record<string, unknown>>)
    );

    const earnings: Array<{
      symbol: string;
      companyName: string;
      earningsDate: string | null;
      epsEstimate: number | null;
    }> = [];

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const q = result.value as Record<string, unknown>;
        // v4: earningsTimestamp is a Date object (ISO string when JSON-serialized)
        const ts = q?.earningsTimestamp;
        let earningsDate: string | null = null;
        if (ts) {
          const d = ts instanceof Date ? ts : new Date(ts as string);
          if (!isNaN(d.getTime())) {
            earningsDate = d.toISOString().split('T')[0];
          }
        }
        if (earningsDate) {
          earnings.push({
            symbol: symbols[i],
            companyName: (q?.shortName || symbols[i]) as string,
            earningsDate,
            epsEstimate: (q?.epsForward ?? null) as number | null,
          });
        }
      }
    });

    earnings.sort((a, b) => {
      if (!a.earningsDate) return 1;
      if (!b.earningsDate) return -1;
      return a.earningsDate.localeCompare(b.earningsDate);
    });

    return Response.json(earnings);
  } catch (err) {
    console.error('Earnings error:', err);
    return Response.json([], { status: 500 });
  }
}
