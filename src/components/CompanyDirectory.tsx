import React, { useState } from 'react';
import { Building2, Search, ShieldCheck, AlertTriangle, ArrowRight, Filter, TrendingUp } from 'lucide-react';
import { Company } from '../types';

interface CompanyDirectoryProps {
  companies: Company[];
  onSelectCompany: (symbol: string) => void;
}

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({ companies, onSelectCompany }) => {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');

  const sectors = ['All', 'Oil, Gas & Telecom', 'Information Technology', 'Banking & Finance', 'Automobile', 'Conglomerate & Infra', 'Consumer Tech', 'Fintech & Digital Services'];

  const filtered = companies.filter((c) => {
    const matchesSector = selectedSector === 'All' || c.sector === selectedSector;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.nseSymbol.toLowerCase().includes(search.toLowerCase()) ||
      c.bseCode.includes(search);
    return matchesSector && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      
      {/* Directory Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 mb-2">
            <Building2 className="w-4 h-4" /> NSE & BSE Corporate Coverage
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Indian Stock Market Company Directory
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Monitor news credibility scores, official exchange announcements, and rumor alert frequencies for top listed entities.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
            <span className="text-xs text-slate-500 font-semibold block">Tracked Companies</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{companies.length}</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-200/80 p-3 rounded-2xl text-center">
            <span className="text-xs text-indigo-700 font-semibold block">Avg News Credibility</span>
            <span className="text-xl font-extrabold text-indigo-900 font-mono">87.4%</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol, company name..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedSector === sec
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((company) => (
          <div
            key={company.symbol}
            onClick={() => onSelectCompany(company.symbol)}
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                    {company.symbol.substring(0, 4)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {company.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <span>NSE: {company.nseSymbol}</span>
                      <span>•</span>
                      <span>BSE: {company.bseCode}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase">
                  {company.marketCapCategory}
                </span>
              </div>

              {/* Sector */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md">
                  {company.sector}
                </span>
              </div>

              {/* Credibility Health Meter */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    News Credibility Health
                  </span>
                  <span className={`font-mono ${
                    company.credibilityHealthScore >= 80 ? 'text-emerald-600' : company.credibilityHealthScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {company.credibilityHealthScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      company.credibilityHealthScore >= 80 ? 'bg-emerald-500' : company.credibilityHealthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${company.credibilityHealthScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">{company.recentNewsCount} News Items</span>
                {company.unverifiedRumorAlerts > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    {company.unverifiedRumorAlerts} Rumors Flagged
                  </span>
                )}
              </div>

              <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-bold">
                View News <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
