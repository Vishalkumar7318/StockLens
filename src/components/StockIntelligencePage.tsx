import React, { useState } from 'react';
import { StockIntelligenceData, NewsArticle, StockAlert } from '../types';
import { StockChart } from './StockChart';
import { NewsCard } from './NewsCard';
import { ExportPdfModal } from './ExportPdfModal';
import {
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bookmark,
  Bell,
  ArrowRightLeft,
  RefreshCw,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  FileText,
  DollarSign,
  Users,
  CheckCircle2,
  Info,
  ChevronRight,
  FileDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface StockIntelligencePageProps {
  stockData: StockIntelligenceData;
  newsList: NewsArticle[];
  isSaved: boolean;
  onToggleSaveStock: (symbol: string) => void;
  onOpenAlertModal: () => void;
  onOpenCompareModal: () => void;
  onSelectNewsArticle: (article: NewsArticle) => void;
  onToggleSaveNews: (id: string) => void;
  savedNewsIds: string[];
  onVerifyNewsForStock: (symbol: string) => void;
  onSwitchStock: (symbol: string) => void;
}

export const StockIntelligencePage: React.FC<StockIntelligencePageProps> = ({
  stockData,
  newsList,
  isSaved,
  onToggleSaveStock,
  onOpenAlertModal,
  onOpenCompareModal,
  onSelectNewsArticle,
  onToggleSaveNews,
  savedNewsIds,
  onVerifyNewsForStock,
  onSwitchStock,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'technicals' | 'fundamentals' | 'news' | 'risk'>('overview');
  const [isAiRefreshing, setIsAiRefreshing] = useState(false);
  const [dynamicAiExplanation, setDynamicAiExplanation] = useState(stockData.aiExplanation);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filter stock-specific news
  const stockArticles = newsList.filter(
    (a) =>
      a.companySymbol.toUpperCase() === stockData.symbol.toUpperCase() ||
      a.companyName.toLowerCase().includes(stockData.name.toLowerCase()) ||
      a.title.toLowerCase().includes(stockData.symbol.toLowerCase())
  );

  // Function to re-query Gemini AI for fresh narrative
  const handleRefreshAiAnalysis = async () => {
    setIsAiRefreshing(true);
    try {
      const res = await fetch('/api/stock/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: stockData.symbol }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analysis) {
          setDynamicAiExplanation(data.analysis);
        }
      }
    } catch (err) {
      console.warn('AI analysis refresh fallback:', err);
    } finally {
      setIsAiRefreshing(false);
    }
  };

  // Color helper for scores
  const getScoreBadgeBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-600 text-white';
    if (score >= 75) return 'bg-emerald-500 text-white';
    if (score >= 60) return 'bg-indigo-600 text-white';
    if (score >= 45) return 'bg-amber-500 text-white';
    if (score >= 30) return 'bg-orange-500 text-white';
    return 'bg-rose-600 text-white';
  };

  const getRiskMeterBadge = (level: string) => {
    if (level === 'LOW') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (level === 'MODERATE') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (level === 'HIGH') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      
      {/* SECTION 2: STOCK HEADER BAR */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Company Profile */}
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">NSE: {stockData.nseSymbol}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">BSE: {stockData.bseCode}</span>
            <span>•</span>
            <span>{stockData.sector}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stockData.name}
            </h1>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${getScoreBadgeBg(stockData.overallScore)}`}>
              {stockData.scoreLabel}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-1">
            Industry: <span className="font-semibold text-slate-700">{stockData.industry}</span>
          </p>
        </div>

        {/* Middle Price Quotes & Stats */}
        <div className="flex flex-wrap items-center gap-6 py-3 lg:py-0 border-y lg:border-y-0 lg:border-x border-slate-100 lg:px-6 font-mono">
          <div>
            <div className="text-xs text-slate-400 font-sans font-extrabold uppercase tracking-wider">Current Price</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              ₹{stockData.price.toLocaleString()}
              <span className={`text-sm font-bold flex items-center ${stockData.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stockData.changePercent >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Market Cap</span>
              <span className="font-extrabold text-slate-800 font-mono">₹{(stockData.marketCapCr / 1000).toFixed(1)}k Cr</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">52W High / Low</span>
              <span className="font-bold text-slate-800 font-mono">₹{stockData.high52} / ₹{stockData.low52}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Volume</span>
              <span className="font-bold text-slate-800 font-mono">{(stockData.volume / 100000).toFixed(2)}L</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">RVOL</span>
              <span className="font-bold text-indigo-600 font-mono">{stockData.volumeAnalysis.relativeVolumeRvol}x</span>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-export-pdf-dossier"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs"
            title="Export full intelligence & verification report as formatted PDF for offline reading"
          >
            <FileDown className="w-4 h-4 text-indigo-600" />
            Export PDF
          </button>

          <button
            onClick={() => onToggleSaveStock(stockData.symbol)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSaved
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            {isSaved ? 'In Watchlist' : 'Add Watchlist'}
          </button>

          <button
            onClick={onOpenAlertModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4 text-indigo-600" />
            Set Alert
          </button>

          <button
            onClick={onOpenCompareModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            Compare
          </button>

          <button
            onClick={() => onVerifyNewsForStock(stockData.symbol)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Verify News
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs no-scrollbar text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> AI Overview & Scores
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'chart' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" /> Price Chart & S/R
        </button>
        <button
          onClick={() => setActiveTab('technicals')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'technicals' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Technical Analysis
        </button>
        <button
          onClick={() => setActiveTab('fundamentals')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'fundamentals' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Fundamentals & Quarterly
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'news' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> News & Sentiment ({stockArticles.length})
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'risk' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Risk & Trade Setup
        </button>
      </div>

      {/* VIEW SECTION 1: OVERVIEW & SCORES */}
      {(activeTab === 'overview' || activeTab === 'chart') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SECTION 3: STOCKLENS AI SCORE CARD */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> STOCKLENS AI SCORE
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Calculated from verified data</span>
              </div>

              {/* Big Score Radial Ring */}
              <div className="p-4 bg-slate-900 rounded-2xl text-center text-white space-y-1 my-2">
                <div className="text-xs text-indigo-300 font-extrabold uppercase tracking-widest">
                  Overall Score
                </div>
                <div className="text-5xl font-black font-mono tracking-tight text-white">
                  {stockData.overallScore}
                  <span className="text-lg text-slate-400 font-bold">/100</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600 text-white mt-1">
                  {stockData.scoreLabel}
                </div>
              </div>

              {/* Individual Score Subcategories Progress Bars */}
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Technical Score', val: stockData.technicalScore },
                  { label: 'Fundamental Score', val: stockData.fundamentalScore },
                  { label: 'Momentum Score', val: stockData.momentumScore },
                  { label: 'Volume Score', val: stockData.volumeScore },
                  { label: 'News Credibility Score', val: stockData.newsScore },
                  { label: 'Market / Sector Score', val: stockData.marketSectorScore },
                  { label: 'Risk Meter Score (Lower = Safer)', val: 100 - stockData.riskScore },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono">{item.val}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.val >= 80 ? 'bg-emerald-500' : item.val >= 60 ? 'bg-indigo-500' : item.val >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Score calculated without arbitrary estimates. Missing values trigger 'Insufficient data'.
            </div>
          </div>

          {/* SECTION 4: AI STOCK EXPLANATION CARD */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Why StockLens AI gave this score?
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Plain language analysis of trend, momentum, valuation, news & risk
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-export-pdf-ai-card"
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200/70 flex items-center gap-1.5 transition-colors"
                    title="Export PDF Report"
                  >
                    <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                    PDF Report
                  </button>

                  <button
                    onClick={handleRefreshAiAnalysis}
                    disabled={isAiRefreshing}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAiRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                    {isAiRefreshing ? 'Analyzing...' : 'Refresh AI'}
                  </button>
                </div>
              </div>

              {/* Main AI Explanation Paragraphs */}
              <div className="mt-4 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-xs text-slate-800 space-y-2 leading-relaxed">
                <p className="font-semibold">{dynamicAiExplanation.overallSummary}</p>
                <p className="text-slate-600">{dynamicAiExplanation.trendSummary}</p>
              </div>

              {/* 3 Columns: Positive Factors, Risk Factors, What to Watch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                
                {/* Positive Factors */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                  <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Positive Factors
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {dynamicAiExplanation.positiveFactors.map((pf, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-black">•</span>
                        <span>{pf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-2">
                  <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Risk Factors
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {dynamicAiExplanation.riskFactors.map((rf, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-black">•</span>
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What to Watch */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-600" /> What to Watch
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {dynamicAiExplanation.whatToWatch.map((wt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-black">•</span>
                        <span>{wt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
              Educational market analysis powered by Gemini AI. Does not guarantee future stock price performance.
            </div>
          </div>

        </div>
      )}

      {/* SECTION 5 & 7: PRICE CHART & SUPPORT/RESISTANCE */}
      {(activeTab === 'overview' || activeTab === 'chart') && (
        <div className="space-y-6">
          <StockChart
            chartData={stockData.charts}
            currentPrice={stockData.price}
            levels={stockData.levels}
          />

          {/* SECTION 7: SUPPORT & RESISTANCE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>Support Levels</span>
                <span className="text-emerald-600">Key Demand</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black font-mono">
                <div>Support 1: <span className="text-emerald-600">₹{stockData.levels.support1}</span></div>
                <div className="text-xs text-slate-500 font-medium">(-{stockData.levels.distanceFromSupportPct}%)</div>
              </div>
              <div className="text-xs font-mono text-slate-600">Support 2: ₹{stockData.levels.support2}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>Resistance Levels</span>
                <span className="text-rose-600">Supply Zone</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black font-mono">
                <div>Resistance 1: <span className="text-rose-600">₹{stockData.levels.resistance1}</span></div>
                <div className="text-xs text-slate-500 font-medium">(+{stockData.levels.distanceFromResistancePct}%)</div>
              </div>
              <div className="text-xs font-mono text-slate-600">Resistance 2: ₹{stockData.levels.resistance2}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <span>Technical State</span>
                <span className="text-indigo-600">Pattern Status</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs">
                {stockData.levels.state}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Distance to breakout resistance: <span className="font-bold text-slate-800">{stockData.levels.distanceFromResistancePct}%</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: TECHNICAL ANALYSIS */}
      {(activeTab === 'overview' || activeTab === 'technicals') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                <BarChart3 className="w-4 h-4" /> Technical Analysis Engine
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Technical Indicators & Oscillators
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                Trend: {stockData.technicals.trend}
              </span>
              <span className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-bold">
                Momentum: {stockData.technicals.momentum}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                Volatility: {stockData.technicals.volatility}
              </span>
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">RSI (14)</span>
              <span className="text-lg font-black text-slate-900">{stockData.technicals.rsi}</span>
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">
                {stockData.technicals.rsi > 70 ? 'Overbought' : stockData.technicals.rsi < 30 ? 'Oversold' : 'Neutral Bullish'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">MACD Line</span>
              <span className="text-lg font-black text-emerald-600">{stockData.technicals.macd.macdLine}</span>
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">
                Signal: {stockData.technicals.macd.signalLine}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">ADX Strength</span>
              <span className="text-lg font-black text-slate-900">{stockData.technicals.adx}</span>
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">
                {stockData.technicals.adx > 25 ? 'Strong Trend' : 'Weak Trend'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">ATR (Vol)</span>
              <span className="text-lg font-black text-slate-900">₹{stockData.technicals.atr}</span>
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">Average Range</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">Supertrend</span>
              <span className="text-lg font-black text-emerald-600">₹{stockData.technicals.supertrend.value}</span>
              <span className="text-[10px] text-emerald-700 block font-sans font-bold">
                {stockData.technicals.supertrend.signal}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase block">VWAP</span>
              <span className="text-lg font-black text-slate-900">₹{stockData.technicals.vwap}</span>
              <span className="text-[10px] text-slate-500 block font-sans font-semibold">Volume Weighted</span>
            </div>
          </div>

          {/* Exponential Moving Averages Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 font-mono text-xs">
            <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-sans font-bold text-slate-500 block">20 EMA</span>
                <span className="font-extrabold text-slate-900">₹{stockData.technicals.ema20}</span>
              </div>
              <span className="text-[10px] font-sans font-bold text-emerald-700">Above</span>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-sans font-bold text-slate-500 block">50 EMA</span>
                <span className="font-extrabold text-slate-900">₹{stockData.technicals.ema50}</span>
              </div>
              <span className="text-[10px] font-sans font-bold text-emerald-700">Above</span>
            </div>

            <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-sans font-bold text-slate-500 block">100 EMA</span>
                <span className="font-extrabold text-slate-900">₹{stockData.technicals.ema100}</span>
              </div>
              <span className="text-[10px] font-sans font-bold text-emerald-700">Above</span>
            </div>

            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-sans font-bold text-slate-500 block">200 EMA</span>
                <span className="font-extrabold text-slate-900">₹{stockData.technicals.ema200}</span>
              </div>
              <span className="text-[10px] font-sans font-bold text-emerald-700">Above</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8, 9 & 14: FUNDAMENTALS, QUARTERLY RESULTS & OWNERSHIP */}
      {(activeTab === 'overview' || activeTab === 'fundamentals') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SECTION 8: FUNDAMENTAL ANALYSIS METRICS */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-900">
                  Fundamental Quality & Key Metrics
                </h2>
              </div>
              <div className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
                Score: {stockData.fundamentalScore}/100
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">Revenue</span>
                <span className="text-sm font-black text-slate-900">₹{(stockData.fundamentals.revenueCr / 1000).toFixed(1)}k Cr</span>
                <span className="text-[10px] text-emerald-600 font-sans font-bold block">+{stockData.fundamentals.revenueGrowthPct}% YoY</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">Net Profit</span>
                <span className="text-sm font-black text-slate-900">₹{stockData.fundamentals.netProfitCr.toLocaleString()} Cr</span>
                <span className="text-[10px] text-emerald-600 font-sans font-bold block">+{stockData.fundamentals.profitGrowthPct}% YoY</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">P/E Valuation</span>
                <span className="text-sm font-black text-slate-900">{stockData.fundamentals.pe}x</span>
                <span className="text-[10px] text-slate-500 font-sans font-bold block">EPS: ₹{stockData.fundamentals.eps}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">ROE / ROCE</span>
                <span className="text-sm font-black text-slate-900">{stockData.fundamentals.roePct}%</span>
                <span className="text-[10px] text-slate-500 font-sans font-bold block">ROCE: {stockData.fundamentals.rocePct}%</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">Debt to Equity</span>
                <span className="text-sm font-black text-slate-900">{stockData.fundamentals.debtToEquity}</span>
                <span className="text-[10px] text-emerald-600 font-sans font-bold block">Low Solvency Risk</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">Operating Margin</span>
                <span className="text-sm font-black text-slate-900">{stockData.fundamentals.opMarginPct}%</span>
                <span className="text-[10px] text-slate-500 font-sans font-bold block">EBITDA: {stockData.fundamentals.ebitdaMarginPct}%</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">Dividend Yield</span>
                <span className="text-sm font-black text-slate-900">{stockData.fundamentals.dividendYieldPct}%</span>
                <span className="text-[10px] text-slate-500 font-sans font-bold block">Annualized</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">Promoter Pledge</span>
                <span className="text-sm font-black text-emerald-600">{stockData.fundamentals.promoterPledgePct}%</span>
                <span className="text-[10px] text-emerald-600 font-sans font-bold block">Zero Pledge</span>
              </div>
            </div>

            {/* Metric Interpretations Table */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Metric Interpretations</h3>
              <div className="divide-y divide-slate-100 text-xs font-medium border border-slate-200 rounded-2xl overflow-hidden">
                {stockData.fundamentals.metricsBreakdown.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-800 font-sans">{m.metric}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">Prev: {m.previousValue}</span>
                      <span className="font-extrabold text-slate-900">Curr: {m.currentValue}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                        m.interpretation === 'Positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.interpretation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 9 & 14: QUARTERLY RESULTS & OWNERSHIP */}
          <div className="space-y-6">
            
            {/* Quarterly Results Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" /> Quarterly Performance
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  QoQ & YoY Verified
                </span>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockData.quarterlyResults}>
                    <RechartsTooltip formatter={(val: any) => [`₹${val} Cr`, '']} />
                    <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} orientation="right" />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="netProfit" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-900 text-center">
                  Latest Q Revenue: ₹{stockData.quarterlyResults[0]?.revenue} Cr
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-900 text-center">
                  Latest Q Profit: ₹{stockData.quarterlyResults[0]?.netProfit} Cr
                </div>
              </div>
            </div>

            {/* SECTION 14: OWNERSHIP BREAKDOWN */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" /> Shareholding Pattern
              </h3>

              <div className="space-y-2 text-xs font-bold">
                <div>
                  <div className="flex justify-between text-slate-700">
                    <span>Promoters</span>
                    <span className="font-mono">{stockData.ownership.promoterHolding}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${stockData.ownership.promoterHolding}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700">
                    <span>Foreign Institutions (FII)</span>
                    <span className="font-mono">{stockData.ownership.fiiHolding}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stockData.ownership.fiiHolding}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700">
                    <span>Domestic Institutions (DII)</span>
                    <span className="font-mono">{stockData.ownership.diiHolding}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stockData.ownership.diiHolding}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700">
                    <span>Public / Retail</span>
                    <span className="font-mono">{stockData.ownership.publicHolding}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-slate-400 h-full rounded-full" style={{ width: `${stockData.ownership.publicHolding}%` }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 10 & 11: NEWS ANALYSIS & SENTIMENT */}
      {(activeTab === 'overview' || activeTab === 'news') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                <FileText className="w-4 h-4" /> Connected StockLens News Engine
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Verified News Feed & Sentiment for {stockData.symbol}
              </h2>
            </div>

            {/* News Sentiment Meter Badge */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">NEWS SENTIMENT SCORE</span>
                <span className="text-lg font-black font-mono text-indigo-600">{stockData.newsSentiment.score}/100</span>
              </div>
              <div className="text-xs font-semibold space-y-0.5">
                <div className="text-emerald-600 font-bold">Positive: {stockData.newsSentiment.positivePct}%</div>
                <div className="text-rose-600 font-bold">Negative: {stockData.newsSentiment.negativePct}%</div>
              </div>
            </div>
          </div>

          {/* News Cards Grid */}
          {stockArticles.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <ShieldCheck className="w-8 h-8 text-indigo-600 mx-auto" />
              <p className="text-xs font-extrabold text-slate-800">
                No high-risk rumors or unverified claims detected for {stockData.symbol} in recent feed.
              </p>
              <button
                onClick={() => onVerifyNewsForStock(stockData.symbol)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Submit Custom Claim / Article to Verify
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {stockArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onSelect={onSelectNewsArticle}
                  onToggleSave={onToggleSaveNews}
                  isSaved={savedNewsIds.includes(article.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 12, 13, 15, 16: VOLUME, MARKET/SECTOR, RISK & TRADE SETUP */}
      {(activeTab === 'overview' || activeTab === 'risk') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* SECTION 12: VOLUME INTELLIGENCE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" /> Volume Intelligence
            </h3>

            <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span>Current Volume: {(stockData.volumeAnalysis.currentVolume / 100000).toFixed(2)}L</span>
                <span>Avg: {(stockData.volumeAnalysis.avgVolume / 100000).toFixed(2)}L</span>
              </div>
              <div className="inline-block px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-100 text-indigo-800">
                Signal: {stockData.volumeAnalysis.signal}
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {stockData.volumeAnalysis.relationshipSummary}
              </p>
            </div>
          </div>

          {/* SECTION 15: RISK METER */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Analysis Meter
              </h3>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase border ${getRiskMeterBadge(stockData.riskAnalysis.level)}`}>
                {stockData.riskAnalysis.level} RISK
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs font-medium text-slate-700">
              <p className="font-semibold text-slate-900">{stockData.riskAnalysis.explanation}</p>
              <ul className="space-y-1 text-slate-600 pt-1">
                {stockData.riskAnalysis.mainRiskFactors.map((rf, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-rose-500 font-bold">•</span> {rf}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 16: TRADE SETUP (EDUCATIONAL) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 lg:col-span-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" /> Educational Trade Setup
              </h3>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                Quality: {stockData.tradeSetup.setupQuality}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-sans font-bold text-slate-400 block">Entry Zone</span>
                <span className="font-bold text-slate-900">{stockData.tradeSetup.entryZone}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-sans font-bold text-slate-400 block">Risk / Reward</span>
                <span className="font-bold text-emerald-600">{stockData.tradeSetup.riskRewardRatio}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-sans font-bold text-slate-400 block">Target 1</span>
                <span className="font-bold text-emerald-600">₹{stockData.tradeSetup.target1}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-sans font-bold text-slate-400 block">Invalidation Level</span>
                <span className="font-bold text-rose-600">₹{stockData.tradeSetup.invalidationLevel}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {stockData.tradeSetup.disclaimer}
            </p>
          </div>

        </div>
      )}

      {/* SECTION 20: DATA SOURCE & ATTRIBUTION FOOTER */}
      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl text-xs space-y-2 font-mono border border-slate-800">
        <div className="text-[11px] font-sans font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Data Source & Accuracy Verification Attribution
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          {stockData.dataSources.map((ds, idx) => (
            <div key={idx} className="p-2.5 bg-slate-800/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white block font-sans">{ds.name}</span>
                <span className="text-slate-400">{ds.timestamp}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                ds.status === 'LIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-700 text-slate-300'
              }`}>
                {ds.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Export PDF Dossier Modal */}
      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        stockData={stockData}
        newsArticles={newsList}
        aiExplanation={dynamicAiExplanation}
      />

    </div>
  );
};
