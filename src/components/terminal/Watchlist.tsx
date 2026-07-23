'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { formatPrice, formatPct, getPriceClass } from '@/lib/formatters';
import { DEFAULT_WATCHLIST } from '@/lib/symbols';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const STORAGE_KEY = 'bloomberg-watchlist';

interface WatchlistItem {
  symbol: string;
  name: string;
}

interface Quote {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  error?: boolean;
}

interface WatchlistProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return DEFAULT_WATCHLIST;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_WATCHLIST;
}

export default function Watchlist({ selectedSymbol, onSelectSymbol }: WatchlistProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(DEFAULT_WATCHLIST);
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setWatchlist(loadWatchlist());
  }, []);

  // Persist to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const symbolsParam = watchlist.map(s => s.symbol).join(',');
  const { data: quotes, isLoading } = useSWR<Quote[]>(
    `/api/quotes?symbols=${symbolsParam}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const getQuote = (symbol: string) => quotes?.find(q => q.symbol === symbol);

  const handleAdd = async () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    if (watchlist.find(w => w.symbol === sym)) {
      setError('Already in watchlist');
      return;
    }

    setAdding(true);
    setError('');

    try {
      const res = await fetch(`/api/quotes?symbols=${sym}`);
      const data: Quote[] = await res.json();
      const quote = Array.isArray(data) ? data[0] : null;

      if (!quote || quote.error || quote.price === null) {
        setError(`"${sym}" not found`);
      } else {
        setWatchlist(prev => [...prev, { symbol: sym, name: quote.name || sym }]);
        setInput('');
      }
    } catch {
      setError('Failed to look up symbol');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = (sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlist(prev => prev.filter(w => w.symbol !== sym));
    if (selectedSymbol === sym && watchlist.length > 1) {
      const remaining = watchlist.filter(w => w.symbol !== sym);
      onSelectSymbol(remaining[0]?.symbol ?? '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setInput(''); setError(''); }
  };

  return (
    <div
      className="panel"
      style={{ gridRow: '3', gridColumn: '1', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Watchlist</span>
        <span style={{ color: '#333', fontSize: '9px' }}>{watchlist.length} symbols</span>
      </div>

      {/* Add symbol input */}
      <div style={{ padding: '6px 8px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="Add symbol..."
            maxLength={10}
            style={{
              flex: 1,
              background: '#111',
              border: '1px solid #2a2a2a',
              color: '#f39f41',
              padding: '4px 6px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              outline: 'none',
              borderRadius: '2px',
            }}
            onFocus={e => (e.target.style.borderColor = '#f39f41')}
            onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !input.trim()}
            style={{
              background: adding ? '#222' : '#f39f41',
              color: '#0a0a0a',
              border: 'none',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: adding || !input.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              borderRadius: '2px',
              opacity: !input.trim() ? 0.4 : 1,
            }}
          >
            {adding ? '...' : '+'}
          </button>
        </div>
        {error && (
          <div style={{ color: '#ff433d', fontSize: '10px', marginTop: '3px' }}>{error}</div>
        )}
      </div>

      {/* Ticker list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {watchlist.map(({ symbol, name }) => {
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
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#111';
                const btn = e.currentTarget.querySelector('.remove-btn') as HTMLElement;
                if (btn) btn.style.opacity = '1';
              }}
              onMouseLeave={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                const btn = e.currentTarget.querySelector('.remove-btn') as HTMLElement;
                if (btn) btn.style.opacity = '0';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#f39f41', fontWeight: 700, fontSize: '12px' }}>{symbol}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>
                    {isLoading ? <span className="muted">...</span> : <span>{formatPrice(q?.price ?? null)}</span>}
                  </span>
                  <button
                    className="remove-btn"
                    onClick={e => handleRemove(symbol, e)}
                    title={`Remove ${symbol}`}
                    style={{
                      opacity: 0,
                      background: 'none',
                      border: 'none',
                      color: '#ff433d',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '0 2px',
                      lineHeight: 1,
                      transition: 'opacity 0.1s',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    ×
                  </button>
                </div>
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
