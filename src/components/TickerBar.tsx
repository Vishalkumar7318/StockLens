import React, { useEffect, useState, useRef } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Gauge,
  Info,
} from 'lucide-react';
import { BenchmarkIndex, BenchmarkMarketStatus, BenchmarkResponse } from '../types';
import { INDIAN_BENCHMARK_CONFIGS } from '../services/benchmarkService';
import { BenchmarkDetailModal } from './BenchmarkDetailModal';

interface TickerBarProps {
  onSelectStock?: (symbol: string) => void;
  onExploreSearch?: (query: string) => void;
}

export const TickerBar: React.FC<TickerBarProps> = ({
  onExploreSearch,
}) => {
  // Initial fallback benchmarks
  const initialBenchmarks: BenchmarkIndex[] = INDIAN_BENCHMARK_CONFIGS.map((c) => {
    const change = c.basePrice - c.basePrevClose;
    const changePercent = (change / c.basePrevClose) * 100;
    const positive = change >= 0;
    return {
      symbol: c.symbol,
      name: c.name,
      fullName: c.fullName,
      exchange: c.exchange,
      price: c.basePrice,
      formattedPrice: c.basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      formattedChange: `${positive ? '+' : ''}${change.toFixed(2)} (${positive ? '+' : ''}${changePercent.toFixed(2)}%)`,
      positive,
      dayHigh: c.baseDayHigh,
      dayLow: c.baseDayLow,
      previousClose: c.basePrevClose,
      fiftyTwoWeekHigh: c.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: c.fiftyTwoWeekLow,
      sparkline: [c.basePrevClose, c.baseDayLow, (c.basePrice + c.basePrevClose) / 2, c.baseDayHigh, c.basePrice],
      lastUpdated: new Date().toISOString(),
      category: c.category,
      description: c.description,
    };
  });

  const [benchmarks, setBenchmarks] = useState<BenchmarkIndex[]>(initialBenchmarks);
  const [marketStatus, setMarketStatus] = useState<BenchmarkMarketStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<'normal' | 'fast'>('normal');
  const [flashTicks, setFlashTicks] = useState<Record<string, 'up' | 'down'>>({});
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkIndex | null>(null);
  const [currentTimeIST, setCurrentTimeIST] = useState<string>('');
  const [isSimulatingLoading, setIsSimulatingLoading] = useState<boolean>(false);

  const prevPricesRef = useRef<Record<string, number>>({});
  const flashTimeoutRef = useRef<Record<string, any>>({});

  // Toggle simulation mode (Allows testing 1-second live ticks even when Indian exchanges are closed)
  const handleToggleSimulation = async () => {
    setIsSimulatingLoading(true);
    try {
      const nextMode = marketStatus?.simulationActive ? 'auto' : 'simulate_live';
      const res = await fetch('/api/benchmarks/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: nextMode }),
      });
      if (res.ok) {
        await fetchBenchmarks(true);
      }
    } catch (e) {
      console.error('Error toggling simulation mode:', e);
    } finally {
      setIsSimulatingLoading(false);
    }
  };

  // Real-time IST clock update every second
  useEffect(() => {
    const updateIST = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utc + 3600000 * 5.5);

      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const seconds = istDate.getSeconds();
      const hours12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const pad = (n: number) => n.toString().padStart(2, '0');

      setCurrentTimeIST(`${pad(hours12)}:${pad(minutes)}:${pad(seconds)} ${ampm} IST`);
    };

    updateIST();
    const interval = setInterval(updateIST, 1000);
    return () => clearInterval(interval);
  }, []);

  // Process incoming benchmark tick update
  const processIncomingBenchmarks = (data: BenchmarkResponse) => {
    if (!data || !data.benchmarks || data.benchmarks.length === 0) return;

    // Detect tick price changes and trigger green/red flash highlights
    const newFlashes: Record<string, 'up' | 'down'> = {};

    data.benchmarks.forEach((b) => {
      const prev = prevPricesRef.current[b.symbol];
      if (prev !== undefined && prev !== b.price) {
        newFlashes[b.symbol] = b.price > prev ? 'up' : 'down';
      }
      prevPricesRef.current[b.symbol] = b.price;
    });

    if (Object.keys(newFlashes).length > 0) {
      setFlashTicks((prev) => ({ ...prev, ...newFlashes }));

      // Clear flashes after 750ms so next second's tick animates cleanly
      Object.keys(newFlashes).forEach((sym) => {
        if (flashTimeoutRef.current[sym]) clearTimeout(flashTimeoutRef.current[sym]);
        flashTimeoutRef.current[sym] = setTimeout(() => {
          setFlashTicks((prev) => {
            const copy = { ...prev };
            delete copy[sym];
            return copy;
          });
        }, 750);
      });
    }

    setBenchmarks(data.benchmarks);
    if (data.marketStatus) {
      setMarketStatus(data.marketStatus);
    }
  };

  // Fetch live benchmarks (1-second polling or manual trigger)
  const fetchBenchmarks = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);

    try {
      const res = await fetch('/api/benchmarks');
      if (res.ok) {
        const data: BenchmarkResponse = await res.json();
        if (data.success && data.benchmarks && data.benchmarks.length > 0) {
          processIncomingBenchmarks(data);
        }
      }
    } catch (err) {
      console.warn('Real-time benchmark fetch warning:', err);
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    }
  };

  // Real-time engine: SSE push every second + 1000ms active polling heartbeat
  useEffect(() => {
    let sse: EventSource | null = null;
    let sseWorking = false;

    try {
      sse = new EventSource('/api/benchmarks/stream');
      sse.onmessage = (event) => {
        try {
          const data: BenchmarkResponse = JSON.parse(event.data);
          if (data && data.success) {
            sseWorking = true;
            processIncomingBenchmarks(data);
          }
        } catch (e) {
          // ignore parsing error
        }
      };
      sse.onerror = () => {
        sseWorking = false;
      };
    } catch (e) {
      sseWorking = false;
    }

    // Initial instant fetch
    fetchBenchmarks();

    // 1-Second (1000ms) interval: guarantees continuous 1-second updates even if SSE is buffered
    const oneSecondInterval = setInterval(() => {
      if (!sseWorking) {
        fetchBenchmarks();
      }
    }, 1000);

    return () => {
      clearInterval(oneSecondInterval);
      if (sse) sse.close();
    };
  }, []);

  // Duplicate items for continuous seamless loop without gap
  const marqueeItems = [...benchmarks, ...benchmarks];

  // Marquee CSS class based on controls
  const marqueeAnimationClass = !isPlaying
    ? 'animate-marquee-paused'
    : speed === 'fast'
    ? 'animate-marquee-fast'
    : 'animate-marquee-infinite';

  return (
    <>
      <section
        id="realtime-indian-benchmarks-bar"
        aria-label="Indian Benchmark Real-Time Ticker"
        className="bg-slate-950 text-slate-200 text-xs border-b border-slate-800/90 shadow-inner select-none relative z-30"
      >
        <div className="max-w-[1700px] mx-auto flex items-center h-10 px-2 sm:px-4">
          
          {/* Static Left Header: INDIAN BENCHMARKS + LIVE status */}
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800/80 shrink-0 z-10 bg-slate-950">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
              <span className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              </span>
              <span className="hidden sm:inline">INDIAN BENCHMARKS:</span>
              <span className="sm:hidden font-mono">INDICES:</span>
            </div>

            {/* Status Indicator & Market State */}
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono whitespace-nowrap transition-colors ${
                marketStatus?.isLive
                  ? marketStatus.simulationActive
                    ? 'bg-purple-950/80 border-purple-800/80 text-purple-300'
                    : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  marketStatus?.isLive
                    ? marketStatus.simulationActive
                      ? 'bg-purple-400 animate-ping'
                      : 'bg-emerald-400 animate-ping'
                    : 'bg-amber-400'
                }`}
                style={marketStatus?.isLive ? { animationDuration: '1s' } : undefined}
              />
              <span className="font-bold tracking-wide">
                {marketStatus?.simulationActive
                  ? 'SIM LIVE 1s'
                  : marketStatus?.status === 'OPEN'
                  ? 'LIVE 1s'
                  : 'CLOSED'}
              </span>
            </div>

            {/* Sub-badge: 1s Live indicator or Closed Notice */}
            <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-800/80 text-[9px] font-mono whitespace-nowrap">
              {marketStatus?.isLive ? (
                marketStatus.simulationActive ? (
                  <span className="text-purple-300 flex items-center gap-1 font-semibold">
                    <span>⚡ Sim 1s Tick</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>⚡ 1s Tick</span>
                  </span>
                )
              ) : (
                <span className="text-slate-400 flex items-center gap-1.5 font-sans" title="Market is closed. Benchmark values are completely frozen at the official closing prices.">
                  <span className="text-amber-400 font-mono font-bold">🔒 Frozen</span>
                  <span className="text-slate-600">•</span>
                  <span>{marketStatus?.nextSession || 'Opens 09:15 AM IST'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Running Marquee Ticker Track */}
          <div className="flex-1 overflow-hidden relative group h-full flex items-center">
            {/* Left & Right gradient fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

            {/* Marquee Content */}
            <div
              id="benchmarks-marquee-track"
              className={`${marqueeAnimationClass} gap-6 items-center pl-4 py-1`}
              title="Click any index to view live chart & details. Hover to pause running tape."
            >
              {marqueeItems.map((item, idx) => {
                const flash = flashTicks[item.symbol];
                const flashClass =
                  flash === 'up'
                    ? 'flash-tick-up'
                    : flash === 'down'
                    ? 'flash-tick-down'
                    : '';

                return (
                  <button
                    key={`${item.symbol}-${idx}`}
                    id={`benchmark-card-${item.symbol.replace(/[^a-zA-Z0-9]/g, '')}-${idx}`}
                    onClick={() => setSelectedBenchmark(item)}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-md transition-all duration-150 cursor-pointer text-left hover:bg-slate-900/90 hover:border-slate-700 border border-transparent whitespace-nowrap font-mono text-[11px] ${flashClass}`}
                  >
                    {/* Symbol / Exchange */}
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                        {item.exchange}
                      </span>
                      {item.name}
                    </span>

                    {/* Price with tabular nums */}
                    <span className="font-bold text-white tracking-tight">
                      {item.formattedPrice}
                    </span>

                    {/* Net Change with Icon */}
                    <span
                      className={`flex items-center gap-0.5 font-semibold text-[10px] ${
                        item.positive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.positive ? (
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                      )}
                      <span>{item.formattedChange}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Static Controls & IST Clock */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800/80 shrink-0 z-10 bg-slate-950 font-mono text-[11px]">
            {/* Live IST Clock */}
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-800 text-[10px]">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>{currentTimeIST || marketStatus?.istTime || 'IST Active'}</span>
            </div>

            {/* Simulation Toggle Button (Demo 1s ticks when market is closed) */}
            <button
              id="btn-toggle-benchmark-simulation"
              onClick={handleToggleSimulation}
              disabled={isSimulatingLoading}
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                marketStatus?.simulationActive
                  ? 'bg-purple-950/90 border-purple-600/80 text-purple-200 hover:bg-purple-900/80 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
              }`}
              title={
                marketStatus?.simulationActive
                  ? 'Simulation active: Click to turn OFF simulation and freeze prices at real market close'
                  : 'Market is closed: Click to toggle demo 1-second live ticks'
              }
            >
              <span>{isSimulatingLoading ? '...' : marketStatus?.simulationActive ? '🧪 Sim: ON' : '🧪 Sim: OFF'}</span>
            </button>

            {/* Speed Toggle (Normal / Fast) */}
            <button
              id="btn-toggle-ticker-speed"
              onClick={() => setSpeed((prev) => (prev === 'normal' ? 'fast' : 'normal'))}
              className={`hidden md:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-sans font-medium transition-colors ${
                speed === 'fast'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
              title={`Toggle Running Speed (Current: ${speed === 'fast' ? '1.5x Fast' : '1.0x Normal'})`}
            >
              <Gauge className="w-3 h-3" />
              <span>{speed === 'fast' ? '1.5x' : '1.0x'}</span>
            </button>

            {/* Play / Pause Toggle */}
            <button
              id="btn-toggle-ticker-play"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title={isPlaying ? 'Pause running ticker' : 'Resume running ticker'}
              aria-label={isPlaying ? 'Pause ticker' : 'Play ticker'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>

            {/* Manual Refresh Button */}
            <button
              id="btn-refresh-benchmarks"
              onClick={() => fetchBenchmarks(true)}
              disabled={isRefreshing}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors disabled:opacity-50"
              title="Fetch latest real-time benchmark ticks"
              aria-label="Refresh benchmarks"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Mini Info Button */}
            <button
              id="btn-benchmarks-info"
              onClick={() => setSelectedBenchmark(benchmarks[0])}
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[10px] font-sans transition-colors"
              title="View benchmark index insights & intraday chart"
            >
              <Info className="w-3 h-3" />
              <span>Details</span>
            </button>
          </div>

        </div>
      </section>

      {/* Benchmark Detail Modal */}
      {selectedBenchmark && (
        <BenchmarkDetailModal
          benchmark={benchmarks.find((b) => b.symbol === selectedBenchmark.symbol) || selectedBenchmark}
          marketStatus={marketStatus}
          onClose={() => setSelectedBenchmark(null)}
          onExploreStocks={(name) => {
            if (onExploreSearch) {
              onExploreSearch(name);
            }
          }}
        />
      )}
    </>
  );
};
