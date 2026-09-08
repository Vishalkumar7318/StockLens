export type CredibilityStatus = 'verified' | 'needs_verification' | 'high_risk';

export type SourceType = 'official_filing' | 'top_business_media' | 'financial_portal' | 'social_unverified' | 'press_release';

export type SentimentType = 'bullish' | 'bearish' | 'neutral' | 'mixed';

export interface NewsSource {
  name: string;
  type: SourceType;
  reputationGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  reputationScore: number; // 0-100
  domain: string;
  isOfficialExchange: boolean;
}

export interface CredibilityBreakdown {
  sourceReputation: number; // 30% weight
  crossReferenceScore: number; // 30% weight
  languageObjectivity: number; // 20% weight
  regulatoryBacking: number; // 20% weight
}

export interface CrossReference {
  id: string;
  sourceName: string;
  sourceType: SourceType;
  reputationGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  headline: string;
  publishedTime: string;
  alignment: 'corroborates' | 'partial' | 'conflicts' | 'unconfirmed';
  excerpt: string;
  url: string;
}

export interface NewsArticle {
  id: string;
  companySymbol: string;
  companyName: string;
  sector: string;
  title: string;
  summary: string;
  fullContent?: string;
  source: NewsSource;
  category: 'Corporate Action' | 'Financial Results' | 'Acquisition / Merger' | 'Regulatory & Law' | 'Market Rumor' | 'Management Change' | 'ESG & Sustainability';
  publishedAt: string;
  originalUrl: string;
  officialFilingUrl?: string; // NSE/BSE filing link if available
  credibilityScore: number; // 0-100
  credibilityStatus: CredibilityStatus;
  credibilityBreakdown: CredibilityBreakdown;
  aiExplanation: string;
  keyClaims: string[];
  verifiedFacts: string[];
  redFlags: string[];
  crossReferences: CrossReference[];
  sentiment: SentimentType;
  marketImpact: {
    expectedVolatility: 'High' | 'Medium' | 'Low';
    affectedMetrics: string[];
    summary: string;
  };
  isSaved?: boolean;
}

export interface Company {
  symbol: string;
  name: string;
  sector: string;
  nseSymbol: string;
  bseCode: string;
  marketCapRank: number;
  marketCapCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap';
  logoUrl?: string;
  credibilityHealthScore: number; // Avg credibility of recent news
  recentNewsCount: number;
  unverifiedRumorAlerts: number;
}

export interface SectorAnalytics {
  sector: string;
  totalArticles: number;
  avgCredibility: number;
  verifiedCount: number;
  highRiskCount: number;
  topTrend: string;
}

export interface VerificationResult {
  headlineOrText: string;
  companyDetected?: string;
  credibilityScore: number;
  credibilityStatus: CredibilityStatus;
  aiExplanation: string;
  keyClaims: string[];
  redFlags: string[];
  verdictSummary: string;
  recommendedAction: string;
  relatedOfficialFilings: {
    title: string;
    filingDate: string;
    url: string;
  }[];
  matchedMediaReports: {
    source: string;
    title: string;
    matchDegree: string;
    url: string;
  }[];
}

export interface StockAlert {
  id: string;
  symbol: string;
  companyName: string;
  type: 'price_above' | 'price_below' | 'pct_move' | 'volume_spike' | 'breakout' | 'breakdown' | 'important_news' | 'negative_news' | 'results';
  targetValue?: number;
  conditionDescription: string;
  createdAt: string;
  isTriggered?: boolean;
}

export interface MetricInterpretation {
  metric: string;
  currentValue: string;
  previousValue: string;
  trend: 'improving' | 'stable' | 'declining';
  interpretation: 'Positive' | 'Neutral' | 'Caution';
}

export interface QuarterlyResultItem {
  quarter: string;
  revenue: number; // in Cr ₹
  ebitda: number;
  netProfit: number;
  eps: number;
  label: 'Improving' | 'Stable' | 'Declining';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  ema100?: number;
  ema200?: number;
  vwap?: number;
  bollingerUpper?: number;
  bollingerLower?: number;
}

