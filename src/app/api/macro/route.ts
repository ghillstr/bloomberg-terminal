import YahooFinanceClass from 'yahoo-finance2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ['yahooSurvey'] });

export async function GET() {
  const fredKey = process.env.FRED_API_KEY || '';

  if (!fredKey) {
    const data = await fetchYahooMacro();
    return Response.json(data);
  }

  try {
    const fredSeries = ['FEDFUNDS', 'T10Y2Y', 'T10YIE', 'CPIAUCSL', 'UNRATE'];
    const results = await Promise.allSettled(
      fredSeries.map(id =>
        fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${fredKey}&sort_order=desc&limit=2&file_type=json`)
          .then(r => r.json())
      )
    );

    const macro: Record<string, { value: number | null; label: string; unit: string }> = {};
    const labels: Record<string, { label: string; unit: string }> = {
      FEDFUNDS: { label: 'Fed Funds Rate', unit: '%' },
      T10Y2Y: { label: '10Y-2Y Spread', unit: 'bps' },
      T10YIE: { label: '10Y Breakeven', unit: '%' },
      CPIAUCSL: { label: 'CPI', unit: '%' },
      UNRATE: { label: 'Unemployment', unit: '%' },
    };

    results.forEach((result, i) => {
      const id = fredSeries[i];
      if (result.status === 'fulfilled') {
        const data = result.value as { observations?: Array<{ value: string }> };
        const obs = data?.observations;
        const latest = obs?.[0];
        macro[id] = {
          value: latest?.value !== '.' ? parseFloat(latest?.value ?? '') : null,
          ...labels[id],
        };
      } else {
        macro[id] = { value: null, ...labels[id] };
      }
    });

    const yahooDat = await fetchYahooMacro();
    return Response.json({ ...macro, ...yahooDat });
  } catch (err) {
    console.error('Macro FRED error:', err);
    const data = await fetchYahooMacro();
    return Response.json(data);
  }
}

async function fetchYahooMacro() {
  const marketSymbols = ['^TNX', '^TYX', '^IRX', 'GC=F', 'CL=F', '^VIX', 'DX-Y.NYB'];
  const labels: Record<string, { label: string; unit: string }> = {
    '^TNX': { label: '10Y Treasury', unit: '%' },
    '^TYX': { label: '30Y Treasury', unit: '%' },
    '^IRX': { label: '3M T-Bill', unit: '%' },
    'GC=F': { label: 'Gold', unit: '$' },
    'CL=F': { label: 'Oil (WTI)', unit: '$' },
    '^VIX': { label: 'VIX', unit: '' },
    'DX-Y.NYB': { label: 'DXY', unit: '' },
  };

  const results = await Promise.allSettled(
    marketSymbols.map((sym: string) => yf.quote(sym) as Promise<Record<string, unknown>>)
  );

  const macro: Record<string, { value: number | null; change: number | null; changePct: number | null; label: string; unit: string }> = {};
  results.forEach((result, i) => {
    const sym = marketSymbols[i];
    if (result.status === 'fulfilled') {
      const q = result.value as Record<string, unknown>;
      macro[sym] = {
        value: (q?.regularMarketPrice ?? null) as number | null,
        change: (q?.regularMarketChange ?? null) as number | null,
        changePct: (q?.regularMarketChangePercent ?? null) as number | null,
        ...labels[sym],
      };
    } else {
      macro[sym] = { value: null, change: null, changePct: null, ...labels[sym] };
    }
  });

  return macro;
}
