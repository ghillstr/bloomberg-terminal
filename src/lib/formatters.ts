export function formatPrice(price: number | null | undefined, decimals = 2): string {
  if (price == null || isNaN(price)) return '--';
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatChange(change: number | null | undefined): string {
  if (change == null || isNaN(change)) return '--';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

export function formatPct(pct: number | null | undefined): string {
  if (pct == null || isNaN(pct)) return '--';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatVolume(vol: number | null | undefined): string {
  if (vol == null || isNaN(vol)) return '--';
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toString();
}

export function formatMarketCap(mc: number | null | undefined): string {
  if (mc == null || isNaN(mc)) return '--';
  if (mc >= 1e12) return `${(mc / 1e12).toFixed(2)}T`;
  if (mc >= 1e9) return `${(mc / 1e9).toFixed(1)}B`;
  if (mc >= 1e6) return `${(mc / 1e6).toFixed(1)}M`;
  return mc.toString();
}

export function getPriceClass(change: number | null | undefined): string {
  if (change == null) return 'price-neutral';
  if (change > 0) return 'price-up';
  if (change < 0) return 'price-down';
  return 'price-neutral';
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/New_York',
  });
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = nyTime.getDay();
  const hours = nyTime.getHours();
  const minutes = nyTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  if (day === 0 || day === 6) return false;
  return totalMinutes >= 570 && totalMinutes < 960; // 9:30 AM - 4:00 PM
}

export function formatEarningsDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
