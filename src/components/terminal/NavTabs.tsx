'use client';

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
        gridColumn: '1 / -1',
        background: '#080808',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'stretch',
        padding: '0 4px',
        gap: '2px',
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
            cursor: 'pointer',
            padding: '0 16px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            fontFamily: 'JetBrains Mono, monospace',
            height: '100%',
            transition: 'all 0.1s',
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
