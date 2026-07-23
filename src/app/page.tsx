'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/terminal/TopBar';
import NavTabs from '@/components/terminal/NavTabs';
import Watchlist, { type WatchlistItem } from '@/components/terminal/Watchlist';
import ChartPanel from '@/components/terminal/ChartPanel';
import NewsPanel from '@/components/terminal/NewsPanel';
import EarningsCalendar from '@/components/terminal/EarningsCalendar';
import MacroStrip from '@/components/terminal/MacroStrip';
import OptionsChain from '@/components/terminal/OptionsChain';
import MacroPanel from '@/components/terminal/MacroPanel';
import CryptoWatchlist from '@/components/terminal/CryptoWatchlist';
import { DEFAULT_WATCHLIST } from '@/lib/symbols';

type Tab = 'EQUITY' | 'CRYPTO' | 'OPTIONS' | 'MACRO';

const STORAGE_KEY = 'bloomberg-watchlist';

function loadWatchlist(): WatchlistItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_WATCHLIST;
}

export default function TerminalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('EQUITY');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(DEFAULT_WATCHLIST);

  // Load from localStorage once on mount
  useEffect(() => {
    setWatchlist(loadWatchlist());
  }, []);

  // Save whenever watchlist changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const handleAdd = (item: WatchlistItem) => {
    setWatchlist(prev => [...prev, item]);
  };

  const handleRemove = (symbol: string) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
  };

  return (
    <div className="terminal-layout">
      <TopBar />
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Watchlist always rendered — just hidden when not on EQUITY tab */}
      <div style={{ display: activeTab === 'EQUITY' ? 'contents' : 'none' }}>
        <Watchlist
          watchlist={watchlist}
          onAdd={handleAdd}
          onRemove={handleRemove}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
        />
        <ChartPanel symbol={selectedSymbol} />
        <div
          style={{
            gridRow: '3',
            gridColumn: '3',
            display: 'grid',
            gridTemplateRows: '1fr 1fr',
            gap: '6px',
            overflow: 'hidden',
          }}
        >
          <NewsPanel symbol={selectedSymbol} />
          <EarningsCalendar symbols={watchlist.map(w => w.symbol)} />
        </div>
      </div>

      {activeTab === 'CRYPTO' && (
        <div className="panel" style={{ gridRow: '3', gridColumn: '1 / -1', overflow: 'hidden' }}>
          <CryptoWatchlist />
        </div>
      )}
      {activeTab === 'OPTIONS' && (
        <div className="panel" style={{ gridRow: '3', gridColumn: '1 / -1', overflow: 'hidden' }}>
          <OptionsChain watchlist={watchlist} />
        </div>
      )}
      {activeTab === 'MACRO' && (
        <div className="panel" style={{ gridRow: '3', gridColumn: '1 / -1', overflow: 'hidden' }}>
          <MacroPanel />
        </div>
      )}

      <MacroStrip />
    </div>
  );
}
