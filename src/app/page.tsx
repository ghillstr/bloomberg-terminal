'use client';

import { useState } from 'react';
import TopBar from '@/components/terminal/TopBar';
import NavTabs from '@/components/terminal/NavTabs';
import Watchlist from '@/components/terminal/Watchlist';
import ChartPanel from '@/components/terminal/ChartPanel';
import NewsPanel from '@/components/terminal/NewsPanel';
import EarningsCalendar from '@/components/terminal/EarningsCalendar';
import MacroStrip from '@/components/terminal/MacroStrip';
import OptionsChain from '@/components/terminal/OptionsChain';
import MacroPanel from '@/components/terminal/MacroPanel';
import CryptoWatchlist from '@/components/terminal/CryptoWatchlist';

type Tab = 'EQUITY' | 'CRYPTO' | 'OPTIONS' | 'MACRO';

export default function TerminalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('EQUITY');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  return (
    <div className="terminal-layout">
      {/* Row 1: Top Bar */}
      <TopBar />

      {/* Row 2: Nav Tabs */}
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Row 3: Main content */}
      {activeTab === 'EQUITY' && (
        <>
          {/* Left: Watchlist */}
          <Watchlist
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />

          {/* Center: Chart */}
          <ChartPanel symbol={selectedSymbol} />

          {/* Right: News + Earnings */}
          <div
            style={{
              gridRow: '3',
              gridColumn: '3',
              display: 'grid',
              gridTemplateRows: '1fr 1fr',
              overflow: 'hidden',
              borderLeft: '1px solid #1e1e1e',
            }}
          >
            <NewsPanel symbol={selectedSymbol} />
            <EarningsCalendar />
          </div>
        </>
      )}

      {activeTab === 'CRYPTO' && (
        <div
          style={{
            gridRow: '3',
            gridColumn: '1 / -1',
            overflow: 'hidden',
          }}
        >
          <CryptoWatchlist />
        </div>
      )}

      {activeTab === 'OPTIONS' && (
        <div
          style={{
            gridRow: '3',
            gridColumn: '1 / -1',
            overflow: 'hidden',
            background: '#0d0d0d',
            borderTop: '1px solid #1e1e1e',
          }}
        >
          <OptionsChain />
        </div>
      )}

      {activeTab === 'MACRO' && (
        <div
          style={{
            gridRow: '3',
            gridColumn: '1 / -1',
            overflow: 'hidden',
            background: '#0d0d0d',
            borderTop: '1px solid #1e1e1e',
          }}
        >
          <MacroPanel />
        </div>
      )}

      {/* Row 4: Macro Strip */}
      <MacroStrip />
    </div>
  );
}
