import express from 'express';
import path from 'path';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import Parser from 'rss-parser';
import { INDIAN_COMPANIES, INITIAL_NEWS_ARTICLES, SECTOR_ANALYTICS_DATA } from './src/data/mockData';
import { NewsArticle, VerificationResult } from './src/types';
import { getStockIntelligence } from './src/services/stockDataService';
import { executeStockMasterSearch, syncExchangeStockMaster, getUniverseStats } from './src/services/stockSearchEngine';
import {
  fetchLiveBenchmarks,
  subscribeToBenchmarkTicks,
  setMarketSimulationMode,
  getMarketSimulationMode,
} from './src/services/benchmarkService';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// In-memory news repository (seeded with initial articles, dynamic additions supported)
let newsArticlesRepo: NewsArticle[] = [...INITIAL_NEWS_ARTICLES];

// RSS Feed parser instance
const rssParser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) StockLensAI/1.0',
  },
});

// API Routes

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'StockLens AI',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 1b. Real-Time Indian Benchmarks (NIFTY 50, SENSEX, BANKNIFTY, NIFTY IT, etc.)
app.get('/api/benchmarks', async (req, res) => {
  try {
    const data = await fetchLiveBenchmarks();
    res.json(data);
  } catch (err: any) {
    console.error('Error fetching live Indian benchmarks:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch benchmarks', error: err.message });
  }
});

