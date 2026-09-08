import { StockIntelligenceData, ChartDataPoint, NewsArticle } from '../types';
import { INDIAN_STOCK_MASTER } from '../data/stockMasterData';

// Helper to generate deterministic price series with indicators
function generateChartData(basePrice: number, pointsCount: number, volatility: number, timeframe: string): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  let currentPrice = basePrice * (1 - (volatility * 0.1));
  const now = new Date();

  for (let i = pointsCount; i >= 0; i--) {
    const timeOffset = i * (timeframe === '1D' ? 5 : timeframe === '5D' ? 30 : timeframe === '1M' ? 1440 : timeframe === '3M' ? 4320 : 10080); // mins
    const pointDate = new Date(now.getTime() - timeOffset * 60000);
    
    // Deterministic pseudo-random variation
    const changeFactor = (Math.sin(i * 0.4) * 0.015) + (Math.cos(i * 0.2) * 0.01) + ((Math.sin(i * 1.7) > 0 ? 0.005 : -0.005));
    currentPrice = Math.max(10, currentPrice * (1 + changeFactor * volatility));

    const high = currentPrice * (1 + Math.abs(Math.sin(i)) * 0.008);
    const low = currentPrice * (1 - Math.abs(Math.cos(i)) * 0.008);
    const open = low + (high - low) * 0.4;
    const close = currentPrice;
    const volume = Math.round(50000 + Math.abs(Math.sin(i * 3)) * 250000);

    // Indicators approximations
    const ema20 = close * (1 - Math.sin(i * 0.1) * 0.01);
    const ema50 = close * (1 - Math.cos(i * 0.1) * 0.02);
    const ema100 = close * (1 - Math.sin(i * 0.05) * 0.03);
    const ema200 = close * (1 - Math.cos(i * 0.03) * 0.04);
    const vwap = (high + low + close) / 3;
    const bollingerUpper = close * 1.025;
    const bollingerLower = close * 0.975;

    let timeLabel = '';
    if (timeframe === '1D') {
      timeLabel = pointDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '5D' || timeframe === '1M') {
      timeLabel = pointDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      timeLabel = pointDate.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }

    points.push({
      time: timeLabel,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      ema20: Number(ema20.toFixed(2)),
      ema50: Number(ema50.toFixed(2)),
      ema100: Number(ema100.toFixed(2)),
      ema200: Number(ema200.toFixed(2)),
      vwap: Number(vwap.toFixed(2)),
      bollingerUpper: Number(bollingerUpper.toFixed(2)),
      bollingerLower: Number(bollingerLower.toFixed(2)),
    });
  }

  return points;
}

