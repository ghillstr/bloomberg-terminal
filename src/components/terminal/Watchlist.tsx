'use client';

import useSWR from 'swr';
import { formatPrice, formatPct, getPriceClass } from '@/lib/formatters';
import { DEFAULT_WATCHLIST } from '@/lib/symbols';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Quote {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
}

interface WatchlistProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export default function Watchlist({ selectedSymbol, onSelectSymbol }: WatchlistProps) {
  const symbolsParam = DEFAULT_WATCHLIST.map(s => s.symbol).join(',');
  const { data: quotes, isLoading } = useSWR<Quote[]>(
    `/api/quotes?symbols=${symbolsParam}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const getQuote = (symbol: string) => quotes?.find(q => q.symbol === symbol);

  return (
    <div
      className="panel"
      style={{
        gridRow: '3',
        gridColumn: '1',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="panel-header">Watchlist</div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {DEFAULT_WATCHLIST.map(({ symbol, name }) => {
          const q = getQuote(symbol);
          const isSelected = symbol === selectedSymbol;
          const priceClass = getPriceClass(q?.changePct ?? null);

          return (
            <div
              key={symbol}
              onClick={() => onSelectSymbol(symbol)}
              style={{
                padding: '6px 8px',
                borderBottom: '1px solid #111',
                cursor: 'pointer',
                background: isSelected ? '#1a1200' : 'transparent',
                borderLeft: isSelected ? '2px solid #f39f41' : '2px solid transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#111';
              }}
              onMouseLeave={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#f39f41', fontWeight: 700, fontSize: '12px' }}>{symbol}</span>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>
                  {isLoading ? (
                    <span className="muted">...</span>
                  ) : (
                    <span>{formatPrice(q?.price ?? null)}</span>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1px' }}>
                <span style={{ fontSize: '10px', color: '#555' }}>{name}</span>
                <span className={priceClass} style={{ fontSize: '10px' }}>
                  {isLoading ? '' : formatPct(q?.changePct ?? null)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