export interface StockDataSource {
  name: string;
  timestamp: string;
  status: 'LIVE' | 'DELAYED' | 'LAST UPDATED' | 'UNAVAILABLE';
}

export interface StockIntelligenceData {
  symbol: string;
  name: string;
  nseSymbol: string;
  bseCode: string;
  sector: string;
  industry: string;
  
  price: number;
  change: number;
  changePercent: number;
  marketCapCr: number;
  high52: number;
  low52: number;
  volume: number;
  avgVolume: number;
  
  // StockLens AI Scores
  overallScore: number; // 0-100
  scoreLabel: 'VERY STRONG' | 'STRONG' | 'POSITIVE' | 'NEUTRAL' | 'WEAK' | 'HIGH RISK';
  technicalScore: number;
  fundamentalScore: number;
  momentumScore: number;
  volumeScore: number;
  newsScore: number;
  marketSectorScore: number;
  riskScore: number;

  // AI Explanation
  aiExplanation: {
    overallSummary: string;
    trendSummary: string;
    positiveFactors: string[];
    riskFactors: string[];
    whatToWatch: string[];
  };

  // Technical Indicators
  technicals: {
    rsi: number;
    macd: { macdLine: number; signalLine: number; histogram: number };
    adx: number;
    atr: number;
    stochastic: { k: number; d: number };
    supertrend: { value: number; signal: 'Bullish' | 'Bearish' };
    vwap: number;
    bollingerUpper: number;
    bollingerMiddle: number;
    bollingerLower: number;
    ema20: number;
    ema50: number;
    ema100: number;
    ema200: number;
    
    trend: 'Bullish' | 'Bearish' | 'Sideways';
    momentum: 'Strong' | 'Moderate' | 'Weak';
    volatility: 'Low' | 'Medium' | 'High';
    volumeCondition: 'Strong' | 'Normal' | 'Weak';
    explanation: string;
  };

  // Support & Resistance
  levels: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
    distanceFromSupportPct: number;
    distanceFromResistancePct: number;
    state: 'Breakout' | 'Possible Breakout' | 'Breakdown' | 'Possible Breakdown' | 'Range Bound';
  };

  // Fundamental Analysis
  fundamentals: {
    revenueCr: number;
    revenueGrowthPct: number;
    ebitdaCr: number;
    ebitdaMarginPct: number;
    netProfitCr: number;
    profitGrowthPct: number;
    eps: number;
    pe: number;
    pb: number;
    roePct: number;
    rocePct: number;
    debtToEquity: number;
    opMarginPct: number;
    netMarginPct: number;
    freeCashFlowCr: number;
    dividendYieldPct: number;
    promoterHoldingPct: number;
    promoterPledgePct: number;
    fiiHoldingPct: number;
    diiHoldingPct: number;

    metricsBreakdown: MetricInterpretation[];
  };

  // Quarterly Results
  quarterlyResults: QuarterlyResultItem[];

  // Volume Intelligence
  volumeAnalysis: {
    currentVolume: number;
    avgVolume: number;
    volumeChangePct: number;
    isVolumeSpike: boolean;
    relativeVolumeRvol: number;
    signal: 'Volume Breakout' | 'Strong Buying Volume' | 'Strong Selling Volume' | 'Normal Volume' | 'Weak Volume';
    relationshipSummary: string;
  };

  // Market & Sector
  marketSector: {
    sectorPerformance: string;
    sectorTrend: string;
    stockVsSector: string;
    stockVsNifty: string;
    classification: 'OUTPERFORMING' | 'IN LINE' | 'UNDERPERFORMING';
  };

  // Ownership
  ownership: {
    promoterHolding: number;
    promoterChange: number;
    promoterPledge: number;
    fiiHolding: number;
    fiiChange: number;
    diiHolding: number;
    diiChange: number;
    publicHolding: number;
  };

  // Risk Meter
  riskAnalysis: {
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
    score: number; // 0-100
    mainRiskFactors: string[];
    explanation: string;
  };

  // Trade Setup (Educational)
  tradeSetup: {
    currentPrice: number;
    trend: string;
    entryZone: string;
    support: number;
    resistance: number;
    invalidationLevel: number;
    target1: number;
    target2: number;
    riskRewardRatio: string;
    setupQuality: 'Strong' | 'Moderate' | 'Weak';
    disclaimer: string;
  };

  // Chart datasets
  charts: {
    '1D': ChartDataPoint[];
    '5D': ChartDataPoint[];
    '1M': ChartDataPoint[];
    '3M': ChartDataPoint[];
    '6M': ChartDataPoint[];
    '1Y': ChartDataPoint[];
    '5Y': ChartDataPoint[];
  };

  // News Sentiment Score for stock
  newsSentiment: {
    score: number; // 0-100
    positivePct: number;
    neutralPct: number;
    negativePct: number;
    trend: 'Positive' | 'Neutral' | 'Negative';
    influencingSummary: string;
  };

  dataSources: StockDataSource[];
}

