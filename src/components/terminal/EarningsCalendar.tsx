'use client';

import useSWR from 'swr';
import { formatEarningsDate } from '@/lib/formatters';
import { glassChip } from '@/lib/glass';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface EarningsItem {
  symbol: string;
  companyName: string;
  earningsDate: string | null;
  epsEstimate: number | null;
  revenueEstimate: number | null;
}

interface EarningsCalendarProps {
  symbols: string[];
}

export default function EarningsCalendar({ symbols }: EarningsCalendarProps) {
  const symbolsParam = symbols.join(',');
  const { data: earnings, isLoading } = useSWR<EarningsItem[]>(
    `/api/earnings?symbols=${symbolsParam}`,
    fetcher,
    { refreshInterval: 3600000 }
  );

  return (
    <div
      className="panel"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div className="panel-header">Earnings Calendar</div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading && (
          <div style={{ padding: '8px', color: '#555', fontSize: '11px' }}>Loading...</div>
        )}
        {!isLoading && (!earnings || earnings.length === 0) && (
          <div style={{ padding: '8px', color: '#555', fontSize: '11px' }}>No upcoming earnings</div>
        )}

        {/* Header */}
        {earnings && earnings.length > 0 && (
          <div
            style={{
              ...glassChip,
              display: 'grid',
              gridTemplateColumns: '48px 48px 1fr 60px',
              padding: '4px 8px',
              fontSize: '10px',
              color: '#555',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span>DATE</span>
            <span>SYM</span>
            <span>COMPANY</span>
            <span style={{ textAlign: 'right' }}>EPS EST</span>
          </div>
        )}

        {earnings?.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 48px 1fr 60px',
              padding: '5px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '11px',
            }}
          >
            <span style={{ color: '#555' }}>{formatEarningsDate(item.earningsDate)}</span>
            <span style={{ color: '#f39f41', fontWeight: 700 }}>{item.symbol}</span>
            <span style={{ color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.companyName}
            </span>
            <span style={{ textAlign: 'right', color: item.epsEstimate ? '#c8c8c8' : '#555' }}>
              {item.epsEstimate ? `$${item.epsEstimate.toFixed(2)}e` : '--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
