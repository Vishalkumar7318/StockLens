import React from 'react';
import { Bookmark, X, Trash2, ExternalLink, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { NewsArticle } from '../types';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: NewsArticle[];
  onRemoveSaved: (id: string) => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  savedArticles,
  onRemoveSaved,
  onSelectArticle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#0D1017] h-full shadow-2xl flex flex-col border-l border-[#1E222C]">
        
        {/* Drawer Header */}
        <div className="p-5 bg-[#14181F] text-white flex items-center justify-between border-b border-[#1E222C]">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-indigo-400 fill-indigo-400" />
            <h2 className="font-extrabold text-base">Saved Investor Watchlist</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
              {savedArticles.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#161B22] hover:bg-[#1C2129] text-slate-300 transition-colors border border-[#30363D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0B10]">
          {savedArticles.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
              <h3 className="font-bold text-white text-sm mb-1">Your Watchlist is Empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click the bookmark icon on any news card or verification report to save articles for offline reading and monitoring.
              </p>
            </div>
          ) : (
            savedArticles.map((art) => (
              <div
                key={art.id}
                className="p-4 rounded-2xl border border-[#1E222C] bg-[#14181F] hover:border-indigo-500/50 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#0D1017] text-indigo-300 border border-[#1E222C]">
                    {art.companySymbol}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      art.credibilityScore >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : art.credibilityScore >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {art.credibilityScore}/100
                    </span>

                    <button
                      onClick={() => onRemoveSaved(art.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className="font-bold text-white text-xs sm:text-sm leading-snug hover:text-indigo-400 cursor-pointer line-clamp-2"
                >
                  {art.title}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {art.summary}
                </p>

                <div className="pt-2 border-t border-[#1E222C] flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Source: {art.source.name}</span>
                  <button
                    onClick={() => {
                      onSelectArticle(art);
                      onClose();
                    }}
                    className="text-indigo-400 hover:underline font-bold"
                  >
                    Open Full Analysis →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