// 1c. Real-Time 1-Second SSE Stream for Indian Benchmarks
app.get('/api/benchmarks/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send immediate initial tick snapshot
  try {
    const initialData = await fetchLiveBenchmarks();
    res.write(`data: ${JSON.stringify(initialData)}\n\n`);
  } catch (err) {
    // Ignore initial error
  }

  // Subscribe to high-frequency 1-second benchmark ticks
  const unsubscribe = subscribeToBenchmarkTicks((tickData) => {
    res.write(`data: ${JSON.stringify(tickData)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

// 1d. Toggle or get simulation mode (Default: 'auto' which freezes when market is closed)
app.get('/api/benchmarks/simulation', (req, res) => {
  res.json({ success: true, mode: getMarketSimulationMode() });
});

app.post('/api/benchmarks/simulation', (req, res) => {
  const { mode } = req.body;
  if (mode === 'auto' || mode === 'simulate_live') {
    setMarketSimulationMode(mode);
  }
  res.json({ success: true, mode: getMarketSimulationMode() });
});

// 2. Get companies list
app.get('/api/companies', (req, res) => {
  const { search, sector } = req.query;
  let result = [...INDIAN_COMPANIES];

  if (sector && typeof sector === 'string' && sector !== 'All') {
    result = result.filter((c) => c.sector.toLowerCase() === sector.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const query = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query) ||
        c.nseSymbol.toLowerCase().includes(query) ||
        c.bseCode.includes(query)
    );
  }

  res.json({ success: true, count: result.length, companies: result });
});

// 2b. Stock Master Search Engine across Complete Indian Equity Universe
app.get('/api/stocks/search', (req, res) => {
  const q = (req.query.q as string || '').trim();
  const exchange = (req.query.exchange as any) || 'ALL';
  const securityType = (req.query.securityType as any) || 'ALL';
  const status = (req.query.status as any) || 'ACTIVE';
  const sort = (req.query.sort as any) || 'relevance';
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);

  const searchResponse = executeStockMasterSearch({
    q,
    exchange,
    securityType,
    status,
    sort,
    page,
    limit,
  });

  res.json(searchResponse);
});

// 2c. Stock Universe Statistics
app.get('/api/stocks/stats', (req, res) => {
  const stats = getUniverseStats();
  res.json({ success: true, stats });
});

// 2d. Sync Exchange Stock Master
app.post('/api/stocks/sync', async (req, res) => {
  const stats = await syncExchangeStockMaster();
  res.json({ success: true, stats, message: 'Exchange Stock Master re-synchronized successfully.' });
});

// 2e. Get Stock Intelligence Data for a given symbol or ISIN
app.get('/api/stock/:symbol', (req, res) => {
  const symbol = req.params.symbol;
  const stockData = getStockIntelligence(symbol, INDIAN_COMPANIES, newsArticlesRepo);
  res.json({ success: true, data: stockData });
});

// 2d. AI Stock Explanation via Gemini AI
app.post('/api/stock/ai-analysis', async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ success: false, message: 'Stock symbol is required' });
  }

  const stockData = getStockIntelligence(symbol, INDIAN_COMPANIES, newsArticlesRepo);

  try {
    const ai = getAiClient();
    const prompt = `You are StockLens AI, an institutional-grade Indian Equity Analyst.
Analyze the following stock based STRICTLY on its actual provided data metrics:

Company: ${stockData.name} (${stockData.symbol})
Sector: ${stockData.sector} | Industry: ${stockData.industry}
Current Price: ₹${stockData.price} (${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent}%)
Overall StockLens AI Score: ${stockData.overallScore}/100 (${stockData.scoreLabel})

Sub-Scores:
- Technical Score: ${stockData.technicalScore}/100 (RSI: ${stockData.technicals.rsi}, Trend: ${stockData.technicals.trend})
- Fundamental Score: ${stockData.fundamentalScore}/100 (P/E: ${stockData.fundamentals.pe}x, ROE: ${stockData.fundamentals.roePct}%, Debt/Equity: ${stockData.fundamentals.debtToEquity})
- Momentum Score: ${stockData.momentumScore}/100
- Volume Score: ${stockData.volumeScore}/100 (RVOL: ${stockData.volumeAnalysis.relativeVolumeRvol}x)
- News Credibility Score: ${stockData.newsScore}/100 (Verified news ratio)
- Market & Sector Score: ${stockData.marketSectorScore}/100 (${stockData.marketSector.classification})
- Risk Score: ${stockData.riskScore}/100 (${stockData.riskAnalysis.level} RISK)

Key Support: ₹${stockData.levels.support1} | Resistance: ₹${stockData.levels.resistance1}

Provide a clear, objective, plain-English explanation for Indian investors in JSON matching this schema:
{
  "overallSummary": "Clear 2-3 sentence explanation of why StockLens AI assigned this overall score based on the actual metrics.",
  "trendSummary": "Explanation of technical trend, momentum, and volume interaction.",
  "positiveFactors": ["Array of top 3-4 strongest positive signals based on data"],
  "riskFactors": ["Array of top 2-3 biggest risk factors"],
  "whatToWatch": ["Array of 2-3 upcoming catalysts or key support/resistance levels to watch"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      analysis: parsed,
    });
  } catch (err: any) {
    console.warn('Fallback to deterministic AI analysis:', err.message);
    res.json({
      success: true,
      analysis: stockData.aiExplanation,
    });
  }
});

// 3. Get news articles
app.get('/api/news', (req, res) => {
  const { company, sector, category, status, search, minScore } = req.query;
  let filtered = [...newsArticlesRepo];

  if (company && typeof company === 'string' && company !== 'All') {
    filtered = filtered.filter(
      (a) => a.companySymbol.toUpperCase() === company.toUpperCase()
    );
  }

  if (sector && typeof sector === 'string' && sector !== 'All') {
    filtered = filtered.filter((a) => a.sector.toLowerCase() === sector.toLowerCase());
  }

  if (category && typeof category === 'string' && category !== 'All') {
    filtered = filtered.filter((a) => a.category === category);
  }

  if (status && typeof status === 'string' && status !== 'All') {
    filtered = filtered.filter((a) => a.credibilityStatus === status);
  }

  if (minScore && !isNaN(Number(minScore))) {
    const scoreVal = Number(minScore);
    filtered = filtered.filter((a) => a.credibilityScore >= scoreVal);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.companyName.toLowerCase().includes(q) ||
        a.companySymbol.toLowerCase().includes(q) ||
        a.source.name.toLowerCase().includes(q)
    );
  }

  // Sort by publishedAt descending
  filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  res.json({ success: true, count: filtered.length, news: filtered });
});

// 4. Get single news article by ID
app.get('/api/news/:id', (req, res) => {
  const article = newsArticlesRepo.find((a) => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, message: 'Article not found' });
  }
  res.json({ success: true, article });
});

