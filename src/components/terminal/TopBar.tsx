'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { formatPrice, formatPct, formatTime, isMarketOpen } from '@/lib/formatters';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface QuoteData {
  symbol: string;
  price: number | null;
  changePct: number | null;
}

interface CryptoData {
  symbol: string;
  price: number | null;
  change24h: number | null;
}

export default function TopBar() {
  const [time, setTime] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      setTime(formatTime());
      setMarketOpen(isMarketOpen());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { data: quotes } = useSWR<QuoteData[]>(
    '/api/quotes?symbols=SPY,QQQ,%5EVIX,DX-Y.NYB,%5ETNX',
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: crypto } = useSWR<CryptoData[]>(
    '/api/crypto',
    fetcher,
    { refreshInterval: 60000 }
  );

  const spy = quotes?.find(q => q.symbol === 'SPY');
  const qqq = quotes?.find(q => q.symbol === 'QQQ');
  const vix = quotes?.find(q => q.symbol === '^VIX');
  const dxy = quotes?.find(q => q.symbol === 'DX-Y.NYB');
  const tnx = quotes?.find(q => q.symbol === '^TNX');
  const btc = crypto?.find(c => c.symbol === 'BTC');
  const eth = crypto?.find(c => c.symbol === 'ETH');

  const pctClass = (pct: number | null | undefined) => {
    if (pct == null) return 'muted';
    return pct >= 0 ? 'price-up' : 'price-down';
  };

  return (
    <div
      style={{
        gridColumn: '1 / -1',
        background: '#050505',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '16px',
        fontSize: '11px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Brand */}
      <span style={{ color: '#f39f41', fontWeight: 700, letterSpacing: '2px', fontSize: '13px', flexShrink: 0 }}>
        [G]
      </span>

      {/* Market Status */}
      <span style={{ flexShrink: 0 }}>
        <span style={{ color: marketOpen ? '#4af6c3' : '#ff433d', fontWeight: 700 }}>
          {marketOpen ? '● MARKET OPEN' : '● MARKET CLOSED'}
        </span>
      </span>

      <span style={{ color: '#1e1e1e' }}>│</span>

      {/* Key prices */}
      {spy && (
        <span style={{ flexShrink: 0 }}>
          <span className="amber">SPY </span>
          <span>{formatPrice(spy.price)}</span>
          <span className={pctClass(spy.changePct)}> {formatPct(spy.changePct)}</span>
        </span>
      )}
      {qqq && (
        <span style={{ flexShrink: 0 }}>
          <span className="amber">QQQ </span>
          <span>{formatPrice(qqq.price)}</span>
          <span className={pctClass(qqq.changePct)}> {formatPct(qqq.changePct)}</span>
        </span>
      )}
      {btc && (
        <span style={{ flexShrink: 0 }}>
          <span className="amber">BTC </span>
          <span>${formatPrice(btc.price, 0)}</span>
          <span className={pctClass(btc.change24h)}> {formatPct(btc.change24h)}</span>
        </span>
      )}
      {eth && (
        <span style={{ flexShrink: 0 }}>
          <span className="amber">ETH </span>
          <span>${formatPrice(eth.price, 0)}</span>
          <span className={pctClass(eth.change24h)}> {formatPct(eth.change24h)}</span>
        </span>
      )}

      <span style={{ color: '#1e1e1e' }}>│</span>

      {vix && (
        <span style={{ flexShrink: 0 }}>
          <span className="amber">VIX </span>
          <span>{formatPrice(vix.price)}</span>
        </span>
      )}
      {dxy && (
        <span style={{ flexShrink: 0 }}>
          <span className="amber">DXY </span>
          <span>{formatPrice(dxy.price)}</span>
        </span>
      )}
      {tnx && (
        <span style={{ flexShrink: 0 }}>
          <span className="amber">10Y </span>
          <span>{formatPrice(tnx.price)}%</span>
        </span>
      )}

      {/* Spacer */}
      <span style={{ flex: 1 }} />

      {/* Time */}
      <span style={{ color: '#f39f41', fontWeight: 700, flexShrink: 0 }}>
        {time} ET
      </span>
    </div>
  );
}
