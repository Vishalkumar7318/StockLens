import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, ArrowRight, Sparkles, Database, CheckCircle2, ShieldCheck, CornerDownLeft } from 'lucide-react';
import { StockSearchResultItem, StockUniverseStats } from '../types';

interface StockSearchAutocompleteProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectStock: (symbol: string) => void;
  onOpenSearchResultsPage?: (query: string) => void;
}

export const StockSearchAutocomplete: React.FC<StockSearchAutocompleteProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectStock,
  onOpenSearchResultsPage,
}) => {
  const [results, setResults] = useState<StockSearchResultItem[]>([]);
  const [universeStats, setUniverseStats] = useState<StockUniverseStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQueryRef = useRef<string>('');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Autocomplete Results
  useEffect(() => {
    const q = searchQuery.trim();
    currentQueryRef.current = q;

    if (!q) {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      setDidYouMean(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(q)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          // Ensure out-of-order responses don't overwrite newer query
          if (data.success && currentQueryRef.current === q) {
            setResults(data.results || []);
            setUniverseStats(data.universeStats || null);
            setDidYouMean(data.didYouMean || null);
            setIsOpen(true);
            setSelectedIndex(-1);
          }
        }
      } catch (err) {
        console.warn('Search autocomplete fetch error:', err);
      } finally {
        if (currentQueryRef.current === q) {
          setLoading(false);
        }
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard navigation handler (Arrow Up, Arrow Down, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectStock(results[selectedIndex].symbol);
      } else {
        // Trigger full search results page
        if (onOpenSearchResultsPage && searchQuery.trim()) {
          onOpenSearchResultsPage(searchQuery.trim());
          setIsOpen(false);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    onSelectStock(symbol);
    setIsOpen(false);
  };

  const handleTriggerFullSearch = () => {
    if (onOpenSearchResultsPage && searchQuery.trim()) {
      onOpenSearchResultsPage(searchQuery.trim());
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative w-full flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.trim() && results.length > 0) setIsOpen(true);
          }}
          placeholder="Search ALL Indian stocks (SENSEX, NIFTY, TCS, RELIANCE), BSE Code, ISIN..."
          className="w-full pl-10 pr-24 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150 font-medium shadow-xs"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="text-xs text-slate-400 hover:text-slate-700 bg-slate-200/60 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-bold transition-colors"
              title="Clear input"
            >
              ×
            </button>
          )}

          <button
            type="button"
            onClick={handleTriggerFullSearch}
            className="hidden sm:flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
          >
            <span>Search</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-indigo-700">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Stock Master Autocomplete
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Database className="w-3 h-3 text-emerald-600" />
              {universeStats ? `${universeStats.total.toLocaleString()} Stocks Indexed` : 'Live Master'}
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-88 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-5 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching COMPLETE NSE & BSE master database...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-medium">
                <div className="text-slate-800 font-bold mb-1">No matching Indian stock found.</div>
                {didYouMean && (
                  <div className="mt-2 text-indigo-600 font-semibold bg-indigo-50/70 p-2 rounded-lg border border-indigo-100 inline-block cursor-pointer hover:underline"
                    onClick={() => {
                      const cleanSymbol = didYouMean.match(/\(([^)]+)\)/)?.[1] || didYouMean;
                      setSearchQuery(cleanSymbol);
                    }}
                  >
                    Did you mean: {didYouMean}?
                  </div>
                )}
                <div className="mt-3 text-[11px] text-slate-400">
                  Try typing Company Name, NSE Symbol (e.g. TCS), BSE Code (e.g. 500325), or ISIN.
                </div>
              </div>
            ) : (
              results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id || item.symbol}
                    onClick={() => handleSelectStock(item.symbol)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-center justify-between group ${
                      isSelected ? 'bg-indigo-50/90 border-l-4 border-indigo-600 pl-2.5' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {(item.nseSymbol || item.symbol).substring(0, 4)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {item.companyName}
                          </span>
                          {item.nseSymbol && (
                            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60 shrink-0">
                              NSE: {item.nseSymbol}
                            </span>
                          )}
                          {item.bseCode && (
                            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200/60 shrink-0">
                              BSE: {item.bseCode}
                            </span>
                          )}
                          {item.securityType === 'SME' && (
                            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200/60 shrink-0">
                              SME
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1 truncate">
                          {item.relatedReason ? (
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate">
                              {item.relatedReason}
                            </span>
                          ) : (
                            <span className="truncate">{item.sector}</span>
                          )}
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400">ISIN: {item.isin || 'N/A'}</span>
                          <span>•</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="font-bold text-sm text-slate-900">₹{item.price.toLocaleString()}</div>
                      <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                        item.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
                      </div>
                      <div className="text-[10px] text-indigo-600 font-bold mt-0.5 flex items-center justify-end gap-0.5">
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          <div className="p-2.5 bg-indigo-50/70 text-center border-t border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium text-[11px]">
              Use <kbd className="bg-white border border-slate-300 px-1 rounded text-slate-700 font-mono text-[10px]">↑</kbd> <kbd className="bg-white border border-slate-300 px-1 rounded text-slate-700 font-mono text-[10px]">↓</kbd> to navigate, <kbd className="bg-white border border-slate-300 px-1 rounded text-slate-700 font-mono text-[10px]">Enter</kbd> to select
            </span>

            {onOpenSearchResultsPage && (
              <button
                type="button"
                onClick={handleTriggerFullSearch}
                className="font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 hover:underline text-[12px]"
              >
                <span>View all results on search page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
