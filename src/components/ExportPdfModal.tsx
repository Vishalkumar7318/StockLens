import React, { useState } from 'react';
import {
  X,
  FileDown,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowDownToLine,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { StockIntelligenceData, NewsArticle } from '../types';
import { generateStockIntelligencePDF } from '../services/pdfReportGenerator';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockData: StockIntelligenceData;
  newsArticles: NewsArticle[];
  aiExplanation?: StockIntelligenceData['aiExplanation'];
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  stockData,
  newsArticles,
  aiExplanation,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState('');
  const [downloadedBlobUrl, setDownloadedBlobUrl] = useState('');

  if (!isOpen) return null;

  const relevantArticlesCount = newsArticles.filter(
    (a) =>
      a.companySymbol.toUpperCase() === stockData.symbol.toUpperCase() ||
      a.companyName.toLowerCase().includes(stockData.name.toLowerCase()) ||
      a.title.toLowerCase().includes(stockData.symbol.toLowerCase())
  ).length;

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      // Allow brief tick so UI shows generating state
      await new Promise((resolve) => setTimeout(resolve, 300));

      const res = await generateStockIntelligencePDF(
        stockData,
        newsArticles,
        aiExplanation
      );

      setDownloadedFileName(res.fileName);
      if (res.blobUrl) {
        setDownloadedBlobUrl(res.blobUrl);
      }
      setExportSuccess(true);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (downloadedBlobUrl) {
      window.open(downloadedBlobUrl, '_blank');
    }
  };

  return (
    <div
      id="export-pdf-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="export-pdf-modal-content"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Export Offline Intelligence Dossier
                </h2>
                <p className="text-xs text-slate-400">
                  Formatted publication-ready PDF for offline reading & compliance records
                </p>
              </div>
            </div>

            <button
              id="btn-close-pdf-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stock Strip */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{stockData.name}</span>
              <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 text-[10px]">
                {stockData.symbol}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span>₹{stockData.price.toLocaleString()}</span>
              <span className="text-indigo-400">•</span>
              <span className="text-emerald-400 font-bold">Score: {stockData.overallScore}/100</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Inclusion Checklist */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Report Dossier Contents (3-Page Executive Document)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">AI Multidimensional Scorecard</div>
                  <div className="text-[11px] text-slate-500">7-factor breakdown & rating label</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">AI Strategic Narrative</div>
                  <div className="text-[11px] text-slate-500">Drivers, risk factors & catalysts</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">News & Rumor Verification Audit</div>
                  <div className="text-[11px] text-slate-500">
                    {relevantArticlesCount} verified articles & claims with SEBI check
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Technical Key Levels</div>
                  <div className="text-[11px] text-slate-500">S1, S2, R1, R2, Pivot & moving averages</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Calculated Trade Setup</div>
                  <div className="text-[11px] text-slate-500">Entry, target, stop-loss & risk:reward</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Fundamentals & Ownership</div>
                  <div className="text-[11px] text-slate-500">P/E, ROE, FII/DII shareholding & audit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Banner if exported */}
          {exportSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">PDF Dossier Successfully Generated!</div>
                  <div className="text-[11px] text-emerald-700 font-mono mt-0.5 break-all">{downloadedFileName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {downloadedBlobUrl && (
                  <button
                    id="btn-open-pdf-tab"
                    onClick={handleOpenInNewTab}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100/60 text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                    Open in Tab
                  </button>
                )}
                <button
                  id="btn-download-again"
                  onClick={handleExport}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors shadow-2xs"
                >
                  Download Again
                </button>
              </div>
            </div>
          )}

          {/* Feature Specs */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">Offline Portability:</span> The exported PDF is formatted with standard high-contrast typography, running headers/footers, and clean layout tables for offline reading, printing, or archival without requiring active internet connectivity.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            id="btn-cancel-pdf"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Close
          </button>

          <button
            id="btn-trigger-pdf-download"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowDownToLine className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Generating Formatted PDF...' : 'Download Formatted PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