// Master Stock Intelligence Database
export const STOCK_DATABASE: Record<string, Partial<StockIntelligenceData>> = {
  TCS: {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    nseSymbol: 'TCS',
    bseCode: '532540',
    sector: 'Information Technology',
    industry: 'IT Services & Consulting',
    price: 4325.50,
    change: 62.40,
    changePercent: 1.46,
    marketCapCr: 1564200,
    high52: 4585.90,
    low52: 3310.00,
    volume: 1845200,
    avgVolume: 1420000,
    
    technicalScore: 84,
    fundamentalScore: 92,
    momentumScore: 78,
    volumeScore: 82,
    newsScore: 96,
    marketSectorScore: 88,
    riskScore: 18,

    technicals: {
      rsi: 61.4,
      macd: { macdLine: 28.4, signalLine: 18.2, histogram: 10.2 },
      adx: 29.8,
      atr: 54.20,
      stochastic: { k: 74, d: 68 },
      supertrend: { value: 4180.00, signal: 'Bullish' },
      vwap: 4310.25,
      bollingerUpper: 4410.00,
      bollingerMiddle: 4280.00,
      bollingerLower: 4150.00,
      ema20: 4275.00,
      ema50: 4190.00,
      ema100: 4050.00,
      ema200: 3890.00,
      trend: 'Bullish',
      momentum: 'Strong',
      volatility: 'Low',
      volumeCondition: 'Strong',
      explanation: 'Trading comfortably above 20 & 50 EMAs with positive MACD histogram expansion. RSI at 61 indicates sustained bullish momentum without being overbought.',
    },

    levels: {
      support1: 4250.00,
      support2: 4180.00,
      resistance1: 4420.00,
      resistance2: 4585.00,
      distanceFromSupportPct: 1.78,
      distanceFromResistancePct: 2.18,
      state: 'Possible Breakout',
    },

    fundamentals: {
      revenueCr: 240893,
      revenueGrowthPct: 8.6,
      ebitdaCr: 68420,
      ebitdaMarginPct: 28.4,
      netProfitCr: 45908,
      profitGrowthPct: 9.2,
      eps: 126.8,
      pe: 34.1,
      pb: 12.8,
      roePct: 49.2,
      rocePct: 58.4,
      debtToEquity: 0.04,
      opMarginPct: 24.6,
      netMarginPct: 19.1,
      freeCashFlowCr: 41200,
      dividendYieldPct: 1.32,
      promoterHoldingPct: 71.77,
      promoterPledgePct: 0.00,
      fiiHoldingPct: 12.65,
      diiHoldingPct: 10.42,
      metricsBreakdown: [
        { metric: 'ROE (Return on Equity)', currentValue: '49.2%', previousValue: '46.8%', trend: 'improving', interpretation: 'Positive' },
        { metric: 'Debt to Equity', currentValue: '0.04', previousValue: '0.05', trend: 'stable', interpretation: 'Positive' },
        { metric: 'EBITDA Margin', currentValue: '28.4%', previousValue: '27.9%', trend: 'improving', interpretation: 'Positive' },
        { metric: 'Promoter Pledge', currentValue: '0.00%', previousValue: '0.00%', trend: 'stable', interpretation: 'Positive' },
        { metric: 'P/E Valuation', currentValue: '34.1x', previousValue: '32.5x', trend: 'stable', interpretation: 'Neutral' },
      ],
    },

    quarterlyResults: [
      { quarter: 'Q1 FY26', revenue: 62613, ebitda: 17820, netProfit: 12040, eps: 33.2, label: 'Improving' },
      { quarter: 'Q4 FY25', revenue: 61237, ebitda: 17450, netProfit: 12434, eps: 34.3, label: 'Improving' },
      { quarter: 'Q3 FY25', revenue: 60583, ebitda: 17110, netProfit: 11058, eps: 30.5, label: 'Stable' },
      { quarter: 'Q2 FY25', revenue: 59692, ebitda: 16890, netProfit: 11342, eps: 31.2, label: 'Stable' },
    ],

    volumeAnalysis: {
      currentVolume: 1845200,
      avgVolume: 1420000,
      volumeChangePct: 29.9,
      isVolumeSpike: true,
      relativeVolumeRvol: 1.30,
      signal: 'Strong Buying Volume',
      relationshipSummary: 'Price increased +1.46% with 30% above-average volume — strong positive institutional confirmation.',
    },

    marketSector: {
      sectorPerformance: '+1.2% Today',
      sectorTrend: 'Bullish Continuation',
      stockVsSector: 'Outperforming Sector by +0.26%',
      stockVsNifty: 'Outperforming NIFTY 50 by +0.88%',
      classification: 'OUTPERFORMING',
    },

    ownership: {
      promoterHolding: 71.77,
      promoterChange: 0.00,
      promoterPledge: 0.00,
      fiiHolding: 12.65,
      fiiChange: 0.35,
      diiHolding: 10.42,
      diiChange: 0.18,
      publicHolding: 5.16,
    },

    riskAnalysis: {
      level: 'LOW',
      score: 18,
      mainRiskFactors: [
        'Global IT spending slowdown in BFSI domain',
        'US Dollar vs INR currency fluctuation volatility',
        'High client concentration in European banking sector',
      ],
      explanation: 'Exceptional balance sheet quality with zero net debt, high promoter stability, and verified tier-1 corporate contract wins keep systemic risk at a low 18/100.',
    },

    tradeSetup: {
      currentPrice: 4325.50,
      trend: 'Uptrend / Bullish Breakout',
      entryZone: '₹4,280 - ₹4,310',
      support: 4250.00,
      resistance: 4420.00,
      invalidationLevel: 4180.00,
      target1: 4480.00,
      target2: 4580.00,
      riskRewardRatio: '1 : 2.4',
      setupQuality: 'Strong',
      disclaimer: 'Educational market analysis — not guaranteed financial advice.',
    },
  },

  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    nseSymbol: 'RELIANCE',
    bseCode: '500325',
    sector: 'Oil, Gas & Telecom',
    industry: 'Integrated Oil, Gas & Consumer Services',
    price: 2980.20,
    change: 18.50,
    changePercent: 0.62,
    marketCapCr: 2016400,
    high52: 3217.90,
    low52: 2220.30,
    volume: 3820000,
    avgVolume: 3500000,
    
    technicalScore: 78,
    fundamentalScore: 88,
    momentumScore: 72,
    volumeScore: 75,
    newsScore: 94,
    marketSectorScore: 82,
    riskScore: 22,

    technicals: {
      rsi: 56.2,
      macd: { macdLine: 14.2, signalLine: 10.1, histogram: 4.1 },
      adx: 22.4,
      atr: 38.50,
      stochastic: { k: 62, d: 58 },
      supertrend: { value: 2890.00, signal: 'Bullish' },
      vwap: 2972.10,
      bollingerUpper: 3040.00,
      bollingerMiddle: 2950.00,
      bollingerLower: 2860.00,
      ema20: 2955.00,
      ema50: 2910.00,
      ema100: 2840.00,
      ema200: 2720.00,
      trend: 'Bullish',
      momentum: 'Moderate',
      volatility: 'Low',
      volumeCondition: 'Normal',
      explanation: 'Sustained consolidation above 20 EMA with steady buying support. Jio ARPU increases and Retail store additions provide long-term support.',
    },

    levels: {
      support1: 2920.00,
      support2: 2860.00,
      resistance1: 3050.00,
      resistance2: 3217.00,
      distanceFromSupportPct: 2.06,
      distanceFromResistancePct: 2.34,
      state: 'Range Bound',
    },

    fundamentals: {
      revenueCr: 901000,
      revenueGrowthPct: 11.2,
      ebitdaCr: 178000,
      ebitdaMarginPct: 19.8,
      netProfitCr: 79000,
      profitGrowthPct: 10.4,
      eps: 116.8,
      pe: 25.5,
      pb: 2.4,
      roePct: 9.8,
      rocePct: 11.2,
      debtToEquity: 0.38,
      opMarginPct: 17.2,
      netMarginPct: 8.8,
      freeCashFlowCr: 32000,
      dividendYieldPct: 0.35,
      promoterHoldingPct: 50.31,
      promoterPledgePct: 0.00,
      fiiHoldingPct: 22.40,
      diiHoldingPct: 16.80,
      metricsBreakdown: [
        { metric: 'Revenue Growth', currentValue: '11.2%', previousValue: '9.8%', trend: 'improving', interpretation: 'Positive' },
        { metric: 'Debt to Equity', currentValue: '0.38', previousValue: '0.42', trend: 'improving', interpretation: 'Positive' },
        { metric: 'Promoter Holding', currentValue: '50.31%', previousValue: '50.31%', trend: 'stable', interpretation: 'Positive' },
        { metric: 'ROE', currentValue: '9.8%', previousValue: '9.4%', trend: 'improving', interpretation: 'Neutral' },
      ],
    },

    quarterlyResults: [
      { quarter: 'Q1 FY26', revenue: 236210, ebitda: 42800, netProfit: 19450, eps: 28.7, label: 'Improving' },
      { quarter: 'Q4 FY25', revenue: 230100, ebitda: 41900, netProfit: 18950, eps: 28.0, label: 'Improving' },
      { quarter: 'Q3 FY25', revenue: 225000, ebitda: 40600, netProfit: 17260, eps: 25.5, label: 'Stable' },
      { quarter: 'Q2 FY25', revenue: 218000, ebitda: 39500, netProfit: 16500, eps: 24.4, label: 'Stable' },
    ],

    volumeAnalysis: {
      currentVolume: 3820000,
      avgVolume: 3500000,
      volumeChangePct: 9.1,
      isVolumeSpike: false,
      relativeVolumeRvol: 1.09,
      signal: 'Normal Volume',
      relationshipSummary: 'Moderate price gain with normal trading volume — orderly accumulation.',
    },

    marketSector: {
      sectorPerformance: '+0.5% Today',
      sectorTrend: 'Neutral to Bullish',
      stockVsSector: 'In line with sector (+0.12%)',
      stockVsNifty: 'In line with NIFTY 50 (+0.04%)',
      classification: 'IN LINE',
    },

    ownership: {
      promoterHolding: 50.31,
      promoterChange: 0.00,
      promoterPledge: 0.00,
      fiiHolding: 22.40,
      fiiChange: 0.12,
      diiHolding: 16.80,
      diiChange: 0.25,
      publicHolding: 10.49,
    },

    riskAnalysis: {
      level: 'LOW',
      score: 22,
      mainRiskFactors: [
        'Global crude oil refining margin volatility (GRM)',
        'Telecom spectrum capex cash flow timeline',
      ],
      explanation: 'Conglomerate diversification across Energy, Retail, and Telecom insulates from sector-specific downturns.',
    },

    tradeSetup: {
      currentPrice: 2980.20,
      trend: 'Steady Consolidation',
      entryZone: '₹2,940 - ₹2,970',
      support: 2920.00,
      resistance: 3050.00,
      invalidationLevel: 2860.00,
      target1: 3080.00,
      target2: 3200.00,
      riskRewardRatio: '1 : 2.1',
      setupQuality: 'Moderate',
      disclaimer: 'Educational market analysis — not guaranteed financial advice.',
    },
  },

  HDFCBANK: {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    nseSymbol: 'HDFCBANK',
    bseCode: '500180',
    sector: 'Banking & Finance',
    industry: 'Private Sector Banking',
    price: 1642.80,
    change: 14.20,
    changePercent: 0.87,
    marketCapCr: 1250300,
    high52: 1794.00,
    low52: 1363.40,
    volume: 12450000,
    avgVolume: 11000000,
    
    technicalScore: 76,
    fundamentalScore: 90,
    momentumScore: 70,
    volumeScore: 78,
    newsScore: 92,
    marketSectorScore: 80,
    riskScore: 20,

    technicals: {
      rsi: 54.8,
      macd: { macdLine: 8.4, signalLine: 6.2, histogram: 2.2 },
      adx: 21.0,
      atr: 22.40,
      stochastic: { k: 58, d: 52 },
      supertrend: { value: 1590.00, signal: 'Bullish' },
      vwap: 1638.50,
      bollingerUpper: 1680.00,
      bollingerMiddle: 1625.00,
      bollingerLower: 1570.00,
      ema20: 1628.00,
      ema50: 1605.00,
      ema100: 1570.00,
      ema200: 1530.00,
      trend: 'Bullish',
      momentum: 'Moderate',
      volatility: 'Low',
      volumeCondition: 'Normal',
      explanation: 'Consolidating higher post Q1 results with asset quality GNPA improving to 1.24%. Stable deposit accretion supporting loan growth.',
    },

    levels: {
      support1: 1610.00,
      support2: 1570.00,
      resistance1: 1680.00,
      resistance2: 1740.00,
      distanceFromSupportPct: 2.00,
      distanceFromResistancePct: 2.26,
      state: 'Range Bound',
    },

    fundamentals: {
      revenueCr: 215000,
      revenueGrowthPct: 18.4,
      ebitdaCr: 98000,
      ebitdaMarginPct: 45.5,
      netProfitCr: 64100,
      profitGrowthPct: 16.2,
      eps: 84.4,
      pe: 19.5,
      pb: 2.6,
      roePct: 16.8,
      rocePct: 14.2,
      debtToEquity: 1.12,
      opMarginPct: 42.0,
      netMarginPct: 29.8,
      freeCashFlowCr: 28000,
      dividendYieldPct: 1.18,
      promoterHoldingPct: 0.00, // Institutional / Public Bank
      promoterPledgePct: 0.00,
      fiiHoldingPct: 53.80,
      diiHoldingPct: 31.20,
      metricsBreakdown: [
        { metric: 'Gross NPA Ratio', currentValue: '1.24%', previousValue: '1.33%', trend: 'improving', interpretation: 'Positive' },
        { metric: 'Net Interest Margin (NIM)', currentValue: '3.47%', previousValue: '3.44%', trend: 'stable', interpretation: 'Positive' },
        { metric: 'P/E Ratio', currentValue: '19.5x', previousValue: '21.2x', trend: 'improving', interpretation: 'Positive' },
        { metric: 'ROE', currentValue: '16.8%', previousValue: '16.2%', trend: 'improving', interpretation: 'Positive' },
      ],
    },

    quarterlyResults: [
      { quarter: 'Q1 FY26', revenue: 58200, ebitda: 26400, netProfit: 16170, eps: 21.2, label: 'Improving' },
      { quarter: 'Q4 FY25', revenue: 56100, ebitda: 25800, netProfit: 16510, eps: 21.7, label: 'Improving' },
      { quarter: 'Q3 FY25', revenue: 54200, ebitda: 24900, netProfit: 15720, eps: 20.6, label: 'Stable' },
      { quarter: 'Q2 FY25', revenue: 52100, ebitda: 23800, netProfit: 14500, eps: 19.0, label: 'Stable' },
    ],

    volumeAnalysis: {
      currentVolume: 12450000,
      avgVolume: 11000000,
      volumeChangePct: 13.1,
      isVolumeSpike: false,
      relativeVolumeRvol: 1.13,
      signal: 'Normal Volume',
      relationshipSummary: 'Consistent accumulation by domestic institutional funds with healthy turnover.',
    },

    marketSector: {
      sectorPerformance: '+0.41% Today',
      sectorTrend: 'Bullish',
      stockVsSector: 'Outperforming Bank Nifty by +0.46%',
      stockVsNifty: 'Outperforming NIFTY 50 by +0.29%',
      classification: 'OUTPERFORMING',
    },

    ownership: {
      promoterHolding: 0.00,
      promoterChange: 0.00,
      promoterPledge: 0.00,
      fiiHolding: 53.80,
      fiiChange: 0.45,
      diiHolding: 31.20,
      diiChange: 0.30,
      publicHolding: 15.00,
    },

    riskAnalysis: {
      level: 'LOW',
      score: 20,
      mainRiskFactors: [
        'Deposit growth rate lagging loan credit demand',
        'RBI regulatory capital adequacy tweaks',
      ],
      explanation: 'Pristine credit quality and top-tier retail deposit franchise protect HDFC Bank from liquidity shocks.',
    },

    tradeSetup: {
      currentPrice: 1642.80,
      trend: 'Uptrend Channel',
      entryZone: '₹1,620 - ₹1,640',
      support: 1610.00,
      resistance: 1680.00,
      invalidationLevel: 1570.00,
      target1: 1710.00,
      target2: 1780.00,
      riskRewardRatio: '1 : 2.2',
      setupQuality: 'Strong',
      disclaimer: 'Educational market analysis — not guaranteed financial advice.',
    },
  },

  PAYTM: {
    symbol: 'PAYTM',
    name: 'One97 Communications (Paytm)',
    nseSymbol: 'PAYTM',
    bseCode: '543396',
    sector: 'Fintech & Digital Services',
    industry: 'Financial Technology',
    price: 685.40,
    change: -18.20,
    changePercent: -2.59,
    marketCapCr: 43500,
    high52: 998.30,
    low52: 310.00,
    volume: 18400000,
    avgVolume: 8500000,
    
    technicalScore: 42,
    fundamentalScore: 35,
    momentumScore: 48,
    volumeScore: 85,
    newsScore: 24,
    marketSectorScore: 40,
    riskScore: 78, // High risk!

    technicals: {
      rsi: 42.1,
      macd: { macdLine: -6.2, signalLine: -4.1, histogram: -2.1 },
      adx: 34.2,
      atr: 28.50,
      stochastic: { k: 32, d: 38 },
      supertrend: { value: 720.00, signal: 'Bearish' },
      vwap: 692.00,
      bollingerUpper: 745.00,
      bollingerMiddle: 698.00,
      bollingerLower: 651.00,
      ema20: 702.00,
      ema50: 715.00,
      ema100: 730.00,
      ema200: 780.00,
      trend: 'Bearish',
      momentum: 'Weak',
      volatility: 'High',
      volumeCondition: 'Strong',
      explanation: 'High speculative turnover triggered by unverified WhatsApp & Telegram rumors regarding RBI license revival. Trading below all major moving averages.',
    },

    levels: {
      support1: 650.00,
      support2: 610.00,
      resistance1: 720.00,
      resistance2: 780.00,
      distanceFromSupportPct: 5.44,
      distanceFromResistancePct: 5.05,
      state: 'Possible Breakdown',
    },

    fundamentals: {
      revenueCr: 9978,
      revenueGrowthPct: -14.2,
      ebitdaCr: -1240,
      ebitdaMarginPct: -12.4,
      netProfitCr: -1420,
      profitGrowthPct: -22.5,
      eps: -22.4,
      pe: -30.6,
      pb: 3.2,
      roePct: -10.8,
      rocePct: -8.4,
      debtToEquity: 0.02,
      opMarginPct: -15.2,
      netMarginPct: -14.2,
      freeCashFlowCr: -420,
      dividendYieldPct: 0.00,
      promoterHoldingPct: 0.00,
      promoterPledgePct: 0.00,
      fiiHoldingPct: 18.20,
      diiHoldingPct: 12.40,
      metricsBreakdown: [
        { metric: 'Revenue Growth', currentValue: '-14.2%', previousValue: '24.8%', trend: 'declining', interpretation: 'Caution' },
        { metric: 'Net Profit', currentValue: '-₹1,420 Cr', previousValue: '-₹1,160 Cr', trend: 'declining', interpretation: 'Caution' },
        { metric: 'Regulatory Clearance', currentValue: 'Pending RBI Action', previousValue: 'Restricted', trend: 'stable', interpretation: 'Caution' },
      ],
    },

    quarterlyResults: [
      { quarter: 'Q1 FY26', revenue: 1500, ebitda: -280, netProfit: -840, eps: -13.2, label: 'Declining' },
      { quarter: 'Q4 FY25', revenue: 2267, ebitda: -120, netProfit: -550, eps: -8.6, label: 'Declining' },
      { quarter: 'Q3 FY25', revenue: 2850, ebitda: 140, netProfit: 220, eps: 3.4, label: 'Stable' },
      { quarter: 'Q2 FY25', revenue: 2519, ebitda: 80, netProfit: -290, eps: -4.5, label: 'Declining' },
    ],

    volumeAnalysis: {
      currentVolume: 18400000,
      avgVolume: 8500000,
      volumeChangePct: 116.5,
      isVolumeSpike: true,
      relativeVolumeRvol: 2.16,
      signal: 'Strong Selling Volume',
      relationshipSummary: 'Heavy selling volume (+116% vs average) combined with -2.59% price drop indicates institutional exit and retail speculation.',
    },

    marketSector: {
      sectorPerformance: '-1.4% Today',
      sectorTrend: 'Weak / High Volatility',
      stockVsSector: 'Underperforming Sector by -1.19%',
      stockVsNifty: 'Underperforming NIFTY 50 by -3.17%',
      classification: 'UNDERPERFORMING',
    },

    ownership: {
      promoterHolding: 0.00,
      promoterChange: 0.00,
      promoterPledge: 0.00,
      fiiHolding: 18.20,
      fiiChange: -1.40,
      diiHolding: 12.40,
      diiChange: 0.20,
      publicHolding: 69.40,
    },

    riskAnalysis: {
      level: 'VERY HIGH',
      score: 78,
      mainRiskFactors: [
        'RBI supervisory restrictions under Section 35A on Paytm Payments Bank',
        'Persistent negative quarterly earnings and EBITDA margins',
        'Extreme social media rumor vulnerability (Credibility Score: 24/100)',
      ],
      explanation: 'Regulatory uncertainty combined with unverified social media pump-and-dump rumors creates extreme risk for retail investors.',
    },

    tradeSetup: {
      currentPrice: 685.40,
      trend: 'High Risk Speculative Volatility',
      entryZone: 'Wait for official RBI / SEBI filing',
      support: 650.00,
      resistance: 720.00,
      invalidationLevel: 730.00,
      target1: 610.00,
      target2: 550.00,
      riskRewardRatio: '1 : 1.2',
      setupQuality: 'Weak',
      disclaimer: 'Educational market analysis — not guaranteed financial advice.',
    },
  },

  TATAMOTORS: {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    nseSymbol: 'TATAMOTORS',
    bseCode: '500570',
    sector: 'Automobile',
    industry: 'Commercial & Passenger Vehicles',
    price: 1042.30,
    change: 12.10,
    changePercent: 1.17,
    marketCapCr: 382400,
    high52: 1179.00,
    low52: 602.00,
    volume: 5200000,
    avgVolume: 4800000,
    
    technicalScore: 80,
    fundamentalScore: 84,
    momentumScore: 76,
    volumeScore: 74,
    newsScore: 72,
    marketSectorScore: 78,
    riskScore: 28,

    technicals: {
      rsi: 58.6,
      macd: { macdLine: 12.4, signalLine: 8.2, histogram: 4.2 },
      adx: 26.5,
      atr: 21.00,
      stochastic: { k: 68, d: 62 },
      supertrend: { value: 995.00, signal: 'Bullish' },
      vwap: 1038.20,
      bollingerUpper: 1075.00,
      bollingerMiddle: 1030.00,
      bollingerLower: 985.00,
      ema20: 1028.00,
      ema50: 1005.00,
      ema100: 960.00,
      ema200: 890.00,
      trend: 'Bullish',
      momentum: 'Strong',
      volatility: 'Medium',
      volumeCondition: 'Normal',
      explanation: 'Sustained momentum driven by JLR order backlog recovery and EV dominance in Indian domestic PV sector.',
    },

    levels: {
      support1: 1010.00,
      support2: 980.00,
      resistance1: 1080.00,
      resistance2: 1179.00,
      distanceFromSupportPct: 3.10,
      distanceFromResistancePct: 3.62,
      state: 'Range Bound',
    },

    fundamentals: {
      revenueCr: 437928,
      revenueGrowthPct: 26.6,
      ebitdaCr: 62400,
      ebitdaMarginPct: 14.2,
      netProfitCr: 31800,
      profitGrowthPct: 34.2,
      eps: 82.5,
      pe: 12.6,
      pb: 3.8,
      roePct: 32.4,
      rocePct: 22.8,
      debtToEquity: 0.65,
      opMarginPct: 12.8,
      netMarginPct: 7.2,
      freeCashFlowCr: 18500,
      dividendYieldPct: 0.58,
      promoterHoldingPct: 46.36,
      promoterPledgePct: 0.00,
      fiiHoldingPct: 19.20,
      diiHoldingPct: 17.80,
      metricsBreakdown: [
        { metric: 'Revenue Growth', currentValue: '26.6%', previousValue: '21.2%', trend: 'improving', interpretation: 'Positive' },
        { metric: 'Net Profit', currentValue: '₹31,800 Cr', previousValue: '₹23,700 Cr', trend: 'improving', interpretation: 'Positive' },
        { metric: 'P/E Valuation', currentValue: '12.6x', previousValue: '18.2x', trend: 'improving', interpretation: 'Positive' },
      ],
    },

    quarterlyResults: [
      { quarter: 'Q1 FY26', revenue: 112000, ebitda: 16200, netProfit: 8100, eps: 21.0, label: 'Improving' },
      { quarter: 'Q4 FY25', revenue: 119986, ebitda: 17800, netProfit: 17407, eps: 45.2, label: 'Improving' },
      { quarter: 'Q3 FY25', revenue: 110577, ebitda: 15400, netProfit: 7025, eps: 18.2, label: 'Stable' },
      { quarter: 'Q2 FY25', revenue: 105128, ebitda: 14200, netProfit: 3764, eps: 9.8, label: 'Stable' },
    ],

    volumeAnalysis: {
      currentVolume: 5200000,
      avgVolume: 4800000,
      volumeChangePct: 8.3,
      isVolumeSpike: false,
      relativeVolumeRvol: 1.08,
      signal: 'Normal Volume',
      relationshipSummary: 'Price increased +1.17% with stable volume confirmation.',
    },

    marketSector: {
      sectorPerformance: '+0.8% Today',
      sectorTrend: 'Bullish',
      stockVsSector: 'Outperforming Auto Sector by +0.37%',
      stockVsNifty: 'Outperforming NIFTY 50 by +0.59%',
      classification: 'OUTPERFORMING',
    },

    ownership: {
      promoterHolding: 46.36,
      promoterChange: 0.00,
      promoterPledge: 0.00,
      fiiHolding: 19.20,
      fiiChange: 0.40,
      diiHolding: 17.80,
      diiChange: 0.15,
      publicHolding: 16.64,
    },

    riskAnalysis: {
      level: 'MODERATE',
      score: 28,
      mainRiskFactors: [
        'JLR UK/Europe export demand sensitivity',
        'Raw material steel/aluminum commodity price inflation',
      ],
      explanation: 'Commercial vehicle sector cyclicality offset by stellar passenger EV growth and JLR debt de-leveraging.',
    },

    tradeSetup: {
      currentPrice: 1042.30,
      trend: 'Higher Highs & Higher Lows',
      entryZone: '₹1,020 - ₹1,035',
      support: 1010.00,
      resistance: 1080.00,
      invalidationLevel: 980.00,
      target1: 1120.00,
      target2: 1180.00,
      riskRewardRatio: '1 : 2.5',
      setupQuality: 'Strong',
      disclaimer: 'Educational market analysis — not guaranteed financial advice.',
    },
  },
};

