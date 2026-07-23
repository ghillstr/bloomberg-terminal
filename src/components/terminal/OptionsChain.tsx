'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { formatPrice } from '@/lib/formatters';
import { DEFAULT_WATCHLIST } from '@/lib/symbols';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface OptionContract {
  strike: number | null;
  bid: number | null;
  ask: number | null;
  iv: number | null;
  delta: number | null;
  gamma: number | null;
  oi: number | null;
  volume: number | null;
  lastPrice: number | null;
  inTheMoney: boolean;
}

interface OptionsData {
  symbol: string;
  expirationDate: string | null;
  calls: OptionContract[];
  puts: OptionContract[];
  error?: string;
}

export default function OptionsChain() {
  const [symbol, setSymbol] = useState('AAPL');
  const [view, setView] = useState<'calls' | 'puts' | 'both'>('both');

  const { data, isLoading, error } = useSWR<OptionsData>(
    `/api/options?symbol=${symbol}`,
    fetcher
  );

  const thStyle: React.CSSProperties = {
    padding: '4px 6px',
    color: '#f39f41',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textAlign: 'right',
    borderBottom: '1px solid #1e1e1e',
    whiteSpace: 'nowrap',
  };

  const tdStyle = (itm: boolean): React.CSSProperties => ({
    padding: '3px 6px',
    fontSize: '11px',
    textAlign: 'right',
    color: itm ? '#c8c8c8' : '#555',
    borderBottom: '1px solid #0f0f0f',
  });

  const renderTable = (contracts: OptionContract[], type: 'CALLS' | 'PUTS') => (
    <div>
      <div style={{ padding: '4px 8px', background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
        <span style={{ color: type === 'CALLS' ? '#4af6c3' : '#ff433d', fontWeight: 700, fontSize: '11px' }}>
          {type}
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['STRIKE', 'BID', 'ASK', 'LAST', 'IV%', 'DELTA', 'OI', 'VOL'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contracts.slice(0, 20).map((c, i) => (
            <tr key={i} style={{ background: c.inTheMoney ? '#0d1a0d' : 'transparent' }}>
              <td style={{ ...tdStyle(c.inTheMoney), color: '#f39f41', fontWeight: 700 }}>
                {c.strike?.toFixed(0) ?? '--'}
              </td>
              <td style={tdStyle(c.inTheMoney)}>{c.bid?.toFixed(2) ?? '--'}</td>
              <td style={tdStyle(c.inTheMoney)}>{c.ask?.toFixed(2) ?? '--'}</td>
              <td style={tdStyle(c.inTheMoney)}>{c.lastPrice?.toFixed(2) ?? '--'}</td>
              <td style={tdStyle(c.inTheMoney)}>{c.iv != null ? `${c.iv.toFixed(1)}%` : '--'}</td>
              <td style={tdStyle(c.inTheMoney)}>{c.delta?.toFixed(2) ?? '--'}</td>
              <td style={tdStyle(c.inTheMoney)}>{c.oi?.toLocaleString() ?? '--'}</td>
              <td style={tdStyle(c.inTheMoney)}>{c.volume?.toLocaleString() ?? '--'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Controls */}
      <div
        style={{
          background: '#111',
          borderBottom: '1px solid #1e1e1e',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#f39f41', fontWeight: 700 }}>OPTIONS CHAIN</span>
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          style={{
            background: '#1a1a1a',
            color: '#f39f41',
            border: '1px solid #333',
            padding: '2px 6px',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            cursor: 'pointer',
          }}
        >
          {DEFAULT_WATCHLIST.map(s => (
            <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['both', 'calls', 'puts'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? '#f39f41' : 'transparent',
                color: view === v ? '#0a0a0a' : '#555',
                border: '1px solid ' + (view === v ? '#f39f41' : '#333'),
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                borderRadius: '2px',
              }}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
        {data?.expirationDate && (
          <span style={{ color: '#555', fontSize: '11px' }}>
            Exp: <span style={{ color: '#c8c8c8' }}>{data.expirationDate}</span>
          </span>
        )}
      </div>

      {/* Table area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading && (
          <div style={{ padding: '16px', color: '#555', textAlign: 'center' }}>Loading options chain...</div>
        )}
        {(error || data?.error) && !isLoading && (
          <div style={{ padding: '16px', color: '#ff433d', textAlign: 'center' }}>
            Failed to load options chain for {symbol}
          </div>
        )}
        {data && !data.error && (
          <div style={{ display: 'flex', flexDirection: view === 'both' ? 'row' : 'column' }}>
            {(view === 'calls' || view === 'both') && renderTable(data.calls, 'CALLS')}
            {(view === 'puts' || view === 'both') && renderTable(data.puts, 'PUTS')}
          </div>
        )}
      </div>
    </div>
  );
}
