import React, { useEffect, useState } from 'react';
import { BarChart3, ShieldCheck, ShieldAlert, AlertTriangle, PieChart, FileCheck, Award, Zap, RefreshCw } from 'lucide-react';
import { SectorAnalytics } from '../types';

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-semibold">Generating Sector Credibility & Fake News Radar...</p>
      </div>
    );
  }

  const { summary, sectorData } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0D1017] via-[#14181F] to-[#0D1017] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#1E222C] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold uppercase tracking-wider mb-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Stock Market News Credibility Radar
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Indian Equity News Verification Analytics
          </h1>
          <p className="text-sm text-slate-300 font-medium max-w-xl mt-1">
            Real-time telemetry measuring corporate filing compliance, news media accuracy, sector fake news frequency, and source reliability scores.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-[#161B22] hover:bg-[#1C2129] text-slate-200 font-bold text-xs rounded-xl border border-[#30363D] flex items-center gap-2 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Radar Data
        </button>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-[#14181F] p-5 rounded-2xl border border-[#1E222C] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Aggregated Credibility Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {summary.avgScore}%
          </div>
          <p className="text-xs text-slate-400 font-medium">Weighted across 6 major Indian market sectors</p>
        </div>

        <div className="bg-[#14181F] p-5 rounded-2xl border border-[#1E222C] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>NSE/BSE Filing Ratio</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {summary.officialFilingRatio}
          </div>
          <p className="text-xs text-slate-400 font-medium">Articles directly backed by SEBI Reg 30 filings</p>
        </div>

        <div className="bg-[#14181F] p-5 rounded-2xl border border-[#1E222C] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Verified Authentic News</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {summary.verifiedCount} <span className="text-xs text-slate-500 font-sans">/ {summary.totalArticles}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Fully verified by cross-referencing & filings</p>
        </div>

        <div className="bg-[#14181F] p-5 rounded-2xl border border-[#1E222C] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Flagged High-Risk Rumors</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black font-mono text-rose-400">
            {summary.highRiskCount}
          </div>
          <p className="text-xs text-slate-400 font-medium">Identified pump-and-dump or unverified forwards</p>
        </div>

      </div>

      {/* Sector Breakdown Grid */}
      <div className="bg-[#0D1017] p-6 rounded-3xl border border-[#1E222C] shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            Sector-Wise News Credibility & Misinformation Vulnerability
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Sectors like IT & Oil/Telecom show strict corporate disclosure compliance, whereas Fintech & Auto experience higher rumor frequencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sectorData.map((sec: SectorAnalytics) => (
            <div key={sec.sector} className="p-5 rounded-2xl bg-[#14181F] border border-[#1E222C] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-white text-sm">{sec.sector}</h3>
                  <span className="text-xs text-slate-400 font-medium">{sec.totalArticles} articles analyzed</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono ${
                  sec.avgCredibility >= 90 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : sec.avgCredibility >= 80 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {sec.avgCredibility}% Avg
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-[#1E222C] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${sec.avgCredibility >= 90 ? 'bg-emerald-500' : sec.avgCredibility >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${sec.avgCredibility}%` }}
                  />
                </div>
              </div>

              {/* Counts */}
              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <span className="text-emerald-400">✓ {sec.verifiedCount} Verified</span>
                <span className="text-rose-400">⚠ {sec.highRiskCount} High Risk</span>
              </div>

              <p className="text-[11px] text-slate-300 bg-[#0D1017] p-2.5 rounded-xl border border-[#1E222C] italic">
                "{sec.topTrend}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Source Reputation Leaderboard */}
      <div className="bg-[#0D1017] p-6 rounded-3xl border border-[#1E222C] shadow-xs space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          Indian Financial News Source Reliability Rating Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#14181F] text-slate-300 font-bold border-b border-[#1E222C]">
                <th className="p-3.5 rounded-tl-xl">Source Category</th>
                <th className="p-3.5">Reputation Grade</th>
                <th className="p-3.5">SEBI / Exchange Status</th>
                <th className="p-3.5">Accuracy Rating</th>
                <th className="p-3.5 rounded-tr-xl">Verification Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E222C] font-medium">
              <tr>
                <td className="p-3.5 font-bold text-white">NSE / BSE Official Corporate Announcements</td>
                <td className="p-3.5 font-mono font-bold text-indigo-400">A+</td>
                <td className="p-3.5 text-emerald-400 font-bold">Mandatory Reg 30 Filing</td>
                <td className="p-3.5 font-mono font-bold text-emerald-400">99.8%</td>
                <td className="p-3.5 text-slate-400">Direct exchange PDF & signed secretary token</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white">Tier-1 Business Media (ET, Moneycontrol, Mint, BS)</td>
                <td className="p-3.5 font-mono font-bold text-indigo-400">A</td>
                <td className="p-3.5 text-blue-400 font-semibold">Registered Financial Press</td>
                <td className="p-3.5 font-mono font-bold text-emerald-400">92.4%</td>
                <td className="p-3.5 text-slate-400">Editorial verification & two-source confirmation</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white">Niche Financial Portals & Tech News Blogs</td>
                <td className="p-3.5 font-mono font-bold text-amber-400">B</td>
                <td className="p-3.5 text-amber-400 font-semibold">Unaccredited Web Media</td>
                <td className="p-3.5 font-mono font-bold text-amber-400">71.0%</td>
                <td className="p-3.5 text-slate-400">Subject to pilot rumors & unconfirmed insider leaks</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-white">Telegram / WhatsApp Stock Forwards & X Rumors</td>
                <td className="p-3.5 font-mono font-bold text-rose-400">D / F</td>
                <td className="p-3.5 text-rose-400 font-bold">Unregulated Social Channels</td>
                <td className="p-3.5 font-mono font-bold text-rose-400">22.5%</td>
                <td className="p-3.5 text-slate-400">Frequent pump-and-dump & fake regulatory letters</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