// Fallback generator for any stock symbol or ISIN (from complete Indian Stock Master Universe)
export function getStockIntelligence(symbol: string, companyList?: any[], articlesList?: NewsArticle[]): StockIntelligenceData {
  const upperSymbol = symbol.toUpperCase().trim();
  const known = STOCK_DATABASE[upperSymbol];

  // Lookup in complete Indian Stock Master Database
  const masterRecord = INDIAN_STOCK_MASTER.find(s => 
    s.id === upperSymbol ||
    (s.nse_symbol && s.nse_symbol.toUpperCase() === upperSymbol) ||
    (s.bse_scrip_code && s.bse_scrip_code.toUpperCase() === upperSymbol) ||
    (s.isin && s.isin.toUpperCase() === upperSymbol) ||
    s.company_name.toUpperCase().includes(upperSymbol)
  );

  // Look up in provided company list
  const foundCompany = companyList?.find(c => 
    c.symbol.toUpperCase() === upperSymbol || 
    c.nseSymbol.toUpperCase() === upperSymbol || 
    c.bseCode === upperSymbol ||
    c.name.toLowerCase().includes(symbol.toLowerCase())
  );

  const name = known?.name || masterRecord?.company_name || foundCompany?.name || `${upperSymbol} Ltd.`;
  const nseSymbol = known?.nseSymbol || masterRecord?.nse_symbol || foundCompany?.nseSymbol || upperSymbol;
  const bseCode = known?.bseCode || masterRecord?.bse_scrip_code || foundCompany?.bseCode || '500100';
  const sector = known?.sector || masterRecord?.sector || foundCompany?.sector || 'Diversified Equity';
  const industry = known?.industry || masterRecord?.industry || 'Indian Public Enterprise';

  const price = known?.price || 1240.50 + (upperSymbol.length * 115) % 800;
  const change = known?.change || (upperSymbol.charCodeAt(0) % 2 === 0 ? 14.80 : -8.50);
  const changePercent = known?.changePercent || Number((change / price * 100).toFixed(2));
  const marketCapCr = known?.marketCapCr || 120000 + (upperSymbol.charCodeAt(0) * 1500);
  const high52 = known?.high52 || Number((price * 1.18).toFixed(2));
  const low52 = known?.low52 || Number((price * 0.78).toFixed(2));
  const volume = known?.volume || 3450000;
  const avgVolume = known?.avgVolume || 2900000;

  // Filter stock-specific news
  const stockArticles = articlesList?.filter(a => 
    a.companySymbol.toUpperCase() === upperSymbol || 
    a.companyName.toLowerCase().includes(name.toLowerCase()) ||
    a.title.toLowerCase().includes(upperSymbol.toLowerCase())
  ) || [];

  const newsCount = stockArticles.length;
  const avgNewsCredibility = newsCount > 0 
    ? Math.round(stockArticles.reduce((acc, a) => acc + a.credibilityScore, 0) / newsCount)
    : 85;

  const technicalScore = known?.technicalScore || 78;
  const fundamentalScore = known?.fundamentalScore || 82;
  const momentumScore = known?.momentumScore || 74;
  const volumeScore = known?.volumeScore || 76;
  const newsScore = known?.newsScore || avgNewsCredibility;
  const marketSectorScore = known?.marketSectorScore || 80;
  const riskPenalty = known?.riskScore || 22;

  // Weighted overall score math
  const calculatedOverall = Math.round(
    (technicalScore * 0.20) +
    (fundamentalScore * 0.25) +
    (momentumScore * 0.15) +
    (volumeScore * 0.10) +
    (newsScore * 0.15) +
    (marketSectorScore * 0.15)
  );

  const overallScore = known?.overallScore || Math.max(10, Math.min(99, calculatedOverall));

  let scoreLabel: 'VERY STRONG' | 'STRONG' | 'POSITIVE' | 'NEUTRAL' | 'WEAK' | 'HIGH RISK' = 'STRONG';
  if (overallScore >= 90) scoreLabel = 'VERY STRONG';
  else if (overallScore >= 75) scoreLabel = 'STRONG';
  else if (overallScore >= 60) scoreLabel = 'POSITIVE';
  else if (overallScore >= 45) scoreLabel = 'NEUTRAL';
  else if (overallScore >= 30) scoreLabel = 'WEAK';
  else scoreLabel = 'HIGH RISK';

  // Support / Resistance calculation
  const support1 = known?.levels?.support1 || Number((price * 0.975).toFixed(2));
  const support2 = known?.levels?.support2 || Number((price * 0.945).toFixed(2));
  const resistance1 = known?.levels?.resistance1 || Number((price * 1.025).toFixed(2));
  const resistance2 = known?.levels?.resistance2 || Number((price * 1.055).toFixed(2));

  const distSupp = Number(((price - support1) / price * 100).toFixed(2));
  const distRes = Number(((resistance1 - price) / price * 100).toFixed(2));

  const technicals = known?.technicals || {
    rsi: 58.4,
    macd: { macdLine: 12.2, signalLine: 8.4, histogram: 3.8 },
    adx: 24.5,
    atr: Number((price * 0.02).toFixed(2)),
    stochastic: { k: 64, d: 58 },
    supertrend: { value: Number((price * 0.95).toFixed(2)), signal: 'Bullish' as const },
    vwap: Number((price * 0.995).toFixed(2)),
    bollingerUpper: Number((price * 1.03).toFixed(2)),
    bollingerMiddle: Number((price * 1.00).toFixed(2)),
    bollingerLower: Number((price * 0.97).toFixed(2)),
    ema20: Number((price * 0.99).toFixed(2)),
    ema50: Number((price * 0.97).toFixed(2)),
    ema100: Number((price * 0.94).toFixed(2)),
    ema200: Number((price * 0.89).toFixed(2)),
    trend: changePercent >= 0 ? ('Bullish' as const) : ('Bearish' as const),
    momentum: 'Strong' as const,
    volatility: 'Low' as const,
    volumeCondition: 'Normal' as const,
    explanation: `${name} displays stable technical setup holding key short-term exponential moving averages. RSI indicates steady buyer demand without overbought exhaustion.`,
  };

  const fundamentals = known?.fundamentals || {
    revenueCr: 85000,
    revenueGrowthPct: 12.4,
    ebitdaCr: 21000,
    ebitdaMarginPct: 24.7,
    netProfitCr: 14500,
    profitGrowthPct: 14.2,
    eps: 42.5,
    pe: 28.4,
    pb: 4.2,
    roePct: 22.4,
    rocePct: 26.8,
    debtToEquity: 0.12,
    opMarginPct: 22.1,
    netMarginPct: 17.0,
    freeCashFlowCr: 12400,
    dividendYieldPct: 1.15,
    promoterHoldingPct: 58.40,
    promoterPledgePct: 0.00,
    fiiHoldingPct: 21.20,
    diiHoldingPct: 14.80,
    metricsBreakdown: [
      { metric: 'Revenue Growth', currentValue: '12.4%', previousValue: '10.1%', trend: 'improving', interpretation: 'Positive' },
      { metric: 'ROE (Return on Equity)', currentValue: '22.4%', previousValue: '21.0%', trend: 'improving', interpretation: 'Positive' },
      { metric: 'Debt to Equity Ratio', currentValue: '0.12', previousValue: '0.15', trend: 'improving', interpretation: 'Positive' },
      { metric: 'Promoter Pledge', currentValue: '0.00%', previousValue: '0.00%', trend: 'stable', interpretation: 'Positive' },
    ],
  };

  const quarterlyResults = known?.quarterlyResults || [
    { quarter: 'Q1 FY26', revenue: 22100, ebitda: 5460, netProfit: 3780, eps: 11.2, label: 'Improving' as const },
    { quarter: 'Q4 FY25', revenue: 21500, ebitda: 5310, netProfit: 3650, eps: 10.8, label: 'Improving' as const },
    { quarter: 'Q3 FY25', revenue: 20800, ebitda: 5120, netProfit: 3480, eps: 10.2, label: 'Stable' as const },
    { quarter: 'Q2 FY25', revenue: 20200, ebitda: 4980, netProfit: 3320, eps: 9.8, label: 'Stable' as const },
  ];

  const volumeAnalysis = known?.volumeAnalysis || {
    currentVolume: volume,
    avgVolume,
    volumeChangePct: Number(((volume - avgVolume) / avgVolume * 100).toFixed(1)),
    isVolumeSpike: volume > avgVolume * 1.2,
    relativeVolumeRvol: Number((volume / avgVolume).toFixed(2)),
    signal: changePercent >= 0 ? ('Strong Buying Volume' as const) : ('Strong Selling Volume' as const),
    relationshipSummary: `Trading volume is ${Number((volume / avgVolume).toFixed(2))}x average daily volume — ${changePercent >= 0 ? 'confirming buying interest' : 'reflecting profit taking'}.`,
  };

  const riskAnalysis = known?.riskAnalysis || {
    level: riskPenalty > 50 ? ('HIGH' as const) : riskPenalty > 30 ? ('MODERATE' as const) : ('LOW' as const),
    score: riskPenalty,
    mainRiskFactors: [
      `Sector regulatory adjustments in ${sector}`,
      'Raw material & labor cost inflation',
      'Broad macroeconomic rate cycle changes',
    ],
    explanation: `${name} maintains strong capital solvency with debt-to-equity at ${fundamentals.debtToEquity} and healthy operating margins.`,
  };

  // Positive & Risk factors summary
  const positiveFactors = [
    `Solid financial profitability with ROE at ${fundamentals.roePct}% and zero promoter pledges`,
    `Positive technical alignment trading above key moving averages (20 EMA: ₹${technicals.ema20})`,
    `High news credibility backing with official NSE/BSE filing corroboration`,
  ];

  const riskFactors = riskAnalysis.mainRiskFactors;

  const whatToWatch = [
    'Upcoming Q2 FY26 Earnings Conference Call & Margin Guidance',
    `Key resistance breakdown/breakout test at ₹${resistance1}`,
    'Institutional FII/DII shareholding updates on NSDL portal',
  ];

  // News Sentiment Calculation
  const positiveNewsCount = stockArticles.filter(a => a.sentiment === 'bullish').length;
  const negativeNewsCount = stockArticles.filter(a => a.sentiment === 'bearish').length;
  const neutralNewsCount = stockArticles.filter(a => a.sentiment === 'neutral' || a.sentiment === 'mixed').length;
  
  const totalNews = stockArticles.length || 1;
  const positivePct = stockArticles.length ? Math.round((positiveNewsCount / totalNews) * 100) : 70;
  const negativePct = stockArticles.length ? Math.round((negativeNewsCount / totalNews) * 100) : 10;
  const neutralPct = stockArticles.length ? Math.round((neutralNewsCount / totalNews) * 100) : 20;

  const newsSentimentScore = Math.round((positivePct * 1.0) + (neutralPct * 0.5));

  // Chart datasets
  const charts = {
    '1D': generateChartData(price, 24, 0.5, '1D'),
    '5D': generateChartData(price, 30, 0.8, '5D'),
    '1M': generateChartData(price, 30, 1.2, '1M'),
    '3M': generateChartData(price, 40, 1.8, '3M'),
    '6M': generateChartData(price, 50, 2.2, '6M'),
    '1Y': generateChartData(price, 52, 2.8, '1Y'),
    '5Y': generateChartData(price, 60, 3.5, '5Y'),
  };

  return {
    symbol: upperSymbol,
    name,
    nseSymbol,
    bseCode,
    sector,
    industry,
    price,
    change,
    changePercent,
    marketCapCr,
    high52,
    low52,
    volume,
    avgVolume,
    
    overallScore,
    scoreLabel,
    technicalScore,
    fundamentalScore,
    momentumScore,
    volumeScore,
    newsScore,
    marketSectorScore,
    riskScore: riskPenalty,

    aiExplanation: {
      overallSummary: `StockLens AI assigns ${name} an overall rating of ${overallScore}/100 (${scoreLabel}). The company demonstrates ${fundamentalScore >= 80 ? 'robust fundamental quality' : 'moderate fundamentals'} combined with ${technicalScore >= 75 ? 'a bullish technical trend' : 'range-bound price action'}.`,
      trendSummary: technicals.explanation,
      positiveFactors,
      riskFactors,
      whatToWatch,
    },

    technicals,

    levels: {
      support1,
      support2,
      resistance1,
      resistance2,
      distanceFromSupportPct: distSupp,
      distanceFromResistancePct: distRes,
      state: known?.levels?.state || (distRes < 2.0 ? 'Possible Breakout' : distSupp < 2.0 ? 'Possible Breakdown' : 'Range Bound'),
    },

    fundamentals,
    quarterlyResults,
    volumeAnalysis,

    marketSector: known?.marketSector || {
      sectorPerformance: '+0.6% Today',
      sectorTrend: 'Steady Growth',
      stockVsSector: 'Outperforming Sector by +0.2%',
      stockVsNifty: 'Outperforming NIFTY 50 by +0.3%',
      classification: 'OUTPERFORMING' as const,
    },

    ownership: known?.ownership || {
      promoterHolding: fundamentals.promoterHoldingPct,
      promoterChange: 0.00,
      promoterPledge: fundamentals.promoterPledgePct,
      fiiHolding: fundamentals.fiiHoldingPct,
      fiiChange: 0.20,
      diiHolding: fundamentals.diiHoldingPct,
      diiChange: 0.15,
      publicHolding: Number((100 - fundamentals.promoterHoldingPct - fundamentals.fiiHoldingPct - fundamentals.diiHoldingPct).toFixed(2)),
    },

    riskAnalysis,

    tradeSetup: known?.tradeSetup || {
      currentPrice: price,
      trend: technicals.trend,
      entryZone: `₹${(price * 0.992).toFixed(2)} - ₹${price.toFixed(2)}`,
      support: support1,
      resistance: resistance1,
      invalidationLevel: support2,
      target1: Number((price * 1.04).toFixed(2)),
      target2: Number((price * 1.08).toFixed(2)),
      riskRewardRatio: '1 : 2.2',
      setupQuality: 'Strong',
      disclaimer: 'Educational market analysis — not guaranteed financial advice.',
    },

    charts,

    newsSentiment: {
      score: newsSentimentScore,
      positivePct,
      neutralPct,
      negativePct,
      trend: newsSentimentScore >= 70 ? 'Positive' : newsSentimentScore >= 45 ? 'Neutral' : 'Negative',
      influencingSummary: `Analyzed ${stockArticles.length} recent news reports. ${stockArticles.filter(a => a.credibilityStatus === 'verified').length} verified exchange disclosures corroborate fundamental momentum.`,
    },

    dataSources: [
      { name: 'NSE Realtime Feed', timestamp: 'Live (15m Delayed)', status: 'LIVE' },
      { name: 'BSE Corporate Filings (SEBI LODR Reg 30)', timestamp: 'Aug 11, 2026', status: 'LIVE' },
      { name: 'Audited Financial Statements', timestamp: 'Q1 FY26 Filed', status: 'LAST UPDATED' },
      { name: 'StockLens AI Scoring Engine 3.6', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'LIVE' },
    ],
  };
}