// Complete Indian Stock Master Record
export interface StockMasterRecord {
  id: string; // ISIN or Symbol
  company_name: string;
  short_name: string;
  nse_symbol: string | null;
  bse_scrip_code: string | null;
  isin: string | null;
  exchange: ('NSE' | 'BSE')[];
  series: string; // EQ, BE, SM, ST, etc.
  security_type: 'Equity' | 'SME' | 'ETF' | 'Debt' | 'Preference';
  sector: string;
  industry: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELISTED';
  is_active: boolean;
  is_tradable: boolean;
  last_updated: string;
  marketCapCategory?: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap';
  marketCapCr?: number;
}

export interface StockUniverseStats {
  total: number;
  nseCount: number;
  bseCount: number;
  smeCount: number;
  activeCount: number;
  lastSyncTime: string;
  source: string;
  syncStatus: 'Synced' | 'Syncing' | 'Failed';
}

export interface StockSearchOptions {
  q: string;
  exchange?: 'ALL' | 'NSE' | 'BSE';
  securityType?: 'ALL' | 'Equity' | 'SME';
  status?: 'ACTIVE' | 'SUSPENDED' | 'ALL';
  sort?: 'relevance' | 'name' | 'symbol';
  page?: number;
  limit?: number;
}

export interface StockSearchResultItem {
  id: string;
  symbol: string;
  companyName: string;
  shortName: string;
  nseSymbol: string | null;
  bseCode: string | null;
  isin: string | null;
  exchange: ('NSE' | 'BSE')[];
  series: string;
  securityType: 'Equity' | 'SME' | 'ETF' | 'Debt' | 'Preference';
  sector: string;
  industry: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELISTED';
  isActive: boolean;
  isTradable: boolean;
  price: number;
  changePercent: number;
  overallScore: number;
  matchScore: number;
  relatedReason?: string;
  benchmarkWeight?: string;
}

export interface StockSearchResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  query: string;
  didYouMean?: string | null;
  universeStats: StockUniverseStats;
  results: StockSearchResultItem[];
  matchedBenchmark?: BenchmarkIndex | null;
  queryType?: 'INDEX' | 'SECTOR' | 'GROUP' | 'STOCK' | 'THEMATIC' | 'GENERAL';
  relatedTheme?: string | null;
  themeDescription?: string | null;
  isFallbackRecommendation?: boolean;
}

export interface BenchmarkIndex {
  symbol: string;
  name: string;
  fullName: string;
  exchange: 'NSE' | 'BSE';
  price: number;
  formattedPrice: string;
  change: number;
  changePercent: number;
  formattedChange: string;
  positive: boolean;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  sparkline?: number[];
  lastUpdated: string;
  category?: 'Broad Market' | 'Sectoral' | 'Volatility';
  description?: string;
}

export interface BenchmarkMarketStatus {
  status: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET';
  label: string;
  istTime: string;
  isLive: boolean;
  nextSession: string;
  simulationActive?: boolean;
}

export interface BenchmarkResponse {
  success: boolean;
  benchmarks: BenchmarkIndex[];
  marketStatus: BenchmarkMarketStatus;
  lastUpdated: string;
}

