import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight, Link, RefreshCw, FileText, Send, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { VerificationResult } from '../types';

interface RumorVerifierPageProps {
  onArticleAdded?: () => void;
}

export const RumorVerifierPage: React.FC<RumorVerifierPageProps> = ({ onArticleAdded }) => {
  const [inputText, setInputText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const samplePrompts = [
    'Viral WhatsApp Forward: "Paytm receiving instant RBI banking license revival tomorrow, stock will hit upper circuit 20% guaranteed!"',
    'Rumor: "Tata Motors planning $800M EV Gigafactory joint venture with European battery maker in Gujarat."',
    'News Claim: "SEBI ordered temporary trading suspension on top private bank due to accounting discrepancy."',
    'Headline: "Infosys signs $1.2B AI contract with major European bank, filing submitted to NSE."',
  ];

  const handleVerify = async (textToVerify = inputText) => {
    if (!textToVerify.trim() || textToVerify.trim().length < 5) {
      setError('Please enter a valid stock market news claim or URL snippet (at least 5 characters).');
      return;
    }

    setLoading(true);
    setError(null);
    setPublished(false);

    try {
      const res = await fetch('/api/verify-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToVerify,
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed');
      }

      setResult(data.result);
    } catch (err: any) {
      console.error('Error verifying custom text:', err);
      setError(err.message || 'Could not verify news claim at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToFeed = async () => {
    if (!inputText || !result) return;
    try {
      await fetch('/api/verify-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceUrl: sourceUrl.trim() || undefined,
          saveToFeed: true,
        }),
      });
      setPublished(true);
      if (onArticleAdded) onArticleAdded();
    } catch (err) {
      console.error('Error publishing:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Title & Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-indigo-600/20 blur-3xl" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          AI Rumor & News Credibility Engine
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight mb-3">
          Verify Any Stock Market News or WhatsApp Tip Instantaneously
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Paste news claims, rumors, social media stock forwards, or article URLs. Our Gemini LLM cross-references SEBI LODR Regulation 30 corporate filing norms and official exchange records.
        </p>
      </div>

      {/* Input Box Area */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
            Paste News Headline, WhatsApp Forward, or Claim Text:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder="e.g. Received a WhatsApp tip claiming Paytm is receiving instant RBI banking license revival tomorrow with 500% profit target..."
            className="w-full p-4 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Link className="w-3.5 h-3.5 text-slate-400" /> Optional Article or Source URL:
            </label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://t.me/... or https://news-site.com/article"
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-end h-full pt-1">
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Verify Credibility Now
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        {/* Sample Prompts */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Or try verifying these sample Indian market claims:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(prompt);
                  handleVerify(prompt);
                }}
                className="text-left text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 transition-all font-medium line-clamp-2"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden animate-fade-in">
          
          {/* Header Banner */}
          <div className={`p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 ${
            result.credibilityScore >= 80
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-950'
              : result.credibilityScore >= 50
              ? 'bg-gradient-to-r from-amber-700 to-slate-900'
              : 'bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center font-black shadow-md shrink-0">
                <span className="text-2xl font-mono leading-none">{result.credibilityScore}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">/ 100</span>
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-white/80 block mb-0.5">
                  VERIFICATION RESULT
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {result.credibilityStatus === 'verified'
                    ? 'Authentic / High Credibility'
                    : result.credibilityStatus === 'needs_verification'
                    ? 'Needs Regulatory Confirmation'
                    : 'Unverified / High Misinformation Risk'}
                </h3>
                <p className="text-xs text-white/80 mt-1 font-medium">
                  Detected Target: <strong>{result.companyDetected || 'Indian Listed Stock'}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handlePublishToFeed}
              disabled={published}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-60 flex items-center gap-1.5 shrink-0"
            >
              {published ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Published to Community Feed
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-indigo-600" /> Share Verification to Feed
                </>
              )}
            </button>
          </div>

          {/* Result Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Verdict Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider block">
                Executive AI Verdict:
              </span>
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {result.verdictSummary}
              </p>
            </div>

            {/* Investor Action Advice */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                  Recommended Action for Investors:
                </span>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {result.recommendedAction}
                </p>
              </div>
            </div>

            {/* LLM Detailed Reasoning */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
              <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Detailed Regulatory & News Analysis
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                {result.aiExplanation}
              </p>
            </div>

            {/* Claims vs Red Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Identified News Claims:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {result.keyClaims?.map((claim, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                <span className="text-xs font-extrabold text-rose-900 uppercase tracking-wider block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Detected Red Flags / Irregularities:
                </span>
                <ul className="space-y-1.5 text-xs text-rose-900 font-medium">
                  {result.redFlags?.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Expected Regulatory Filings */}
            {result.relatedOfficialFilings && result.relatedOfficialFilings.length > 0 && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider block flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-700" /> Relevant Mandatory Exchange Filings Checklist:
                </span>
                <div className="space-y-2 text-xs">
                  {result.relatedOfficialFilings.map((filing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-200/80">
                      <div>
                        <span className="font-bold text-slate-900 block">{filing.title}</span>
                        <span className="text-[11px] text-slate-500">{filing.filingDate}</span>
                      </div>
                      <a
                        href="https://www.nseindia.com/companies-listing/corporate-filings-announcements"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Check NSE Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
