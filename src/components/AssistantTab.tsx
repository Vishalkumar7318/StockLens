import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, ShieldCheck, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';

export const AssistantTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I am **StockLens AI Assistant**, your dedicated Indian stock market news & credibility analyst.

You can ask me to:
• Evaluate the credibility of recent news surrounding any NSE/BSE listed company.
• Explain complex SEBI corporate disclosures or quarter result filings.
• Check whether a stock market rumor circulating on social media is authentic or fake.

What would you like to verify today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'Is the Paytm RBI license revival rumor true?',
        'Summarize TCS $1.2B European deal credibility',
        'Are there any unverified rumors about Tata Motors?',
        'How to verify SEBI Regulation 30 corporate filings?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Assistant request failed');
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error in AI Assistant chat:', err);
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, I am temporarily unable to connect to the Gemini AI engine. Please verify that your connection is active and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-10rem)] flex flex-col animate-fade-in">
      
      {/* Header */}
      <div className="bg-[#0D1017] text-white p-4 sm:p-5 rounded-t-3xl border border-[#1E222C] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base">StockLens AI Investment Assistant</h2>
            <p className="text-xs text-slate-400 font-medium">Powered by Gemini LLM & SEBI Corporate Filing Knowledge Base</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-300 font-bold hidden sm:inline">Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-[#14181F] p-4 sm:p-6 overflow-y-auto space-y-4 border-x border-[#1E222C]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-[#0D1017] border border-[#1E222C] text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-400" />}
            </div>

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                : 'bg-[#0D1017] text-[#E0E2E6] border border-[#1E222C] rounded-tl-none font-normal'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              
              {/* Suggested Prompts if any */}
              {msg.suggestedPrompts && (
                <div className="mt-4 pt-3 border-t border-[#1E222C] space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Suggested Quick Prompts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestedPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(p)}
                        className="text-left text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <span className={`block text-[10px] mt-2 font-mono ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0D1017] border border-[#1E222C] text-white flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
            <div className="bg-[#0D1017] p-3 rounded-2xl border border-[#1E222C] text-xs text-slate-300 font-medium flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              StockLens AI is verifying company disclosures and synthesizing answer...
            </div>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="bg-[#0D1017] p-4 rounded-b-3xl border border-[#1E222C] shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask StockLens AI about any Indian company news, rumor, or filing..."
            className="flex-1 px-4 py-3 text-xs sm:text-sm bg-[#14181F] text-white placeholder-slate-500 border border-[#1E222C] rounded-2xl focus:bg-[#161B22] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-md transition-all disabled:opacity-50 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
