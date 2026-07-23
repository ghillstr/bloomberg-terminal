'use client';

import useSWR from 'swr';
import { formatPrice, formatPct, getPriceClass, formatVolume, formatMarketCap } from '@/lib/formatters';
import { CRYPTO_WATCHLIST } from '@/lib/symbols';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface CoinData {
  id: string;
  symbol: string;
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
}

export default function CryptoWatchlist() {
  const { data: coins, isLoading } = useSWR<CoinData[]>(
    '/api/crypto',
    fetcher,
    { refreshInterval: 60000 }
  );

  const getCoin = (id: string) => coins?.find(c => c.id === id);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e', padding: '6px 10px', flexShrink: 0 }}>
        <span style={{ color: '#f39f41', fontWeight: 700 }}>CRYPTO MARKETS</span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 100px 100px 100px 100px',
            padding: '4px 12px',
            fontSize: '10px',
            color: '#555',
            borderBottom: '1px solid #1e1e1e',
            background: '#0a0a0a',
          }}
        >
          <span>SYM</span>
          <span>NAME</span>
          <span style={{ textAlign: 'right' }}>PRICE</span>
          <span style={{ textAlign: 'right' }}>24H%</span>
          <span style={{ textAlign: 'right' }}>VOLUME</span>
          <span style={{ textAlign: 'right' }}>MKT CAP</span>
        </div>

        {CRYPTO_WATCHLIST.map(({ symbol, id, name }) => {
          const coin = getCoin(id);
          const priceClass = getPriceClass(coin?.change24h ?? null);

          return (
            <div
              key={id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 100px 100px 100px 100px',
                padding: '8px 12px',
                borderBottom: '1px solid #0f0f0f',
                fontSize: '12px',
              }}
            >
              <span style={{ color: '#f39f41', fontWeight: 700 }}>{symbol}</span>
              <span style={{ color: '#888' }}>{name}</span>
              <span style={{ textAlign: 'right' }}>
                {isLoading ? <span className="muted">...</span> : `$${formatPrice(coin?.price ?? null, 2)}`}
              </span>
              <span className={priceClass} style={{ textAlign: 'right' }}>
                {isLoading ? '' : formatPct(coin?.change24h ?? null)}
              </span>
              <span style={{ textAlign: 'right', color: '#888' }}>
                {isLoading ? '' : formatVolume(coin?.volume24h ?? null)}
              </span>
              <span style={{ textAlign: 'right', color: '#888' }}>
                {isLoading ? '' : formatMarketCap(coin?.marketCap ?? null)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ padding: '6px 12px', borderTop: '1px solid #1e1e1e', fontSize: '10px', color: '#333' }}>
        Data: CoinGecko Public API · Refreshes every 60s
      </div>
    </div>
  );
}
