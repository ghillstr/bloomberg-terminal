'use client';

import { glassBar } from '@/lib/glass';

type Tab = 'EQUITY' | 'CRYPTO' | 'OPTIONS' | 'MACRO';

interface NavTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: Tab[] = ['EQUITY', 'CRYPTO', 'OPTIONS', 'MACRO'];

export default function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  return (
    <div
      style={{
        ...glassBar,
        gridColumn: '1 / -1',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'stretch',
        padding: '0 4px',
        gap: '4px',
      }}
    >
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            background: activeTab === tab ? '#f39f41' : 'transparent',
            color: activeTab === tab ? '#0a0a0a' : '#555555',
            border: 'none',
            borderRadius: 6,
            boxShadow: activeTab === tab ? '0 0 14px rgba(243, 159, 65, 0.45)' : 'none',
            cursor: 'pointer',
            padding: '0 16px',
            margin: '4px 0',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            fontFamily: 'JetBrains Mono, monospace',
            height: 'calc(100% - 8px)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            if (activeTab !== tab) {
              (e.target as HTMLElement).style.color = '#f39f41';
            }
          }}
          onMouseLeave={e => {
            if (activeTab !== tab) {
              (e.target as HTMLElement).style.color = '#555555';
            }
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
