import React from 'react';
import { ShieldCheck, Search, Sparkles, Building2, BarChart3, Bot, Bookmark, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';
import { StockSearchAutocomplete } from './StockSearchAutocomplete';

interface NavbarProps {
  activeTab: 'feed' | 'verifier' | 'companies' | 'analytics' | 'assistant' | 'stock' | 'searchResults';
  setActiveTab: (tab: 'feed' | 'verifier' | 'companies' | 'analytics' | 'assistant' | 'stock' | 'searchResults') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  savedCount: number;
  onOpenSaved: () => void;
  highRiskAlertsCount: number;
  onSelectStockFromSearch?: (symbol: string) => void;
  onOpenSearchResultsPage?: (query: string) => void;
  selectedStockSymbol?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  savedCount,
  onOpenSaved,
  highRiskAlertsCount,
  onSelectStockFromSearch,
  onOpenSearchResultsPage,
  selectedStockSymbol,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900 font-sans">
                  Stock<span className="text-indigo-600">Lens</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-1.5 py-0.5 rounded-md">
                  AI Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Indian Market News Credibility & Verification
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <StockSearchAutocomplete
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectStock={(sym) => {
                if (onSelectStockFromSearch) {
                  onSelectStockFromSearch(sym);
                }
              }}
              onOpenSearchResultsPage={(q) => {
                if (onOpenSearchResultsPage) {
                  onOpenSearchResultsPage(q);
                }
              }}
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'feed'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              News Feed
            </button>

            <button
              onClick={() => setActiveTab('verifier')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 relative ${
                activeTab === 'verifier'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              Rumor Verifier
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'companies'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Building2 className="w-4 h-4" />
              NSE/BSE Listed
            </button>

            {selectedStockSymbol && (
              <button
                onClick={() => setActiveTab('stock')}
                className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all duration-150 flex items-center gap-2 ${
                  activeTab === 'stock'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                {selectedStockSymbol} Intelligence
              </button>
            )}

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Sector Radar
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'assistant'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              AI Assistant
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {highRiskAlertsCount > 0 && (
              <button
                onClick={() => setActiveTab('feed')}
                title={`${highRiskAlertsCount} High Risk / Fake News Alerts`}
                className="relative p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              </button>
            )}

            <button
              onClick={onOpenSaved}
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Saved Articles"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('verifier')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-xs shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Verify Link/Text
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1 border-t border-slate-100 no-scrollbar text-xs font-medium">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'feed' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            News Feed
          </button>
          <button
            onClick={() => setActiveTab('verifier')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'verifier' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
            Verify Rumor
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'companies' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Listed Stocks
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Sector Radar
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'assistant' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            AI Assistant
          </button>
        </div>

      </div>
    </header>
  );
};
