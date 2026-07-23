'use client';

import useSWR from 'swr';
import { formatPrice, formatPct, getPriceClass } from '@/lib/formatters';
import { glassHeader, glassPanel } from '@/lib/glass';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface MacroItem {
  value: number | null;
  change: number | null;
  changePct: number | null;
  label: string;
  unit: string;
}

const YIELD_SYMBOLS = ['^IRX', '^TNX', '^TYX'];
const YIELD_LABELS: Record<string, string> = {
  '^IRX': '3M',
  '^TNX': '10Y',
  '^TYX': '30Y',
};

export default function MacroPanel() {
  const { data: macro } = useSWR<Record<string, MacroItem>>(
    '/api/macro',
    fetcher,
    { refreshInterval: 60000 }
  );

  const displayItems = [
    { key: '^TNX', label: '10Y Treasury Yield' },
    { key: '^TYX', label: '30Y Treasury Yield' },
    { key: '^IRX', label: '3M T-Bill Rate' },
    { key: '^VIX', label: 'VIX (Volatility Index)' },
    { key: 'DX-Y.NYB', label: 'US Dollar Index (DXY)' },
    { key: 'GC=F', label: 'Gold Futures' },
    { key: 'CL=F', label: 'Crude Oil (WTI)' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ ...glassHeader, padding: '6px 10px', flexShrink: 0 }}>
        <span style={{ color: '#f39f41', fontWeight: 700 }}>MACRO INDICATORS</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {/* Indicators grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {displayItems.map(({ key, label }) => {
            const item = macro?.[key];
            const priceClass = getPriceClass(item?.changePct ?? null);
            const isGold = key === 'GC=F' || key === 'CL=F';

            return (
              <div
                key={key}
                style={{
                  ...glassPanel,
                  padding: '10px',
                }}
              >
                <div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {label}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#c8c8c8' }}>
                  {isGold ? '$' : ''}{formatPrice(item?.value ?? null, 2)}
                  {!isGold && item != null ? '%' : ''}
                </div>
                {item?.changePct != null && (
                  <div className={priceClass} style={{ fontSize: '11px', marginTop: '2px' }}>
                    {formatPct(item.changePct)} today
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Yield curve section */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              color: '#f39f41',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}
          >
            Yield Curve (3M / 10Y / 30Y)
          </div>

          {/* Bar chart */}
          <div
            style={{
              ...glassPanel,
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-end',
              height: '100px',
              padding: '8px 12px',
            }}
          >
            {YIELD_SYMBOLS.map(sym => {
              const item = macro?.[sym];
              const val = item?.value ?? 0;
              const maxVal = 7;
              const pct = Math.min((val / maxVal) * 100, 100);
              const tnx = macro?.['^TNX']?.value ?? 0;
              const irx = macro?.['^IRX']?.value ?? 0;
              const isInverted = sym === '^IRX' && tnx < irx;

              return (
                <div key={sym} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ color: '#c8c8c8', fontSize: '11px', fontWeight: 700 }}>
                    {val > 0 ? `${val.toFixed(2)}%` : '--'}
                  </span>
                  <div
                    style={{
                      width: '60%',
                      height: `${Math.max(pct, 5)}%`,
                      background: isInverted ? '#ff433d' : '#f39f41',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span style={{ color: '#555', fontSize: '10px' }}>{YIELD_LABELS[sym]}</span>
                </div>
              );
            })}
          </div>

          {/* Spread indicator */}
          {macro && macro['^TNX'] && macro['^IRX'] && (
            <div style={{ ...glassPanel, marginTop: '8px', padding: '6px 10px', fontSize: '11px' }}>
              <span style={{ color: '#555' }}>10Y−3M Spread: </span>
              {(() => {
                const spread = (macro['^TNX']?.value ?? 0) - (macro['^IRX']?.value ?? 0);
                return (
                  <>
                    <span style={{ color: spread < 0 ? '#ff433d' : '#4af6c3', fontWeight: 700 }}>
                      {spread.toFixed(2)}%
                    </span>
                    <span style={{ color: '#555', marginLeft: '8px' }}>
                      {spread < 0 ? '⚠ INVERTED (Recession signal)' : 'Normal'}
                    </span>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* FRED note */}
        <div style={{ ...glassPanel, padding: '8px 10px', color: '#555', fontSize: '11px' }}>
          Tip: Add <span style={{ color: '#f39f41' }}>FRED_API_KEY</span> to .env.local for CPI, GDP, and unemployment data from the St. Louis Federal Reserve.
        </div>
      </div>
    </div>
  );
}