// 5. Verify custom text / URL / Rumor using Gemini AI
app.post('/api/verify-custom', async (req, res) => {
  const { text, sourceUrl } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Please provide valid news text, headline, or claim to verify.',
    });
  }

  try {
    const ai = getAiClient();
    const prompt = `You are StockLens AI, an expert financial news verification engine specialized in the Indian Stock Market (NSE/BSE/SEBI regulations).
Analyze the following news claim, WhatsApp stock message, or rumor provided by an investor:

Content to verify: "${text.trim()}"
Optional Source URL: "${sourceUrl || 'N/A'}"

Evaluate the credibility of this stock market information based on:
1. Indian regulatory disclosure requirements (SEBI LODR Regulation 30, NSE/BSE corporate filings, RBI circulars, CCI approvals).
2. Language objectivity and presence of hype/sensationalism (e.g., "guaranteed 500% profit", "insider secret", "buy immediately before market opens").
3. Typical corporate news patterns vs unverified market rumors/pump-and-dump signals.

Return JSON strictly matching this schema:
{
  "companyDetected": "Name & Stock Symbol if identifiable (e.g., Paytm / PAYTM, TCS / TCS) or 'General Market / Unspecified'",
  "credibilityScore": integer between 0 and 100,
  "credibilityStatus": "verified" (if 80-100) or "needs_verification" (if 50-79) or "high_risk" (if 0-49),
  "verdictSummary": "A concise 1-2 sentence verdict for investors",
  "aiExplanation": "Detailed 2-3 paragraph explanation of why this score was assigned",
  "keyClaims": ["array of key claims made in the input text"],
  "redFlags": ["array of red flags, sensational phrasing, or missing official disclosures"],
  "recommendedAction": "Actionable advice for retail investors (e.g., 'Do not trade based on this forward; wait for official NSE announcement')",
  "relatedOfficialFilings": [
    {
      "title": "Title of expected or existing regulatory document",
      "filingDate": "e.g., 'Recent SEBI Circular' or 'Pending Exchange Disclosure'",
      "url": "https://www.nseindia.com"
    }
  ],
  "matchedMediaReports": [
    {
      "source": "Name of top financial publication (e.g., Economic Times / Moneycontrol)",
      "title": "Headline of related news",
      "matchDegree": "Corroborated / Unconfirmed / Contradicted",
      "url": "https://www.moneycontrol.com"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    const parsed: VerificationResult = JSON.parse(responseText);

    // Also auto-add to repository if requested
    if (req.body.saveToFeed) {
      const newArticle: NewsArticle = {
        id: `custom-${Date.now()}`,
        companySymbol: parsed.companyDetected?.split('/')?.[1]?.trim() || 'MARKET',
        companyName: parsed.companyDetected || 'Custom Investor Claim',
        sector: 'General Market',
        title: text.length > 80 ? text.substring(0, 80) + '...' : text,
        summary: parsed.verdictSummary,
        source: {
          name: sourceUrl ? 'User Submitted Link' : 'Custom User Input',
          type: 'social_unverified',
          reputationGrade: parsed.credibilityScore > 75 ? 'B' : 'D',
          reputationScore: parsed.credibilityScore,
          domain: sourceUrl ? new URL(sourceUrl).hostname : 'user-submission',
          isOfficialExchange: false,
        },
        category: 'Market Rumor',
        publishedAt: new Date().toISOString(),
        originalUrl: sourceUrl || '#',
        credibilityScore: parsed.credibilityScore,
        credibilityStatus: parsed.credibilityStatus,
        credibilityBreakdown: {
          sourceReputation: Math.round(parsed.credibilityScore * 0.9),
          crossReferenceScore: Math.round(parsed.credibilityScore * 0.85),
          languageObjectivity: Math.round(parsed.credibilityScore * 0.95),
          regulatoryBacking: Math.round(parsed.credibilityScore * 0.8),
        },
        aiExplanation: parsed.aiExplanation,
        keyClaims: parsed.keyClaims || [],
        verifiedFacts: parsed.credibilityScore > 70 ? ['Analyzed by StockLens AI engine'] : [],
        redFlags: parsed.redFlags || [],
        crossReferences: parsed.matchedMediaReports.map((m, idx) => ({
          id: `cr-user-${idx}`,
          sourceName: m.source,
          sourceType: 'top_business_media',
          reputationGrade: 'A',
          headline: m.title,
          publishedTime: 'Recent',
          alignment: m.matchDegree.toLowerCase().includes('corroborat') ? 'corroborates' : 'conflicts',
          excerpt: m.title,
          url: m.url,
        })),
        sentiment: parsed.credibilityScore < 50 ? 'bearish' : 'neutral',
        marketImpact: {
          expectedVolatility: parsed.credibilityScore < 50 ? 'High' : 'Medium',
          affectedMetrics: ['Investor Sentiment', 'Short-term Speculation'],
          summary: parsed.recommendedAction,
        },
      };
      newsArticlesRepo.unshift(newArticle);
    }

    res.json({ success: true, result: parsed });
  } catch (err: any) {
    console.error('Error in /api/verify-custom:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to complete AI credibility verification.',
      error: err.message,
    });
  }
});

// 6. StockLens AI Investment Assistant (Chat)
app.post('/api/ai-assistant', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const ai = getAiClient();
    
    // Build context with current news database and companies
    const contextArticles = newsArticlesRepo.slice(0, 5).map(a => `
Company: ${a.companyName} (${a.companySymbol})
Title: ${a.title}
Credibility Score: ${a.credibilityScore}/100 (${a.credibilityStatus})
Explanation: ${a.aiExplanation}
Key Claims: ${a.keyClaims.join('; ')}
Red Flags: ${a.redFlags.join('; ')}
`).join('\n---\n');

    const systemInstruction = `You are StockLens AI Assistant, a specialized financial news analyst for the Indian Stock Market.
Your job is to provide factual, objective, regulatory-aware answers to investors regarding news credibility, stock market disclosures, SEBI compliance, NSE/BSE filings, and fake news risk.
You have real-time access to the StockLens news database:
${contextArticles}

Guidelines:
- Explain financial news with high clarity for Indian retail investors.
- Emphasize checking official exchange filings (NSE/BSE Regulation 30) before acting on market rumors.
- Highlight credibility scores and red flags whenever discussing stock news.
- Keep tone professional, analytical, objective, and unbiased. Do NOT give direct buy/sell advice, but rather evaluate the credibility of news driving stock prices.`;

    const chatPrompt = `${systemInstruction}\n\nUser Question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: chatPrompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'I apologize, I could not analyze that query at the moment.',
    });
  } catch (err: any) {
    console.error('Error in /api/ai-assistant:', err);
    res.status(500).json({
      success: false,
      message: 'AI Assistant error',
      error: err.message,
    });
  }
});

