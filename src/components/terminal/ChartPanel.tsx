'use client';

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { formatPrice, formatChange, formatPct, formatVolume, getPriceClass } from '@/lib/formatters';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Period = '1d' | '5d' | '1mo' | '3mo' | '1y';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Quote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  prevClose: number | null;
  volume: number | null;
}

interface ChartPanelProps {
  symbol: string;
}

const PERIODS: Period[] = ['1d', '5d', '1mo', '3mo', '1y'];

export default function ChartPanel({ symbol }: ChartPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  const [period, setPeriod] = useState<Period>('1d');

  const { data: chartData } = useSWR<{ candles: Candle[] }>(
    `/api/chart?symbol=${symbol}&period=${period}`,
    fetcher,
    { refreshInterval: period === '1d' ? 60000 : 0, revalidateOnFocus: true }
  );

  const { data: quotes } = useSWR<Quote[]>(
    `/api/quotes?symbols=${symbol}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const quote = quotes?.[0];

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chart: any;

    import('lightweight-charts').then((lc) => {
      if (!chartRef.current) return;

      const { createChart, CrosshairMode } = lc as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createChart: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        CrosshairMode: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      };

      chart = createChart(chartRef.current, {
        layout: {
          background: { color: '#0d0d0d' },
          textColor: '#555555',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
        },
        grid: {
          vertLines: { color: '#111111' },
          horzLines: { color: '#111111' },
        },
        crosshair: {
          mode: CrosshairMode?.Normal ?? 1,
          vertLine: { color: '#f39f41', style: 1, width: 1 },
          horzLine: { color: '#f39f41', style: 1, width: 1 },
        },
        rightPriceScale: {
          borderColor: '#1e1e1e',
        },
        timeScale: {
          borderColor: '#1e1e1e',
          timeVisible: true,
          secondsVisible: false,
        },
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
      });

      // lightweight-charts v5 API: addSeries(SeriesDefinition, options)
      const CandlestickSeries = (lc as Record<string, unknown>).CandlestickSeries;
      const HistogramSeries = (lc as Record<string, unknown>).HistogramSeries;

      let candleSeries;
      let volumeSeries;

      if (CandlestickSeries && typeof chart.addSeries === 'function') {
        candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#4af6c3',
          downColor: '#ff433d',
          borderUpColor: '#4af6c3',
          borderDownColor: '#ff433d',
          wickUpColor: '#4af6c3',
          wickDownColor: '#ff433d',
        });
        volumeSeries = chart.addSeries(HistogramSeries, {
          color: '#333',
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
        });
      } else {
        // Fallback for older API
        candleSeries = chart.addCandlestickSeries?.({
          upColor: '#4af6c3',
          downColor: '#ff433d',
          borderUpColor: '#4af6c3',
          borderDownColor: '#ff433d',
          wickUpColor: '#4af6c3',
          wickDownColor: '#ff433d',
        });
        volumeSeries = chart.addHistogramSeries?.({
          color: '#333',
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
        });
      }

      if (volumeSeries) {
        chart.priceScale('volume')?.applyOptions?.({
          scaleMargins: { top: 0.85, bottom: 0 },
        });
      }

      chartInstanceRef.current = chart;
      candleSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;
    });

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        candleSeriesRef.current = null;
        volumeSeriesRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update chart data
  useEffect(() => {
    if (!chartData?.candles || !candleSeriesRef.current) return;
    const candles = chartData.candles;
    if (candles.length === 0) return;

    const sorted = [...candles].sort((a, b) => a.time - b.time);

    candleSeriesRef.current.setData(sorted.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })));

    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(sorted.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? '#4af6c344' : '#ff433d44',
      })));
    }

    chartInstanceRef.current?.timeScale().fitContent();
  }, [chartData]);

  const priceClass = getPriceClass(quote?.changePct ?? null);

  return (
    <div
      className="panel"
      style={{ gridRow: '3', gridColumn: '2', display: 'flex', flexDirection: 'column' }}
    >
      {/* Chart header */}
      <div
        style={{
          background: '#111',
          borderBottom: '1px solid #1e1e1e',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#f39f41', fontWeight: 700, fontSize: '14px' }}>{symbol}</span>
        {quote && (
          <>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>{formatPrice(quote.price)}</span>
            <span className={priceClass} style={{ fontSize: '12px' }}>
              {formatChange(quote.change)} ({formatPct(quote.changePct)})
            </span>
            <span style={{ color: '#333', fontSize: '11px' }}>│</span>
            <span className="muted" style={{ fontSize: '11px' }}>
              O:<span style={{ color: '#c8c8c8' }}>{formatPrice(quote.open)}</span>{' '}
              H:<span className="price-up">{formatPrice(quote.high)}</span>{' '}
              L:<span className="price-down">{formatPrice(quote.low)}</span>{' '}
              PC:<span style={{ color: '#c8c8c8' }}>{formatPrice(quote.prevClose)}</span>{' '}
              Vol:<span style={{ color: '#c8c8c8' }}>{formatVolume(quote.volume)}</span>
            </span>
          </>
        )}
        <div style={{ flex: 1 }} />
        {/* Period buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background: period === p ? '#f39f41' : '#111',
                color: period === p ? '#0a0a0a' : '#555',
                border: '1px solid ' + (period === p ? '#f39f41' : '#1e1e1e'),
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                borderRadius: '2px',
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}
