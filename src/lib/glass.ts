import type { CSSProperties } from 'react';

/** Full-width translucent bar (topbar, nav, macro strip) */
export const glassBar: CSSProperties = {
  background: 'rgba(16, 16, 18, 0.55)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
};

/** Card/panel surface (indicator tiles, sub-sections) */
export const glassPanel: CSSProperties = {
  background: 'rgba(18, 18, 20, 0.5)',
  backdropFilter: 'blur(18px) saturate(150%)',
  WebkitBackdropFilter: 'blur(18px) saturate(150%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 8,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
};

/** Header strips inside a .panel (already clipped by parent's radius) */
export const glassHeader: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.035)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
};

/** Small chips / column-header rows */
export const glassChip: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

/** Text inputs / selects */
export const glassInput: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
};

/** Subtle divider color for row borders (replaces flat near-black lines) */
export const glassDivider = '1px solid rgba(255, 255, 255, 0.06)';
