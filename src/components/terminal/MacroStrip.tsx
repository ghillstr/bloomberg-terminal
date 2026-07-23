'use client';

import useSWR from 'swr';
import { formatPrice, formatPct, getPriceClass } from '@/lib/formatters';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface MacroItem {
  value: number | null;
  change: number | null;
  changePct: number | null;
  label: string;
  unit: string;
}

export default function MacroStrip() {
  const { data: macro } = useSWR<Record<string, MacroItem>>(
    '/api/macro',
    fetcher,
    { refreshInterval: 60000 }
  );

  const items = [
    { key: '^TNX', label: '10Y' },
    { key: '^TYX', label: '30Y' },
    { key: '^IRX', label: '3M' },
    { key: '^VIX', label: 'VIX' },
    { key: 'DX-Y.NYB', label: 'DXY' },
    { key: 'GC=F', label: 'GOLD' },
    { key: 'CL=F', label: 'OIL' },
  ];

  return (
    <div
      style={{
        gridColumn: '1 / -1',
        gridRow: '4',
        background: '#050505',
        borderTop: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '20px',
        fontSize: '11px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: '#f39f41', fontWeight: 700, fontSize: '10px', letterSpacing: '1px' }}>MACRO</span>
      <span style={{ color: '#1e1e1e' }}>│</span>

      {items.map(({ key, label }) => {
        const item = macro?.[key];
        const priceClass = getPriceClass(item?.changePct ?? null);
        const isGold = key === 'GC=F';
        const isOil = key === 'CL=F';

        return (
          <span key={key} style={{ flexShrink: 0 }}>
            <span className="amber">{label} </span>
            {isGold || isOil ? (
              <span>${formatPrice(item?.value ?? null, 2)}</span>
            ) : (
              <span>{formatPrice(item?.value ?? null, 2)}{['%'].includes(item?.unit ?? '') ? '%' : ''}</span>
            )}
            {item?.changePct != null && (
              <span className={priceClass}> {formatPct(item.changePct)}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
