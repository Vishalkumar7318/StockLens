import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Bookmark, CheckCircle2, FileText, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  onSelectArticle: (article: NewsArticle) => void;
  onToggleSave: (id: string) => void;
  isSaved?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onSelectArticle,
  onToggleSave,
  isSaved = false,
}) => {
  // Helper for status styling
  const getStatusBadge = (status: string, score: number) => {
    if (status === 'verified' || score >= 80) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
        dotBg: 'bg-emerald-500',
        text: 'VERIFIED HIGH CREDIBILITY',
        icon: ShieldCheck,
        barColor: 'bg-emerald-500',
        scoreBadge: 'bg-emerald-600 text-white',
      };
    }
    if (status === 'needs_verification' || score >= 50) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200/90',
        dotBg: 'bg-amber-500',
        text: 'NEEDS VERIFICATION',
        icon: ShieldAlert,
        barColor: 'bg-amber-500',
        scoreBadge: 'bg-amber-600 text-white',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200/90',
      dotBg: 'bg-rose-500 animate-ping',
      text: 'HIGH MISINFORMATION RISK',
      icon: AlertTriangle,
      barColor: 'bg-rose-500',
      scoreBadge: 'bg-rose-600 text-white',
    };
  };

  const statusInfo = getStatusBadge(article.credibilityStatus, article.credibilityScore);
  const StatusIcon = statusInfo.icon;

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        
        {/* Header Ribbon */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
          
          {/* Company Tag */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-black tracking-wide bg-slate-900 text-white rounded-lg font-mono">
              {article.companySymbol}
            </span>
            <span className="text-xs font-semibold text-slate-600 truncate max-w-[180px]">
              {article.companyName}
            </span>
          </div>

          {/* Credibility Score Pill */}
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${statusInfo.bg}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{article.credibilityScore}/100</span>
              <span className="text-[10px] hidden sm:inline uppercase font-black tracking-wider opacity-90">
                • {statusInfo.text}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(article.id);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isSaved ? 'Saved in Watchlist' : 'Save to Watchlist'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
            </button>
          </div>

        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          
          {/* Source & Category info */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-500 font-medium">
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
              article.source.isOfficialExchange
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {article.source.name} ({article.source.reputationGrade})
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">
              {article.category}
            </span>
            <span>•</span>
            <span className="text-slate-400 text-[11px] font-mono">{formatDate(article.publishedAt)}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectArticle(article)}
            className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer mb-2.5 line-clamp-2"
          >
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
            {article.summary}
          </p>

          {/* Credibility Breakdown Micro-Meters */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
              <span>AI Credibility Score Factors</span>
              <span className="font-mono text-indigo-600 font-bold">{article.credibilityScore}% Match</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-500 mb-0.5">
                  <span>Source Reputation</span>
                  <span className="font-mono font-bold text-slate-700">{article.credibilityBreakdown.sourceReputation}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.credibilityBreakdown.sourceReputation}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-500 mb-0.5">
                  <span>Cross-Reference</span>
                  <span className="font-mono font-bold text-slate-700">{article.credibilityBreakdown.crossReferenceScore}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.credibilityBreakdown.crossReferenceScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-500 mb-0.5">
                  <span>Objectivity</span>
                  <span className="font-mono font-bold text-slate-700">{article.credibilityBreakdown.languageObjectivity}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.credibilityBreakdown.languageObjectivity}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-500 mb-0.5">
                  <span>Exchange Filings</span>
                  <span className="font-mono font-bold text-slate-700">{article.credibilityBreakdown.regulatoryBacking}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.credibilityBreakdown.regulatoryBacking}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Key Facts or Red Flags snippet */}
          {article.redFlags.length > 0 ? (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50/80 border border-rose-200/70 text-rose-900 text-xs font-medium mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="line-clamp-1"><strong className="font-bold">Red Flag Detected:</strong> {article.redFlags[0]}</span>
            </div>
          ) : article.verifiedFacts.length > 0 ? (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 text-xs font-medium mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="line-clamp-1"><strong className="font-bold">Fact Check:</strong> {article.verifiedFacts[0]}</span>
            </div>
          ) : null}

        </div>

      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        <div className="flex items-center gap-2">
          {article.officialFilingUrl && (
            <a
              href={article.officialFilingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>NSE/BSE Filing</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}

          <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {article.crossReferences.length} sources compared
          </span>
        </div>

        <button
          onClick={() => onSelectArticle(article)}
          className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-colors"
        >
          <span>Full Analysis</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
