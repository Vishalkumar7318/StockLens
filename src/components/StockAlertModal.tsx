import React, { useState } from 'react';
import { StockAlert, StockIntelligenceData } from '../types';
import { Bell, X, Check, ShieldAlert, Plus, Trash2 } from 'lucide-react';

interface StockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockIntelligenceData;
  activeAlerts: StockAlert[];
  onAddAlert: (alert: StockAlert) => void;
  onRemoveAlert: (id: string) => void;
}

export const StockAlertModal: React.FC<StockAlertModalProps> = ({
  isOpen,
  onClose,
  stock,
  activeAlerts,
  onAddAlert,
  onRemoveAlert,
}) => {
  const [alertType, setAlertType] = useState<StockAlert['type']>('price_above');
  const [targetVal, setTargetVal] = useState<string>(stock.price.toString());
  const [createdToast, setCreatedToast] = useState(false);

  if (!isOpen) return null;

  const stockAlerts = activeAlerts.filter((a) => a.symbol === stock.symbol);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(targetVal);

    let desc = '';
    if (alertType === 'price_above') desc = `Trigger when price rises above ₹${num || stock.price}`;
    else if (alertType === 'price_below') desc = `Trigger when price drops below ₹${num || stock.price}`;
    else if (alertType === 'pct_move') desc = `Trigger on intraday price move > ${num || 3}%`;
    else if (alertType === 'volume_spike') desc = `Trigger when trading volume exceeds 2x daily average`;
    else if (alertType === 'breakout') desc = `Trigger on technical breakout above ₹${stock.levels.resistance1}`;
    else if (alertType === 'breakdown') desc = `Trigger on technical breakdown below ₹${stock.levels.support1}`;
    else if (alertType === 'important_news') desc = `Trigger when official exchange filing or verified news is posted`;
    else if (alertType === 'negative_news') desc = `Trigger on high risk or unverified rumor alert`;
    else desc = `Trigger on quarterly earnings result announcement`;

    const newAlert: StockAlert = {
      id: `alert-${Date.now()}`,
      symbol: stock.symbol,
      companyName: stock.name,
      type: alertType,
      targetValue: isNaN(num) ? undefined : num,
      conditionDescription: desc,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddAlert(newAlert);
    setCreatedToast(true);
    setTimeout(() => setCreatedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden flex flex-col border border-slate-200 shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Real-Time Stock Lens Alerts
              </div>
              <h2 className="text-lg font-black text-white">
                Set Alert for {stock.symbol}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Select Trigger Condition
            </label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as StockAlert['type'])}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="price_above">Price Above Target Level (₹)</option>
              <option value="price_below">Price Below Target Level (₹)</option>
              <option value="pct_move">Price Intraday Movement (%)</option>
              <option value="volume_spike">Unusual Volume Spike (RVOL &gt; 2x)</option>
              <option value="breakout">Resistance Breakout Trigger (above ₹{stock.levels.resistance1})</option>
              <option value="breakdown">Support Breakdown Trigger (below ₹{stock.levels.support1})</option>
              <option value="important_news">Official Exchange Filing / Verified News</option>
              <option value="negative_news">High Risk Fake News / Rumor Warning</option>
              <option value="results">Quarterly Financial Results Announcement</option>
            </select>
          </div>

          {(alertType === 'price_above' || alertType === 'price_below' || alertType === 'pct_move') && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Target Threshold Value
              </label>
              <input
                type="number"
                step="any"
                value={targetVal}
                onChange={(e) => setTargetVal(e.target.value)}
                placeholder="e.g. 4350"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Alert Rule
          </button>

          {createdToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              Alert rule successfully activated!
            </div>
          )}
        </form>

        {/* Existing Active Alerts for this stock */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span>Active Alerts ({stockAlerts.length})</span>
            <span className="text-[10px] text-indigo-600">Push Notifications Enabled</span>
          </h3>

          {stockAlerts.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium">No active alerts configured for {stock.symbol}.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stockAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs font-semibold"
                >
                  <div>
                    <p className="text-slate-900 font-bold">{alt.conditionDescription}</p>
                    <span className="text-[10px] text-slate-400 font-mono">Created at {alt.createdAt}</span>
                  </div>
                  <button
                    onClick={() => onRemoveAlert(alt.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
