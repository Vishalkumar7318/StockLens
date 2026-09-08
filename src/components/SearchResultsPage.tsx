import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Database,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  TrendingUp,
  TrendingDown,
  Tag,
  Landmark,
  Compass,
  Cpu,
  Car,
  Zap,
  Shield,
  Briefcase,
  Flame,
} from 'lucide-react';
import { StockSearchResultItem, StockUniverseStats, BenchmarkIndex } from '../types';

interface SearchResultsPageProps {
  initialQuery: string;
  onSelectStock: (symbol: string) => void;
  onBackToFeed?: () => void;
}

// Quick suggested thematic searches
const QUICK_THEMES = [
  { label: 'SENSEX 30', query: 'SENSEX', icon: Landmark, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { label: 'NIFTY 50', query: 'NIFTY 50', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { label: 'Banking Leaders', query: 'BANK', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { label: 'IT Tech Giants', query: 'IT', icon: Cpu, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { label: 'Tata Group', query: 'TATA', icon: Building2, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { label: 'Defence PSUs', query: 'DEFENCE', icon: Shield, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { label: 'Auto Leaders', query: 'AUTO', icon: Car, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { label: 'Energy & Power', query: 'ENERGY', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
];

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  initialQuery,
  onSelectStock,
  onBackToFeed,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'NSE' | 'BSE'>('ALL');
  const [securityTypeFilter, setSecurityTypeFilter] = useState<'ALL' | 'Equity' | 'SME'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'SUSPENDED' | 'ALL'>('ACTIVE');
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'symbol'>('relevance');

  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [results, setResults] = useState<StockSearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [universeStats, setUniverseStats] = useState<StockUniverseStats | null>(null);

  // Thematic & Benchmark metadata
  const [matchedBenchmark, setMatchedBenchmark] = useState<BenchmarkIndex | null>(null);
  const [queryType, setQueryType] = useState<string | null>(null);
  const [relatedTheme, setRelatedTheme] = useState<string | null>(null);
  const [themeDescription, setThemeDescription] = useState<string | null>(null);
  const [isFallbackRecommendation, setIsFallbackRecommendation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Sync state when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
    setPage(1);
  }, [initialQuery]);

  // Execute Search API call
  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const url = `/api/stocks/search?q=${encodeURIComponent(query)}&exchange=${exchangeFilter}&securityType=${securityTypeFilter}&status=${statusFilter}&sort=${sortBy}&page=${page}&limit=${limit}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResults(data.results || []);
          setTotalResults(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setDidYouMean(data.didYouMean || null);
          setUniverseStats(data.universeStats || null);
          setMatchedBenchmark(data.matchedBenchmark || null);
          setQueryType(data.queryType || null);
          setRelatedTheme(data.relatedTheme || null);
          setThemeDescription(data.themeDescription || null);
          setIsFallbackRecommendation(!!data.isFallbackRecommendation);
        }
      }
    } catch (err) {
      console.error('Failed to fetch search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query, exchangeFilter, securityTypeFilter, statusFilter, sortBy, page]);

  // Execute Exchange Master Data Sync
  const handleSyncExchangeData = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/stocks/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUniverseStats(data.stats);
          setSyncMessage('Exchange Stock Master synchronized successfully!');
          fetchSearchResults();
        }
      }
    } catch (err) {
      setSyncMessage('Sync failed. Using built-in exchange master database.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-50/60 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Comprehensive Indian Equity Master
              </span>
              <span className="text-xs text-slate-500 font-medium">NSE & BSE Exchange Feed</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-3">
              <span>Search Results for</span>
              <span className="text-indigo-600 bg-indigo-50/90 px-3 py-1 rounded-xl border border-indigo-200/90 font-mono">
                "{query || 'ALL'}"
              </span>
            </h1>

            <p className="text-sm text-slate-500 mt-1 font-medium">
              {matchedBenchmark ? (
                <span>
                  Found <strong className="text-slate-900 font-bold">{totalResults.toLocaleString()}</strong> constituent & related stocks for benchmark index <strong className="text-indigo-600 font-bold">{matchedBenchmark.name}</strong>.
                </span>
              ) : relatedTheme ? (
                <span>
                  Found <strong className="text-slate-900 font-bold">{totalResults.toLocaleString()}</strong> securities related to <strong className="text-indigo-600 font-bold">{relatedTheme}</strong>.
                </span>
              ) : isFallbackRecommendation ? (
                <span>
                  No exact ticker for "{query}". Showing <strong className="text-slate-900 font-bold">{totalResults.toLocaleString()}</strong> top Indian market leaders and recommended equities.
                </span>
              ) : (
                <span>
                  Found <strong className="text-slate-900 font-bold">{totalResults.toLocaleString()}</strong> matching equity securities across NSE and BSE exchange databases.
                </span>
              )}
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="w-full md:w-96">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search SENSEX, NIFTY, TCS, TATA, Symbol, BSE..."
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium shadow-2xs"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Thematic Filter Pills */}
        <div className="mt-5 pt-5 border-t border-slate-100/90 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Compass className="w-3 h-3 text-indigo-500" />
            Explore Indices & Themes:
          </span>
          {QUICK_THEMES.map((theme) => {
            const Icon = theme.icon;
            const isSelected = query.toUpperCase() === theme.query.toUpperCase();
            return (
              <button
                key={theme.label}
                onClick={() => {
                  setQuery(theme.query);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-102'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stock Universe Status & Sync Panel */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Stock Universe:</span>
              <span className="text-indigo-700 font-mono font-extrabold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {universeStats ? universeStats.total.toLocaleString() : '2,845'} Securities
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-slate-500">
              <span>NSE: <strong className="text-slate-800">{universeStats?.nseCount || 2120}</strong></span>
              <span>•</span>
              <span>BSE: <strong className="text-slate-800">{universeStats?.bseCount || 1840}</strong></span>
              <span>•</span>
              <span>SME: <strong className="text-slate-800">{universeStats?.smeCount || 385}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Status: {universeStats?.syncStatus || 'Synced'}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 text-[11px]">
                {universeStats?.lastSyncTime ? new Date(universeStats.lastSyncTime).toLocaleDateString() : 'Today'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncMessage && (
              <span className="text-xs text-emerald-600 font-bold animate-in fade-in">
                {syncMessage}
              </span>
            )}
            <button
              onClick={handleSyncExchangeData}
              disabled={syncing}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-colors text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{syncing ? 'Syncing Exchange Master...' : 'Sync Exchange Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* BENCHMARK SPOTLIGHT BANNER (Rendered when searching SENSEX, NIFTY, etc.) */}
      {matchedBenchmark && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white border border-indigo-900/60 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-400/30">
                  {matchedBenchmark.exchange} Flagship Benchmark
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Symbol: {matchedBenchmark.symbol}
                </span>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live Index Verified
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{matchedBenchmark.fullName || matchedBenchmark.name}</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {matchedBenchmark.description ||
                  `India's premier benchmark index comprising prominent, financially sound, and actively traded companies across key economic sectors.`}
              </p>

              <div className="pt-1 flex items-center gap-2 text-xs text-indigo-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Displaying all {totalResults} official constituent stocks that form this benchmark index below:</span>
              </div>
            </div>

            {/* Benchmark Live Price Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shrink-0 flex flex-col justify-between min-w-[260px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Index Value</div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-0.5">
                    ₹{matchedBenchmark.formattedPrice}
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                    matchedBenchmark.positive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {matchedBenchmark.positive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {matchedBenchmark.positive ? '+' : ''}
                    {matchedBenchmark.changePercent}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400">Day High:</span>{' '}
                  <strong className="text-white">₹{matchedBenchmark.dayHigh.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Day Low:</span>{' '}
                  <strong className="text-white">₹{matchedBenchmark.dayLow.toLocaleString()}</strong>
                </div>
                {matchedBenchmark.fiftyTwoWeekHigh && (
                  <div>
                    <span className="text-slate-400">52W High:</span>{' '}
                    <strong className="text-white">₹{matchedBenchmark.fiftyTwoWeekHigh.toLocaleString()}</strong>
                  </div>
                )}
                {matchedBenchmark.fiftyTwoWeekLow && (
                  <div>
                    <span className="text-slate-400">52W Low:</span>{' '}
                    <strong className="text-white">₹{matchedBenchmark.fiftyTwoWeekLow.toLocaleString()}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THEMATIC GROUP BANNER (When searching a group like Tata, Adani, Defence without a single benchmark) */}
      {!matchedBenchmark && relatedTheme && (
        <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {queryType || 'THEMATIC'} THEME
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">{relatedTheme}</h3>
              </div>
              {themeDescription && (
                <p className="text-xs text-slate-600 font-medium mt-1">{themeDescription}</p>
              )}
            </div>
          </div>

          <div className="text-xs font-bold text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shrink-0 flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{totalResults} Related Equities Found</span>
          </div>
        </div>
      )}

      {/* Fallback Notice Banner */}
      {isFallbackRecommendation && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-sm">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              No exact security named <strong>"{query}"</strong>. We have surfaced <strong>{totalResults} recommended Indian benchmark leaders</strong> and heavyweights below:
            </span>
          </div>
          <button
            onClick={() => {
              setQuery('SENSEX');
              setPage(1);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors shrink-0"
          >
            Explore SENSEX 30
          </button>
        </div>
      )}

      {/* Filter and Sorting Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="text-slate-400 uppercase tracking-wider font-bold text-[11px] flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            Filters:
          </span>

          {/* Exchange Filter */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
            {(['ALL', 'NSE', 'BSE'] as const).map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setExchangeFilter(ex);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-bold ${
                  exchangeFilter === ex
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Security Type Filter */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
            {(['ALL', 'Equity', 'SME'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSecurityTypeFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-bold ${
                  securityTypeFilter === st
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
            {(['ACTIVE', 'SUSPENDED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-bold ${
                  statusFilter === st
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ACTIVE' ? 'Active & Tradable' : st === 'SUSPENDED' ? 'Suspended' : 'All Statuses'}
              </button>
            ))}
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-slate-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e: any) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="relevance">Relevance Priority</option>
            <option value="name">Company Name (A-Z)</option>
            <option value="symbol">Symbol (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Did You Mean Suggestion Banner */}
      {didYouMean && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-900 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Searching for "{query}". Did you mean: <strong className="font-extrabold text-indigo-700 underline">{didYouMean}</strong>?
            </span>
          </div>
          <button
            onClick={() => {
              const clean = didYouMean.match(/\(([^)]+)\)/)?.[1] || didYouMean;
              setQuery(clean);
              setPage(1);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0"
          >
            Search "{didYouMean}"
          </button>
        </div>
      )}

      {/* Search Results Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm font-bold text-slate-800">Searching Stock Master Database...</div>
          <div className="text-xs text-slate-400">Evaluating 2,840+ securities across NSE & BSE master listings...</div>
        </div>
      ) : results.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold">
            🔍
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">No matching Indian stock found.</h3>
          <p className="text-sm text-slate-500 font-medium">
            We searched the complete official NSE & BSE securities master list for <strong className="text-slate-800">"{query}"</strong>, but no active record was returned with current filters.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setQuery('SENSEX');
                setExchangeFilter('ALL');
                setSecurityTypeFilter('ALL');
                setStatusFilter('ACTIVE');
                setPage(1);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Show SENSEX 30 Bluechips
            </button>
            <button
              onClick={() => {
                setQuery('NIFTY 50');
                setExchangeFilter('ALL');
                setSecurityTypeFilter('ALL');
                setStatusFilter('ACTIVE');
                setPage(1);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
            >
              Show NIFTY 50 Stocks
            </button>
          </div>
        </div>
      ) : (
        /* Results Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((stock) => (
            <div
              key={stock.id || stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Top Row: Symbol Badge & Score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:bg-indigo-600 transition-colors">
                      {(stock.nseSymbol || stock.symbol).substring(0, 4)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {stock.companyName}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                        <span>{stock.sector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div className="font-extrabold text-base text-slate-900">₹{stock.price.toLocaleString()}</div>
                    <div
                      className={`text-xs font-bold ${
                        stock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent}%
                    </div>
                  </div>
                </div>

                {/* Related Reason Badge (e.g. SENSEX 30 Constituent, Tata Group, etc.) */}
                {stock.relatedReason && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                    <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="truncate">{stock.relatedReason}</span>
                  </div>
                )}

                {/* Exchange & Status Badges Bar */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {stock.nseSymbol && (
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
                      NSE: {stock.nseSymbol}
                    </span>
                  )}

                  {stock.bseCode && (
                    <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200/60">
                      BSE: {stock.bseCode}
                    </span>
                  )}

                  {stock.securityType === 'SME' && (
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200/60">
                      SME Listed
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      stock.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    {stock.status}
                  </span>
                </div>

                {/* ISIN & Industry */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 font-mono flex items-center justify-between">
                  <span>
                    ISIN: <strong className="text-slate-800">{stock.isin || 'Unavailable'}</strong>
                  </span>
                  <span className="text-slate-400">Series: {stock.series || 'EQ'}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-indigo-700 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Score: {stock.overallScore}/100</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStock(stock.symbol);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs group-hover:translate-x-0.5"
                >
                  <span>Analyze Stock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs">
          <div className="text-slate-500 font-medium">
            Showing Page <strong className="text-slate-900">{page}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong> ({totalResults} total securities)
          </div>

          <div className="flex items-center gap-2 font-bold">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all ${
                    page === pageNum
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
