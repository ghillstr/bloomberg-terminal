'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface NewsItem {
  headline: string;
  summary: string;
  url: string;
  datetime: number;
  source: string;
}

interface NewsPanelProps {
  symbol: string;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor(Date.now() / 1000 - ts);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NewsPanel({ symbol }: NewsPanelProps) {
  const { data: news, isLoading } = useSWR<NewsItem[]>(
    `/api/news?symbol=${symbol}`,
    fetcher,
    { refreshInterval: 300000 }
  );

  return (
    <div
      className="panel"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div className="panel-header">News — {symbol}</div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading && (
          <div style={{ padding: '8px', color: '#555', fontSize: '11px' }}>Loading news...</div>
        )}
        {!isLoading && (!news || news.length === 0) && (
          <div style={{ padding: '8px', color: '#555', fontSize: '11px' }}>No news available</div>
        )}
        {news?.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '7px 8px',
              borderBottom: '1px solid #111',
              cursor: item.url ? 'pointer' : 'default',
            }}
            onClick={() => item.url && window.open(item.url, '_blank')}
          >
            <div style={{ fontSize: '11px', color: '#c8c8c8', lineHeight: '1.4', marginBottom: '3px' }}>
              {item.headline}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span style={{ color: '#555' }}>{item.source}</span>
              <span style={{ color: '#333' }}>{timeAgo(item.datetime)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
