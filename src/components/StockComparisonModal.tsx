import React, { useState } from 'react';
import { StockIntelligenceData } from '../types';
import { X, ArrowRightLeft, Sparkles, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { getStockIntelligence } from '../services/stockDataService';

interface StockComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseStock: StockIntelligenceData;
  allCompanies: any[];
}

export const StockComparisonModal: React.FC<StockComparisonModalProps> = ({
  isOpen,
  onClose,
  baseStock,
  allCompanies,
}) => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([baseStock.symbol, 'INFY', 'HDFCBANK', 'RELIANCE']);
  const [searchToAdd, setSearchToAdd] = useState('');

  if (!isOpen) return null;

  const comparedStocks: StockIntelligenceData[] = selectedSymbols.map((sym) =>
    sym === baseStock.symbol ? baseStock : getStockIntelligence(sym, allCompanies)
  );

  const handleAddSymbol = (sym: string) => {
    if (selectedSymbols.length < 4 && !selectedSymbols.includes(sym)) {
      setSelectedSymbols([...selectedSymbols, sym]);
      setSearchToAdd('');
    }
  };

  const handleRemoveSymbol = (sym: string) => {
    if (selectedSymbols.length > 1) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== sym));
    }
  };

  const metricsConfig = [
    { label: 'StockLens AI Score', getKey: (s: StockIntelligenceData) => s.overallScore, format: (v: number) => `${v}/100`, isHigherBetter: true },
    { label: 'Current Price', getKey: (s: StockIntelligenceData) => s.price, format: (v: number) => `₹${v.toLocaleString()}`, isHigherBetter: false },
    { label: 'Market Cap', getKey: (s: StockIntelligenceData) => s.marketCapCr, format: (v: number) => `₹${(v / 1000).toFixed(1)}k Cr`, isHigherBetter: true },
    { label: 'P/E Valuation', getKey: (s: StockIntelligenceData) => s.fundamentals.pe, format: (v: number) => `${v}x`, isHigherBetter: false },
    { label: 'EPS (Earnings per Share)', getKey: (s: StockIntelligenceData) => s.fundamentals.eps, format: (v: number) => `₹${v}`, isHigherBetter: true },
    { label: 'Revenue Growth', getKey: (s: StockIntelligenceData) => s.fundamentals.revenueGrowthPct, format: (v: number) => `${v}%`, isHigherBetter: true },
    { label: 'Profit Growth', getKey: (s: StockIntelligenceData) => s.fundamentals.profitGrowthPct, format: (v: number) => `${v}%`, isHigherBetter: true },
    { label: 'ROE (Return on Equity)', getKey: (s: StockIntelligenceData) => s.fundamentals.roePct, format: (v: number) => `${v}%`, isHigherBetter: true },
    { label: 'ROCE', getKey: (s: StockIntelligenceData) => s.fundamentals.rocePct, format: (v: number) => `${v}%`, isHigherBetter: true },
    { label: 'Debt to Equity', getKey: (s: StockIntelligenceData) => s.fundamentals.debtToEquity, format: (v: number) => `${v}`, isHigherBetter: false },
    { label: 'Technical Score', getKey: (s: StockIntelligenceData) => s.technicalScore, format: (v: number) => `${v}/100`, isHigherBetter: true },
    { label: 'Fundamental Score', getKey: (s: StockIntelligenceData) => s.fundamentalScore, format: (v: number) => `${v}/100`, isHigherBetter: true },
    { label: 'Momentum Score', getKey: (s: StockIntelligenceData) => s.momentumScore, format: (v: number) => `${v}/100`, isHigherBetter: true },
    { label: 'News Credibility Score', getKey: (s: StockIntelligenceData) => s.newsScore, format: (v: number) => `${v}/100`, isHigherBetter: true },
    { label: 'Risk Meter Score', getKey: (s: StockIntelligenceData) => s.riskScore, format: (v: number) => `${v}/100`, isHigherBetter: false },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-400 mb-1">
              <ArrowRightLeft className="w-4 h-4" /> Multi-Stock Comparative Matrix
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              StockLens Peer Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-lg font-bold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Selector Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comparing ({comparedStocks.length}/4):</span>
            {comparedStocks.map((stk) => (
              <span
                key={stk.symbol}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-black text-slate-900 flex items-center gap-2"
              >
                <span>{stk.symbol}</span>
                {comparedStocks.length > 1 && (
                  <button
                    onClick={() => handleRemoveSymbol(stk.symbol)}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Add Stock Quick Picker */}
          {selectedSymbols.length < 4 && (
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) handleAddSymbol(e.target.value);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue=""
              >
                <option value="" disabled>+ Add Peer Stock to Compare...</option>
                {allCompanies
                  .filter((c) => !selectedSymbols.includes(c.symbol))
                  .map((c) => (
                    <option key={c.symbol} value={c.symbol}>
                      {c.symbol} — {c.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-3 text-xs font-black text-slate-400 uppercase tracking-wider w-48">Key Metric</th>
                {comparedStocks.map((stk) => (
                  <th key={stk.symbol} className="p-3 text-center bg-slate-50/80 rounded-t-2xl">
                    <div className="font-mono font-black text-slate-900 text-sm">{stk.symbol}</div>
                    <div className="text-[11px] font-semibold text-slate-500 line-clamp-1">{stk.name}</div>
                    <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                      Overall Score: {stk.overallScore}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {metricsConfig.map((metric, idx) => {
                // Find highest and lowest values for highlighting best/worst
                const values = comparedStocks.map((s) => metric.getKey(s));
                const maxVal = Math.max(...values);
                const minVal = Math.min(...values);

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/40">{metric.label}</td>
                    {comparedStocks.map((stk) => {
                      const val = metric.getKey(stk);
                      const isBest = metric.isHigherBetter ? val === maxVal : val === minVal;
                      const isWorst = metric.isHigherBetter ? val === minVal : val === maxVal;

                      return (
                        <td key={stk.symbol} className="p-3 text-center font-mono text-sm">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold ${
                            isBest
                              ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-extrabold'
                              : isWorst
                              ? 'bg-amber-100/60 text-amber-900 border border-amber-200'
                              : 'text-slate-800'
                          }`}>
                            {metric.format(val)}
                            {isBest && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 font-medium">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Highlighted green cells indicate top peer performance per metric.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