// 7. Get Sector Analytics & Market Overview
app.get('/api/analytics', (req, res) => {
  const totalArticles = newsArticlesRepo.length;
  const verifiedCount = newsArticlesRepo.filter((a) => a.credibilityStatus === 'verified').length;
  const needsVerifCount = newsArticlesRepo.filter((a) => a.credibilityStatus === 'needs_verification').length;
  const highRiskCount = newsArticlesRepo.filter((a) => a.credibilityStatus === 'high_risk').length;

  const avgScore = totalArticles > 0
    ? Math.round(newsArticlesRepo.reduce((acc, a) => acc + a.credibilityScore, 0) / totalArticles)
    : 0;

  res.json({
    success: true,
    summary: {
      totalArticles,
      verifiedCount,
      needsVerifCount,
      highRiskCount,
      avgScore,
      officialFilingRatio: `${Math.round((newsArticlesRepo.filter((a) => a.source.isOfficialExchange).length / totalArticles) * 100)}%`,
    },
    sectorData: SECTOR_ANALYTICS_DATA,
  });
});

// 8. Fetch Live RSS Feeds (Moneycontrol / ET / LiveMint) and run through AI Credibility Scorer
app.get('/api/fetch-live-rss', async (req, res) => {
  const rssUrls = [
    'https://www.moneycontrol.com/rss/MCtopnews.xml',
    'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms',
  ];

  let fetchedItems: any[] = [];

  for (const url of rssUrls) {
    try {
      const feed = await rssParser.parseURL(url);
      if (feed && feed.items) {
        fetchedItems.push(...feed.items.slice(0, 3));
      }
    } catch (e) {
      console.warn(`Could not parse RSS feed ${url}:`, (e as Error).message);
    }
  }

  if (fetchedItems.length === 0) {
    return res.json({
      success: true,
      message: 'RSS feed parsing restricted by external connection or format. Current news database remains fully active.',
      addedCount: 0,
      news: newsArticlesRepo,
    });
  }

  res.json({
    success: true,
    fetchedCount: fetchedItems.length,
    rawTitles: fetchedItems.map((i) => i.title),
  });
});

// Vite Development or Production Server Handler
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[StockLens AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
