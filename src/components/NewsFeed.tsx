import React, { useState } from 'react';
import { Filter, SlidersHorizontal, ShieldCheck, ShieldAlert, AlertTriangle, LayoutGrid, List, Search, RefreshCw, Sparkles, Building2, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types';
import { NewsCard } from './NewsCard';

interface NewsFeedProps {
  articles: NewsArticle[];
  loading: boolean;
  onRefresh: () => void;
  onSelectArticle: (article: NewsArticle) => void;
  onToggleSave: (id: string) => void;
  savedArticleIds: string[];
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  articles,
  loading,
  onRefresh,
  onSelectArticle,
  onToggleSave,
  savedArticleIds,
  selectedCompany,
  setSelectedCompany,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'dense'>('grid');

  const sectors = ['All', 'Information Technology', 'Banking & Finance', 'Oil, Gas & Telecom', 'Automobile', 'Conglomerate & Infra', 'Consumer Tech', 'Fintech & Digital Services'];
  const categories = ['All', 'Corporate Action', 'Financial Results', 'Acquisition / Merger', 'Regulatory & Law', 'Market Rumor'];

  // Apply local filters
  const filteredArticles = articles.filter((art) => {
    if (selectedCompany !== 'All' && art.companySymbol.toUpperCase() !== selectedCompany.toUpperCase()) {
      return false;
    }
    if (selectedSector !== 'All' && art.sector.toLowerCase() !== selectedSector.toLowerCase()) {
      return false;
    }
    if (selectedCategory !== 'All' && art.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'All' && art.credibilityStatus !== selectedStatus) {
      return false;
    }
    if (art.credibilityScore < minScore) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.companyName.toLowerCase().includes(q) ||
        art.companySymbol.toLowerCase().includes(q) ||
        art.source.name.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  const verifiedCount = articles.filter((a) => a.credibilityStatus === 'verified').length;
  const highRiskCount = articles.filter((a) => a.credibilityStatus === 'high_risk').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      
      {/* Feed Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Live AI News Credibility Stream
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Verified Indian Stock Market News Feed
          </h1>
          <p className="text-sm text-slate-300 font-medium max-w-2xl mt-1 leading-relaxed">
            Every news item is automatically evaluated by Gemini AI using source reputation weights, cross-media verification, and mandatory SEBI Regulation 30 corporate filings.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stream
          </button>
        </div>
      </div>

      {/* Quick Filter Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedStatus('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap ${
                selectedStatus === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              All News ({articles.length})
            </button>

            <button
              onClick={() => setSelectedStatus('verified')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedStatus === 'verified'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
              Verified Authentic ({verifiedCount})
            </button>

            <button
              onClick={() => setSelectedStatus('needs_verification')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedStatus === 'needs_verification'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Needs Verification
            </button>

            <button
              onClick={() => setSelectedStatus('high_risk')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedStatus === 'high_risk'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              High Risk / Rumors ({highRiskCount})
            </button>
          </div>

          {/* View Mode & Score Threshold */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Min Score:</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-20 accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-indigo-700 w-8">{minScore}%</span>
            </div>

            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('dense')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'dense' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Company Filter Tag if selected */}
          {selectedCompany !== 'All' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-900 rounded-xl font-bold border border-indigo-200">
              <span>Company: {selectedCompany}</span>
              <button onClick={() => setSelectedCompany('All')} className="hover:text-rose-600 ml-1">×</button>
            </div>
          )}

          {/* Sector Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0">SECTOR:</span>
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                  selectedSector === sec
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Active Filter Summary / Search Count */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>Showing {filteredArticles.length} verified news articles</span>
        {(searchQuery || selectedCompany !== 'All' || selectedSector !== 'All' || minScore > 0) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCompany('All');
              setSelectedSector('All');
              setSelectedCategory('All');
              setSelectedStatus('All');
              setMinScore(0);
            }}
            className="text-indigo-600 font-bold hover:underline"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* News Cards Grid / List */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-base">No Matching News Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try lowering your credibility score threshold or clearing search terms to explore more news articles.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onSelectArticle={onSelectArticle}
              onToggleSave={onToggleSave}
              isSaved={savedArticleIds.includes(article.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
