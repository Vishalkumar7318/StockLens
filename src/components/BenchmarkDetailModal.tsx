import React, { useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Clock, ShieldCheck, Activity, ArrowUpRight, ArrowDownRight, BarChart2 } from 'lucide-react';
import { BenchmarkIndex, BenchmarkMarketStatus } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface BenchmarkDetailModalProps {
  benchmark: BenchmarkIndex | null;
  marketStatus: BenchmarkMarketStatus | null;
  onClose: () => void;
  onExploreStocks?: (categoryOrSymbol: string) => void;
}

export const BenchmarkDetailModal: React.FC<BenchmarkDetailModalProps> = ({
  benchmark,
  marketStatus,
  onClose,
  onExploreStocks,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!benchmark) return null;

  const isPositive = benchmark.positive;
  const dayRangePct = benchmark.dayHigh !== benchmark.dayLow
    ? Math.min(100, Math.max(0, ((benchmark.price - benchmark.dayLow) / (benchmark.dayHigh - benchmark.dayLow)) * 100))
    : 50;

  const yearHigh = benchmark.fiftyTwoWeekHigh || benchmark.dayHigh * 1.1;
  const yearLow = benchmark.fiftyTwoWeekLow || benchmark.dayLow * 0.9;
  const yearRangePct = yearHigh !== yearLow
    ? Math.min(100, Math.max(0, ((benchmark.price - yearLow) / (yearHigh - yearLow)) * 100))
    : 50;

  // Prepare sparkline chart data
  const chartData = (benchmark.sparkline || []).map((val, idx) => ({
    timeIndex: idx + 1,
    value: val,
  }));

  const minVal = chartData.length > 0 ? Math.min(...chartData.map((d) => d.value)) : benchmark.dayLow;
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : benchmark.dayHigh;
  const padding = (maxVal - minVal) * 0.1 || 10;

  return (
    <div
      id="benchmark-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full text-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                {benchmark.exchange}
              </span>
              {benchmark.category && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  {benchmark.category}
                </span>
              )}
              {marketStatus && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${
                    marketStatus.isLive
                      ? marketStatus.simulationActive
                        ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                      : 'bg-amber-950/40 text-amber-300/90 border-amber-800/50'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      marketStatus.isLive
                        ? marketStatus.simulationActive
                          ? 'bg-purple-400 animate-pulse'
                          : 'bg-emerald-400 animate-pulse'
                        : 'bg-amber-400'
                    }`}
                  />
                  {marketStatus.simulationActive
                    ? 'SIMULATION LIVE'
                    : marketStatus.status === 'OPEN'
                    ? 'LIVE'
                    : 'MARKET CLOSED'}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{benchmark.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{benchmark.fullName}</p>
          </div>

          <button
            id="btn-close-benchmark-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Market Closed Notice Banner */}
          {marketStatus && !marketStatus.isLive && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90">
              <span className="p-1 rounded bg-amber-900/50 text-amber-300 font-mono text-[10px]">🔒 FROZEN</span>
              <div>
                <span className="font-semibold text-amber-100">Market is currently closed:</span>{' '}
                Price is frozen at official market close. Real-time ticks pause until market opens ({marketStatus.nextSession}).
              </div>
            </div>
          )}

          {/* Price & Change Block */}
          <div className="flex items-baseline justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                {marketStatus?.isLive ? 'Current Real-Time Level (1s Feed)' : 'Official Closing Level (Frozen)'}
              </div>
              <div className="text-3xl font-mono font-bold text-white tracking-tight">
                {benchmark.formattedPrice}
              </div>
            </div>

            <div className="text-right">
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-mono font-semibold text-sm ${
                  isPositive
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{benchmark.formattedChange}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Prev Close: {benchmark.previousClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Intraday Trend Sparkline (Recharts) */}
          {chartData.length > 1 && (
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                  Intraday Tick Trajectory
                </span>
                <span className="font-mono text-[11px] text-slate-500">5-min intervals</span>
              </div>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`gradient-${benchmark.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={isPositive ? '#10b981' : '#f43f5e'}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor={isPositive ? '#10b981' : '#f43f5e'}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={[minVal - padding, maxVal + padding]} />
                    <XAxis hide dataKey="timeIndex" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs text-white font-mono shadow-md">
                              ₹{Number(payload[0].value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={isPositive ? '#10b981' : '#f43f5e'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#gradient-${benchmark.symbol})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Range Sliders (Day's Range & 52-Week Range) */}
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-xs">
            {/* Day Range */}
            <div>
              <div className="flex justify-between text-slate-400 font-medium mb-1.5">
                <span>Day's Range</span>
                <span className="font-mono text-slate-300">
                  {dayRangePct.toFixed(0)}% of daily range
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${dayRangePct}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[11px] text-slate-400 mt-1">
                <span>L: {benchmark.dayLow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span>H: {benchmark.dayHigh.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* 52-Week Range */}
            <div>
              <div className="flex justify-between text-slate-400 font-medium mb-1.5">
                <span>52-Week Range</span>
                <span className="font-mono text-slate-300">
                  {yearRangePct.toFixed(0)}% from 52W low
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${yearRangePct}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[11px] text-slate-400 mt-1">
                <span>52W L: {yearLow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span>52W H: {yearHigh.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {benchmark.description && (
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-800/60">
              {benchmark.description}
            </p>
          )}

          {/* Timestamps & Official Status */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>IST Time: {marketStatus?.istTime || 'Real-time Feed'}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direct Exchange Synced</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Click outside or press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">ESC</kbd> to exit
          </div>
          <div className="flex items-center gap-2">
            {onExploreStocks && (
              <button
                id="btn-explore-benchmark-stocks"
                onClick={() => {
                  onClose();
                  onExploreStocks(benchmark.name);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Search {benchmark.name} Stocks</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="btn-done-benchmark-modal"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
