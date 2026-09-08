import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, X, ExternalLink, CheckCircle2, FileText, Share2, Layers, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { NewsArticle } from '../types';

interface ArticleDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  isSaved?: boolean;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onToggleSave,
  isSaved = false,
}) => {
  if (!article) return null;

  const getStatusInfo = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-500 text-white',
        border: 'border-emerald-200',
        label: 'VERIFIED HIGH CREDIBILITY',
        icon: ShieldCheck,
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-amber-500 text-white',
        border: 'border-amber-200',
        label: 'NEEDS VERIFICATION / UNCONFIRMED',
        icon: ShieldAlert,
      };
    }
    return {
      bg: 'bg-rose-600 text-white',
      border: 'border-rose-200',
      label: 'HIGH MISINFORMATION RISK / UNVERIFIED RUMOR',
      icon: AlertTriangle,
    };
  };

  const status = getStatusInfo(article.credibilityScore);
  const StatusIcon = status.icon;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `StockLens AI Credibility Report: ${article.title}`,
        text: `Credibility Score: ${article.credibilityScore}/100 - ${article.summary}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title} - Credibility Score: ${article.credibilityScore}/100. Analyzed by StockLens AI.`);
      alert('Credibility summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {article.companySymbol}
                </span>
                <span className="text-xs text-slate-300 font-semibold">{article.companyName}</span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white leading-snug mt-1">
                StockLens AI Credibility Verification Report
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 text-slate-800 text-sm leading-relaxed">
          
          {/* Main Credibility Score Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg shrink-0 ${status.bg}`}>
                <span className="text-2xl font-mono leading-none">{article.credibilityScore}</span>
                <span className="text-[10px] uppercase font-bold opacity-90 mt-0.5">/ 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </div>
                <p className="text-sm text-slate-200 font-medium">
                  Source: <strong className="text-white">{article.source.name}</strong> ({article.source.reputationGrade} Rated)
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {article.officialFilingUrl && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> NSE/BSE Regulation 30 Filing Matched
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    Sector: {article.sector}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share Report
              </button>
              <button
                onClick={() => onToggleSave(article.id)}
                className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                  isSaved
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isSaved ? 'Saved in Watchlist' : 'Save Report'}
              </button>
            </div>
          </div>

          {/* Headline & Summary */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-3">
              {article.title}
            </h1>
            <p className="text-base text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
              {article.summary}
            </p>
          </div>

          {/* Detailed Score Factors Radar / Progress Bars */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Multi-Factor AI Credibility Score Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1 font-semibold text-xs">
                  <span className="text-slate-700">Source Reputation Weight (30%)</span>
                  <span className="font-mono text-indigo-700 font-bold">{article.credibilityBreakdown.sourceReputation}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.credibilityBreakdown.sourceReputation}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">Evaluates domain authority, past editorial compliance, and official regulatory press registration.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1 font-semibold text-xs">
                  <span className="text-slate-700">Cross-Reference Verification (30%)</span>
                  <span className="font-mono text-indigo-700 font-bold">{article.credibilityBreakdown.crossReferenceScore}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.credibilityBreakdown.crossReferenceScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">Checks if multiple independent news outlets corroborate the core claims without contradictions.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1 font-semibold text-xs">
                  <span className="text-slate-700">Language Objectivity & Tone (20%)</span>
                  <span className="font-mono text-indigo-700 font-bold">{article.credibilityBreakdown.languageObjectivity}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.credibilityBreakdown.languageObjectivity}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">Detects sensationalism, pump-and-dump rhetoric, or clickbait exaggeration.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1 font-semibold text-xs">
                  <span className="text-slate-700">NSE/BSE Regulatory Filings Match (20%)</span>
                  <span className="font-mono text-indigo-700 font-bold">{article.credibilityBreakdown.regulatoryBacking}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${article.credibilityBreakdown.regulatoryBacking}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">Verifies whether mandatory SEBI Regulation 30 corporate disclosures were submitted.</p>
              </div>

            </div>
          </div>

          {/* AI Reasoning Explanation */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
            <h3 className="font-bold text-indigo-950 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-700" />
              StockLens LLM Reasoning & Assessment
            </h3>
            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
              {article.aiExplanation}
            </p>
          </div>

          {/* Fact-Check Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Verified Facts / Key Claims */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Facts & Key Claims
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {article.verifiedFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
                {article.keyClaims.map((claim, idx) => (
                  <li key={`claim-${idx}`} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span><strong>Claim:</strong> {claim}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Flags & Risk Warnings */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
              <h4 className="font-extrabold text-rose-900 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Detected Red Flags & Biases
              </h4>
              {article.redFlags.length > 0 ? (
                <ul className="space-y-2 text-xs text-rose-900">
                  {article.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-rose-200/80">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 bg-white p-3 rounded-lg border border-emerald-200/80 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  No sensationalism, unbacked figures, or regulatory red flags detected in this article.
                </p>
              )}
            </div>

          </div>

          {/* Cross-Reference Comparison Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Cross-Reference Source Comparison
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {article.crossReferences.length + 1} Sources Analyzed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="p-3 rounded-tl-lg">Source Outlet</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Reported Headline</th>
                    <th className="p-3">Alignment Status</th>
                    <th className="p-3 rounded-tr-lg">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Primary source row */}
                  <tr className="bg-indigo-50/40">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      {article.source.name}
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-700">{article.source.reputationGrade}</td>
                    <td className="p-3 text-slate-800 font-semibold">{article.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                        Primary Source
                      </span>
                    </td>
                    <td className="p-3">
                      <a
                        href={article.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>

                  {/* Secondary cross ref rows */}
                  {article.crossReferences.map((cr) => (
                    <tr key={cr.id} className="hover:bg-slate-50/80">
                      <td className="p-3 text-slate-700 font-bold">{cr.sourceName}</td>
                      <td className="p-3 font-mono font-bold text-slate-600">{cr.reputationGrade}</td>
                      <td className="p-3 text-slate-700">{cr.headline}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          cr.alignment === 'corroborates'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cr.alignment === 'conflicts'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cr.alignment.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <a
                          href={cr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
                        >
                          Source <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Impact & Sentiment Section */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Expected Stock Market Impact & Sentiment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400">News Sentiment:</span>
                <p className={`text-base font-black uppercase mt-1 ${
                  article.sentiment === 'bullish' ? 'text-emerald-400' : article.sentiment === 'bearish' ? 'text-rose-400' : 'text-slate-300'
                }`}>
                  {article.sentiment}
                </p>
              </div>

              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400">Expected Volatility:</span>
                <p className="text-base font-black text-amber-300 mt-1">
                  {article.marketImpact.expectedVolatility}
                </p>
              </div>

              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400">Impacted Metrics:</span>
                <p className="text-xs text-slate-200 font-semibold mt-1">
                  {article.marketImpact.affectedMetrics.join(', ')}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
              {article.marketImpact.summary}
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {article.officialFilingUrl && (
              <a
                href={article.officialFilingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4" /> View Mandatory Exchange Disclosure (PDF) <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              Original Source Article <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
