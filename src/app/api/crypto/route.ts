export async function GET() {
  const ids = 'bitcoin,ethereum,solana,binancecoin,ripple';
  const symbols: Record<string, string> = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    solana: 'SOL',
    binancecoin: 'BNB',
    ripple: 'XRP',
  };

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    const data = await res.json();

    const coins = Object.entries(data).map(([id, info]: [string, unknown]) => {
      const coinInfo = info as Record<string, number>;
      return {
        id,
        symbol: symbols[id] || id.toUpperCase(),
        price: coinInfo['usd'] ?? null,
        change24h: coinInfo['usd_24h_change'] ?? null,
        volume24h: coinInfo['usd_24h_vol'] ?? null,
        marketCap: coinInfo['usd_market_cap'] ?? null,
      };
    });

    return Response.json(coins);
  } catch (err) {
    console.error('Crypto error:', err);
    // Return mock data if CoinGecko is rate-limited
    return Response.json([
      { id: 'bitcoin', symbol: 'BTC', price: null, change24h: null, volume24h: null, marketCap: null },
      { id: 'ethereum', symbol: 'ETH', price: null, change24h: null, volume24h: null, marketCap: null },
      { id: 'solana', symbol: 'SOL', price: null, change24h: null, volume24h: null, marketCap: null },
      { id: 'binancecoin', symbol: 'BNB', price: null, change24h: null, volume24h: null, marketCap: null },
      { id: 'ripple', symbol: 'XRP', price: null, change24h: null, volume24h: null, marketCap: null },
    ]);
  }
}
