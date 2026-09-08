import React, { useState } from 'react';
import { ChartDataPoint } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Activity, Layers, Eye, RefreshCw } from 'lucide-react';

interface StockChartProps {
  chartData: Record<string, ChartDataPoint[]>;
  currentPrice: number;
  levels: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
  };
}

export const StockChart: React.FC<StockChartProps> = ({ chartData, currentPrice, levels }) => {
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y'>('1M');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

  // Indicators toggle
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showEma100, setShowEma100] = useState(false);
  const [showEma200, setShowEma200] = useState(false);
  const [showVwap, setShowVwap] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showLevels, setShowLevels] = useState(true);

  const activeData = chartData[timeframe] || chartData['1M'] || [];

  // Determine y-domain range
  const prices = activeData.map((d) => d.close);
  const minPrice = Math.min(...prices, levels.support2) * 0.98;
  const maxPrice = Math.max(...prices, levels.resistance2) * 1.02;

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
      {/* Chart Control Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h3 className="font-extrabold text-slate-900 text-base">Interactive Price & Volume Chart</h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {timeframe} Timeframe
          </span>
        </div>

        {/* Timeframe & Chart Style Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-extrabold">
            {(['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  timeframe === tf ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-extrabold">
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartType === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartType === 'candlestick' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              Candle
            </button>
          </div>
        </div>
      </div>

      {/* Indicator Checkboxes Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-600 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/80">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-extrabold mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-indigo-600" /> Technical Overlays:
        </span>

        <button
          onClick={() => setShowEma20(!showEma20)}
          className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
            showEma20 ? 'bg-indigo-100/80 text-indigo-800 border-indigo-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span> 20 EMA
        </button>

        <button
          onClick={() => setShowEma50(!showEma50)}
          className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
            showEma50 ? 'bg-amber-100/80 text-amber-900 border-amber-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> 50 EMA
        </button>

        <button
          onClick={() => setShowEma100(!showEma100)}
          className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
            showEma100 ? 'bg-purple-100/80 text-purple-900 border-purple-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-600"></span> 100 EMA
        </button>

        <button
          onClick={() => setShowEma200(!showEma200)}
          className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
            showEma200 ? 'bg-rose-100/80 text-rose-900 border-rose-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-600"></span> 200 EMA
        </button>

        <button
          onClick={() => setShowVwap(!showVwap)}
          className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
            showVwap ? 'bg-teal-100/80 text-teal-900 border-teal-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-teal-500"></span> VWAP
        </button>

        <button
          onClick={() => setShowBollinger(!showBollinger)}
          className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
            showBollinger ? 'bg-sky-100/80 text-sky-900 border-sky-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-500"></span> Bollinger
        </button>

        <button
          onClick={() => setShowLevels(!showLevels)}
          className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
            showLevels ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          <Eye className="w-3 h-3 text-emerald-600" /> S/R Levels
        </button>
      </div>

      {/* Main Interactive Recharts Stage */}
      <div className="w-full h-80 sm:h-96 pt-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
            <YAxis
              yAxisId="price"
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }}
              tickFormatter={(v) => `₹${Math.round(v)}`}
              orientation="right"
              tickLine={false}
            />
            <YAxis yAxisId="volume" domain={[0, 'dataMax * 3']} hide />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataPoint;
                  return (
                    <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1 font-mono">
                      <div className="font-extrabold text-indigo-300 border-b border-slate-700 pb-1 flex justify-between gap-4 font-sans">
                        <span>{data.time}</span>
                        <span>₹{data.close}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-300">
                        <div>Open: <span className="font-bold text-white">₹{data.open}</span></div>
                        <div>Close: <span className="font-bold text-white">₹{data.close}</span></div>
                        <div>High: <span className="font-bold text-emerald-400">₹{data.high}</span></div>
                        <div>Low: <span className="font-bold text-rose-400">₹{data.low}</span></div>
                        <div className="col-span-2 text-amber-300 font-semibold pt-0.5">
                          Volume: {data.volume.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Volume Bars */}
            <Bar yAxisId="volume" dataKey="volume" fill="#cbd5e1" opacity={0.5} radius={[2, 2, 0, 0]} />

            {/* Main Price Line */}
            {chartType === 'line' ? (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
              />
            ) : (
              // Candlestick simulated representation via High-Low Line + Close dot
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 2, fill: '#059669' }}
              />
            )}

            {/* Overlays */}
            {showEma20 && <Line yAxisId="price" type="monotone" dataKey="ema20" stroke="#6366f1" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />}
            {showEma50 && <Line yAxisId="price" type="monotone" dataKey="ema50" stroke="#f59e0b" strokeWidth={1.5} dot={false} />}
            {showEma100 && <Line yAxisId="price" type="monotone" dataKey="ema100" stroke="#a855f7" strokeWidth={1.5} dot={false} />}
            {showEma200 && <Line yAxisId="price" type="monotone" dataKey="ema200" stroke="#f43f5e" strokeWidth={1.5} dot={false} />}
            {showVwap && <Line yAxisId="price" type="monotone" dataKey="vwap" stroke="#14b8a6" strokeWidth={1.5} dot={false} />}
            {showBollinger && (
              <>
                <Line yAxisId="price" type="monotone" dataKey="bollingerUpper" stroke="#0284c7" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                <Line yAxisId="price" type="monotone" dataKey="bollingerLower" stroke="#0284c7" strokeWidth={1} dot={false} strokeDasharray="3 3" />
              </>
            )}

            {/* Support & Resistance Level Reference Lines */}
            {showLevels && (
              <>
                <ReferenceLine yAxisId="price" y={levels.resistance2} stroke="#dc2626" strokeDasharray="4 4" label={{ value: `R2: ₹${levels.resistance2}`, fill: '#dc2626', fontSize: 10, fontWeight: 'bold' }} />
                <ReferenceLine yAxisId="price" y={levels.resistance1} stroke="#ea580c" strokeDasharray="4 4" label={{ value: `R1: ₹${levels.resistance1}`, fill: '#ea580c', fontSize: 10, fontWeight: 'bold' }} />
                <ReferenceLine yAxisId="price" y={levels.support1} stroke="#16a34a" strokeDasharray="4 4" label={{ value: `S1: ₹${levels.support1}`, fill: '#16a34a', fontSize: 10, fontWeight: 'bold' }} />
                <ReferenceLine yAxisId="price" y={levels.support2} stroke="#0284c7" strokeDasharray="4 4" label={{ value: `S2: ₹${levels.support2}`, fill: '#0284c7', fontSize: 10, fontWeight: 'bold' }} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Indicator Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-indigo-600"></span> 20 EMA</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-amber-500"></span> 50 EMA</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-teal-500"></span> VWAP</span>
          <span className="flex items-center gap-1 text-emerald-600 font-bold">● S1: ₹{levels.support1}</span>
          <span className="flex items-center gap-1 text-rose-600 font-bold">● R1: ₹{levels.resistance1}</span>
        </div>
        <div className="text-slate-400 font-mono text-[10px]">NSE Live Feed • 15m Delayed</div>
      </div>
    </div>
  );
};
