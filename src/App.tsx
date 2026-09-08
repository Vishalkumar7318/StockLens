/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { TickerBar } from './components/TickerBar';
import { NewsFeed } from './components/NewsFeed';
import { RumorVerifierPage } from './components/RumorVerifierPage';
import { CompanyDirectory } from './components/CompanyDirectory';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AssistantTab } from './components/AssistantTab';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { StockIntelligencePage } from './components/StockIntelligencePage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { StockComparisonModal } from './components/StockComparisonModal';
import { StockAlertModal } from './components/StockAlertModal';
import { NewsArticle, Company, StockAlert } from './types';
import { INDIAN_COMPANIES, INITIAL_NEWS_ARTICLES } from './data/mockData';
import { getStockIntelligence } from './services/stockDataService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'verifier' | 'companies' | 'analytics' | 'assistant' | 'stock' | 'searchResults'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPageQuery, setSearchPageQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('All');

  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('TCS');
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const [articles, setArticles] = useState<NewsArticle[]>(INITIAL_NEWS_ARTICLES);
  const [companies, setCompanies] = useState<Company[]>(INDIAN_COMPANIES);
  const [loading, setLoading] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  // Saved Stocks Watchlist
  const [savedStockSymbols, setSavedStockSymbols] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('stocklens_saved_stocks');
      return stored ? JSON.parse(stored) : ['TCS', 'RELIANCE', 'INFY'];
    } catch {
      return ['TCS', 'RELIANCE', 'INFY'];
    }
  });

  // Saved Articles
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('stocklens_saved_articles');
      return stored ? JSON.parse(stored) : ['news-101'];
    } catch {
      return ['news-101'];
    }
  });

  // Active User Alerts
  const [activeAlerts, setActiveAlerts] = useState<StockAlert[]>(() => {
    try {
      const stored = localStorage.getItem('stocklens_active_alerts');
      return stored ? JSON.parse(stored) : [
        {
          id: 'alert-1',
          symbol: 'TCS',
          companyName: 'Tata Consultancy Services',
          type: 'price_above',
          targetValue: 4300,
          conditionDescription: 'Trigger when price rises above ₹4,300',
          createdAt: '10:30 AM',
        }
      ];
    } catch {
      return [];
    }
  });

  // Fetch News and Companies from server API
  useEffect(() => {
    fetchNewsAndCompanies();
  }, []);

  const fetchNewsAndCompanies = async () => {
    setLoading(true);
    try {
      const [newsRes, compRes] = await Promise.all([
        fetch('/api/news'),
        fetch('/api/companies'),
      ]);

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        if (newsData.success && newsData.news) {
          setArticles(newsData.news);
        }
      }

      if (compRes.ok) {
        const compData = await compRes.json();
        if (compData.success && compData.companies) {
          setCompanies(compData.companies);
        }
      }
    } catch (err) {
      console.warn('Backend API connection fallback to preloaded dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSaveArticle = (id: string) => {
    setSavedArticleIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('stocklens_saved_articles', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleToggleSaveStock = (symbol: string) => {
    setSavedStockSymbols((prev) => {
      const next = prev.includes(symbol) ? prev.filter((item) => item !== symbol) : [...prev, symbol];
      try {
        localStorage.setItem('stocklens_saved_stocks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedStockSymbol(symbol.toUpperCase());
    setActiveTab('stock');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCompanyFromDirectory = (symbol: string) => {
    handleSelectStock(symbol);
  };

  const handleAddAlert = (alert: StockAlert) => {
    setActiveAlerts((prev) => {
      const next = [alert, ...prev];
      try {
        localStorage.setItem('stocklens_active_alerts', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRemoveAlert = (id: string) => {
    setActiveAlerts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem('stocklens_active_alerts', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const savedArticles = articles.filter((a) => savedArticleIds.includes(a.id));
  const highRiskAlertsCount = articles.filter((a) => a.credibilityStatus === 'high_risk').length;

  const currentStockIntelligence = getStockIntelligence(selectedStockSymbol, companies, articles);

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Ticker Bar */}
      <TickerBar
        onSelectStock={handleSelectStock}
        onExploreSearch={(q) => {
          setSearchPageQuery(q);
          setActiveTab('searchResults');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        savedCount={savedArticles.length + savedStockSymbols.length}
        onOpenSaved={() => setWatchlistOpen(true)}
        highRiskAlertsCount={highRiskAlertsCount}
        onSelectStockFromSearch={handleSelectStock}
        onOpenSearchResultsPage={(q) => {
          setSearchPageQuery(q);
          setActiveTab('searchResults');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedStockSymbol={selectedStockSymbol}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'searchResults' && (
          <SearchResultsPage
            initialQuery={searchPageQuery}
            onSelectStock={handleSelectStock}
            onBackToFeed={() => setActiveTab('feed')}
          />
        )}

        {activeTab === 'stock' && (
          <StockIntelligencePage
            stockData={currentStockIntelligence}
            newsList={articles}
            isSaved={savedStockSymbols.includes(selectedStockSymbol)}
            onToggleSaveStock={handleToggleSaveStock}
            onOpenAlertModal={() => setAlertModalOpen(true)}
            onOpenCompareModal={() => setCompareModalOpen(true)}
            onSelectNewsArticle={setSelectedArticle}
            onToggleSaveNews={handleToggleSaveArticle}
            savedNewsIds={savedArticleIds}
            onVerifyNewsForStock={(symbol) => {
              setActiveTab('verifier');
            }}
            onSwitchStock={handleSelectStock}
          />
        )}

        {activeTab === 'feed' && (
          <NewsFeed
            articles={articles}
            loading={loading}
            onRefresh={fetchNewsAndCompanies}
            onSelectArticle={setSelectedArticle}
            onToggleSave={handleToggleSaveArticle}
            savedArticleIds={savedArticleIds}
            selectedCompany={selectedCompanyFilter}
            setSelectedCompany={setSelectedCompanyFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'verifier' && (
          <RumorVerifierPage
            onArticleAdded={() => {
              fetchNewsAndCompanies();
            }}
          />
        )}

        {activeTab === 'companies' && (
          <CompanyDirectory
            companies={companies}
            onSelectCompany={handleSelectCompanyFromDirectory}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'assistant' && <AssistantTab />}
      </main>

      {/* Article Detail Verification Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onToggleSave={handleToggleSaveArticle}
        isSaved={selectedArticle ? savedArticleIds.includes(selectedArticle.id) : false}
      />

      {/* Multi-Stock Peer Comparison Modal */}
      <StockComparisonModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        baseStock={currentStockIntelligence}
        allCompanies={companies}
      />

      {/* Real-Time Stock Alert Rules Modal */}
      <StockAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        stock={currentStockIntelligence}
        activeAlerts={activeAlerts}
        onAddAlert={handleAddAlert}
        onRemoveAlert={handleRemoveAlert}
      />

      {/* Watchlist & Saved Items Drawer */}
      <WatchlistDrawer
        isOpen={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        savedArticles={savedArticles}
        onRemoveSaved={handleToggleSaveArticle}
        onSelectArticle={setSelectedArticle}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">StockLens AI</span>
            <span>— Indian Equity News Credibility & Verification Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span>SEBI LODR Regulation 30 Reference</span>
            <span>•</span>
            <span>NSE/BSE API Compliant</span>
            <span>•</span>
            <span>Gemini AI Engine 3.6</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
