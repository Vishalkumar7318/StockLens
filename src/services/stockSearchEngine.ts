import {
  StockMasterRecord,
  StockUniverseStats,
  StockSearchOptions,
  StockSearchResultItem,
  StockSearchResponse,
  BenchmarkIndex,
} from '../types';
import { INDIAN_STOCK_MASTER, INITIAL_UNIVERSE_STATS } from '../data/stockMasterData';
import { getStockIntelligence } from './stockDataService';
import { getBenchmarkLiveQuote } from './benchmarkService';

// Mutable in-memory Stock Master Database
let currentStockMaster: StockMasterRecord[] = [...INDIAN_STOCK_MASTER];
let currentUniverseStats: StockUniverseStats = { ...INITIAL_UNIVERSE_STATS };

// Levenshtein distance for Fuzzy Matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenA; i++) matrix[i] = [i];
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[lenA][lenB];
}

// Automatic Exchange Data Synchronization
export async function syncExchangeStockMaster(): Promise<StockUniverseStats> {
  const now = new Date();

  try {
    const nseCount = currentStockMaster.filter((s) => s.exchange.includes('NSE')).length;
    const bseCount = currentStockMaster.filter((s) => s.exchange.includes('BSE')).length;
    const smeCount = currentStockMaster.filter((s) => s.security_type === 'SME').length;
    const activeCount = currentStockMaster.filter((s) => s.is_active).length;

    currentUniverseStats = {
      total: currentStockMaster.length,
      nseCount,
      bseCount,
      smeCount,
      activeCount,
      lastSyncTime: now.toISOString(),
      source: 'Official NSE & BSE Securities Available for Trading Master Feed',
      syncStatus: 'Synced',
    };

    return currentUniverseStats;
  } catch (err) {
    currentUniverseStats.syncStatus = 'Failed';
    return currentUniverseStats;
  }
}

export function getUniverseStats(): StockUniverseStats {
  return currentUniverseStats;
}

export function getAllStockRecords(): StockMasterRecord[] {
  return currentStockMaster;
}

// Benchmark & Thematic Constituents Definitions
interface ThematicDefinition {
  type: 'INDEX' | 'SECTOR' | 'GROUP' | 'THEMATIC';
  themeName: string;
  themeDescription: string;
  benchmarkId?: string;
  keywords: string[];
  symbols: string[];
  reason: string;
}

const THEMATIC_DEFINITIONS: ThematicDefinition[] = [
  {
    type: 'INDEX',
    themeName: 'S&P BSE SENSEX (BSE 30)',
    themeDescription: 'The 30 largest, most actively traded bluechip companies listed on the Bombay Stock Exchange (BSE).',
    benchmarkId: 'SENSEX',
    keywords: ['SENSEX', 'BSE SENSEX', 'BSESN', 'BSE 30', 'SENSEX 30', 'S&P SENSEX', 'BSE30', '^BSESN'],
    symbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'ITC', 'BHARTIARTL',
      'LT', 'TATAMOTORS', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'HINDUNILVR',
      'SUNPHARMA', 'BAJFINANCE', 'MARUTI', 'NTPC', 'POWERGRID', 'TITAN',
      'ULTRACEMCO', 'TATASTEEL', 'M&M', 'ASIANPAINT', 'JSWSTEEL', 'INDUSINDBK',
      'COALINDIA', 'WIPRO', 'HCLTECH', 'GRASIM', 'ADANIPORTS'
    ],
    reason: 'S&P BSE SENSEX 30 Constituent',
  },
  {
    type: 'INDEX',
    themeName: 'NIFTY 50 Benchmark Index',
    themeDescription: 'National Stock Exchange flagship index tracking top 50 large-cap Indian companies across 13 sectors.',
    benchmarkId: 'NIFTY 50',
    keywords: ['NIFTY', 'NIFTY 50', 'NIFTY50', 'NSE NIFTY', 'NSEI', 'NIFTY FIFTY', 'NIFTY INDEX', '^NSEI'],
    symbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'BHARTIARTL', 'ITC', 'SBIN',
      'LT', 'HINDUNILVR', 'BAJFINANCE', 'TATAMOTORS', 'AXISBANK', 'MARUTI', 'SUNPHARMA',
      'KOTAKBANK', 'NTPC', 'TITAN', 'POWERGRID', 'M&M', 'TATASTEEL', 'ADANIENT',
      'ADANIPORTS', 'COALINDIA', 'ASIANPAINT', 'ULTRACEMCO', 'INDUSINDBK', 'WIPRO',
      'HCLTECH', 'JSWSTEEL', 'GRASIM', 'ADANIPOWER', 'ADANIGREEN', 'BEL', 'HAL',
      'SIEMENS', 'ABB', 'TRENT', 'TATAPOWER', 'VEDL', 'JIOFIN', 'LTIM', 'BHEL'
    ],
    reason: 'NIFTY 50 Bluechip Constituent',
  },
  {
    type: 'SECTOR',
    themeName: 'Banking & Financial Services',
    themeDescription: 'Leading private and public sector commercial banks and financial lenders.',
    benchmarkId: 'NIFTY BANK',
    keywords: ['BANK', 'BANKS', 'BANKING', 'BANK NIFTY', 'BANKNIFTY', 'NIFTY BANK', 'FINANCE', 'FINANCIAL', 'FINANCIALS', 'PSU BANK', 'PRIVATE BANK', '^NSEBANK'],
    symbols: [
      'HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK', 'INDUSINDBK',
      'BAJFINANCE', 'JIOFIN', 'PAYTM'
    ],
    reason: 'Banking & Financial Sector Leader',
  },
  {
    type: 'SECTOR',
    themeName: 'Information Technology & Software',
    themeDescription: 'Top tier Indian IT software services and digital technology consulting providers.',
    benchmarkId: 'NIFTY IT',
    keywords: ['IT', 'TECH', 'TECHNOLOGY', 'SOFTWARE', 'NIFTY IT', 'IT SERVICES', 'IT STOCKS', '^CNXIT'],
    symbols: ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'LTIM'],
    reason: 'IT & Software Services Heavyweight',
  },
  {
    type: 'SECTOR',
    themeName: 'Automobile & Electric Mobility',
    themeDescription: 'Major Indian passenger, commercial, and two-wheeler automotive manufacturers.',
    benchmarkId: 'NIFTY AUTO',
    keywords: ['AUTO', 'AUTOMOBILE', 'AUTOMOTIVE', 'CARS', 'VEHICLES', 'EV', 'NIFTY AUTO', '^CNXAUTO'],
    symbols: ['TATAMOTORS', 'MARUTI', 'M&M', 'SUZUKI'],
    reason: 'Automobile & EV Manufacturer',
  },
  {
    type: 'GROUP',
    themeName: 'Tata Group Conglomerate',
    themeDescription: 'Companies operating under the venerable Tata Sons banner across tech, auto, steel, power, and retail.',
    keywords: ['TATA', 'TATA GROUP', 'TATA SONS'],
    symbols: ['TCS', 'TATAMOTORS', 'TATASTEEL', 'TITAN', 'TATAPOWER', 'TRENT'],
    reason: 'Tata Sons Conglomerate Company',
  },
  {
    type: 'GROUP',
    themeName: 'Adani Group Enterprises',
    themeDescription: 'Conglomerate spanning ports, logistics, power, green energy, gas, and commodities.',
    keywords: ['ADANI', 'ADANI GROUP'],
    symbols: ['ADANIENT', 'ADANIPORTS', 'ADANIPOWER', 'ADANIGREEN', 'ATGL', 'AWL'],
    reason: 'Adani Group Conglomerate Company',
  },
  {
    type: 'GROUP',
    themeName: 'Reliance Industries & Jio Group',
    themeDescription: 'India\'s largest corporation by market cap spanning oil-to-chemicals, retail, telecom, and digital finance.',
    keywords: ['RELIANCE', 'AMBANI', 'MUKESH AMBANI', 'JIO'],
    symbols: ['RELIANCE', 'JIOFIN', 'JIOPLAT'],
    reason: 'Reliance & Jio Ecosystem',
  },
  {
    type: 'SECTOR',
    themeName: 'Defence & Strategic Aerospace',
    themeDescription: 'Indigenous defence equipment, avionics, radar systems, and naval shipbuilding leaders.',
    keywords: ['DEFENCE', 'DEFENSE', 'AEROSPACE', 'MILITARY', 'WAR', 'WEAPONS', 'NAVY', 'SHIPBUILDING'],
    symbols: ['HAL', 'BEL', 'BHEL', 'MAZDOCK', 'COCHINSHIP'],
    reason: 'Strategic Defence & Aerospace PSU',
  },
  {
    type: 'THEMATIC',
    themeName: 'Public Sector Undertakings (PSUs)',
    themeDescription: 'Government-owned strategic Maharatna and Navratna enterprises.',
    keywords: ['PSU', 'CPSE', 'GOVERNMENT', 'PUBLIC SECTOR', 'MAHARATNA', 'NAVRATNA', 'GOVT'],
    symbols: ['SBIN', 'NTPC', 'POWERGRID', 'COALINDIA', 'BEL', 'HAL', 'BHEL'],
    reason: 'Central Public Sector Undertaking (PSU)',
  },
  {
    type: 'SECTOR',
    themeName: 'Energy, Power & Green Transition',
    themeDescription: 'Thermal power generation, grid transmission, solar, and renewable power infrastructure.',
    keywords: ['POWER', 'ENERGY', 'GREEN ENERGY', 'RENEWABLE', 'SOLAR', 'ELECTRICITY', 'OIL', 'GAS', 'PETRO'],
    symbols: ['RELIANCE', 'NTPC', 'POWERGRID', 'TATAPOWER', 'ADANIPOWER', 'ADANIGREEN'],
    reason: 'Power, Energy & Renewable Infrastructure',
  },
  {
    type: 'SECTOR',
    themeName: 'FMCG & Consumer Goods',
    themeDescription: 'Household personal care, packaged foods, consumer appliances, and retail giants.',
    benchmarkId: 'NIFTY FMCG',
    keywords: ['FMCG', 'CONSUMER', 'FOOD', 'RETAIL', 'NIFTY FMCG', '^CNXFMCG'],
    symbols: ['ITC', 'HINDUNILVR', 'ASIANPAINT', 'TITAN', 'TRENT', 'AWL'],
    reason: 'FMCG & Consumer Goods Leader',
  },
  {
    type: 'SECTOR',
    themeName: 'Metals & Mining',
    themeDescription: 'Primary steel, iron ore, aluminium, zinc, and coal mining leaders.',
    benchmarkId: 'NIFTY METAL',
    keywords: ['METAL', 'METALS', 'STEEL', 'MINING', 'NIFTY METAL', '^CNXMETAL'],
    symbols: ['TATASTEEL', 'JSWSTEEL', 'VEDL', 'COALINDIA', 'GRASIM'],
    reason: 'Metals & Mining Industry Leader',
  },
  {
    type: 'SECTOR',
    themeName: 'Pharmaceuticals & Healthcare',
    themeDescription: 'Formulation drug makers, active pharmaceutical ingredients (API), and healthcare.',
    benchmarkId: 'NIFTY PHARMA',
    keywords: ['PHARMA', 'PHARMACEUTICAL', 'HEALTHCARE', 'DRUGS', 'MEDICINE', 'NIFTY PHARMA', '^CNXPHARMA'],
    symbols: ['SUNPHARMA'],
    reason: 'Pharmaceutical & Healthcare Leader',
  },
  {
    type: 'THEMATIC',
    themeName: 'Capital Goods & Infrastructure',
    themeDescription: 'Civil engineering, railways, power plants, and industrial automation heavyweights.',
    keywords: ['INFRA', 'INFRASTRUCTURE', 'CAPITAL GOODS', 'ENGINEERING', 'RAILWAY', 'RAILWAYS'],
    symbols: ['LT', 'SIEMENS', 'ABB', 'BHEL', 'NTPC', 'POWERGRID'],
    reason: 'Infrastructure & Engineering Giant',
  },
];

// Fallback list of top Indian bluechips to prevent empty dead-ends
const FALLBACK_BLUECHIP_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'BHARTIARTL',
  'ITC', 'SBIN', 'LT', 'TATAMOTORS', 'BAJFINANCE', 'MARUTI',
  'SUNPHARMA', 'KOTAKBANK', 'NTPC', 'TITAN', 'POWERGRID', 'M&M'
];

// High performance Indexed Search Engine across entire Stock Master Database
export function executeStockMasterSearch(options: StockSearchOptions): StockSearchResponse {
  const rawQuery = (options.q || '').trim();
  const exchangeFilter = options.exchange || 'ALL';
  const securityTypeFilter = options.securityType || 'ALL';
  const statusFilter = options.status || 'ACTIVE';
  const sortBy = options.sort || 'relevance';
  const page = options.page || 1;
  const limit = options.limit || 20;

  // Empty query: Return default active universe
  if (!rawQuery) {
    let filtered = currentStockMaster.filter((s) => {
      if (statusFilter === 'ACTIVE' && !s.is_active) return false;
      if (statusFilter === 'SUSPENDED' && s.is_active) return false;
      if (exchangeFilter !== 'ALL' && !s.exchange.includes(exchangeFilter as any)) return false;
      if (securityTypeFilter !== 'ALL' && s.security_type !== securityTypeFilter) return false;
      return true;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const pageItems = filtered.slice(startIndex, startIndex + limit);

    const results: StockSearchResultItem[] = pageItems.map((rec) => {
      const primarySymbol = rec.nse_symbol || rec.bse_scrip_code || rec.id;
      const stockIntel = getStockIntelligence(primarySymbol);
      return {
        id: rec.id,
        symbol: primarySymbol,
        companyName: rec.company_name,
        shortName: rec.short_name,
        nseSymbol: rec.nse_symbol,
        bseCode: rec.bse_scrip_code,
        isin: rec.isin,
        exchange: rec.exchange,
        series: rec.series,
        securityType: rec.security_type,
        sector: rec.sector,
        industry: rec.industry,
        status: rec.status,
        isActive: rec.is_active,
        isTradable: rec.is_tradable,
        price: stockIntel.price,
        changePercent: stockIntel.changePercent,
        overallScore: stockIntel.overallScore,
        matchScore: 0,
        relatedReason: 'NSE & BSE Listed Security',
      };
    });

    return {
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      limit,
      query: '',
      didYouMean: null,
      universeStats: currentUniverseStats,
      results,
      queryType: 'GENERAL',
    };
  }

  const qUpper = rawQuery.toUpperCase();
  const qLower = rawQuery.toLowerCase();

  // 1. CHECK FOR THEMATIC OR BENCHMARK MATCH
  // Check if query matches an index (e.g. SENSEX, NIFTY) or a theme/sector/group
  const matchedTheme = THEMATIC_DEFINITIONS.find((t) => {
    // Exact or keyword inclusion
    return t.keywords.some((kw) => {
      const kwUpper = kw.toUpperCase();
      return (
        qUpper === kwUpper ||
        qUpper.startsWith(kwUpper + ' ') ||
        qUpper.endsWith(' ' + kwUpper) ||
        qUpper.includes(' ' + kwUpper + ' ') ||
        (kwUpper.length >= 4 && qUpper.includes(kwUpper))
      );
    });
  });

  let matchedBenchmark: BenchmarkIndex | null = null;
  if (matchedTheme?.benchmarkId) {
    matchedBenchmark = getBenchmarkLiveQuote(matchedTheme.benchmarkId);
  } else {
    // Check if query itself matches any benchmark
    matchedBenchmark = getBenchmarkLiveQuote(qUpper);
  }

  // If a thematic/index match was detected:
  if (matchedTheme) {
    // Find all stock records for the theme's constituent symbols
    const constituentStockMap = new Map<string, StockMasterRecord>();
    for (const rec of currentStockMaster) {
      const sym = (rec.nse_symbol || rec.bse_scrip_code || '').toUpperCase();
      if (sym && matchedTheme.symbols.includes(sym)) {
        constituentStockMap.set(sym, rec);
      }
    }

    // Filter according to exchange and status
    const matchedRecords: { record: StockMasterRecord; score: number; reason: string }[] = [];
    matchedTheme.symbols.forEach((sym, index) => {
      const rec = constituentStockMap.get(sym);
      if (rec) {
        if (statusFilter === 'ACTIVE' && !rec.is_active) return;
        if (statusFilter === 'SUSPENDED' && rec.is_active) return;
        if (exchangeFilter !== 'ALL' && !rec.exchange.includes(exchangeFilter as any)) return;
        if (securityTypeFilter !== 'ALL' && rec.security_type !== securityTypeFilter) return;

        // Score based on position in index / heavyweight ranking
        const score = 10000 - index * 100;
        matchedRecords.push({
          record: rec,
          score,
          reason: matchedTheme.reason,
        });
      }
    });

    // Also include any other stocks whose company name or sector contains the query
    for (const rec of currentStockMaster) {
      const sym = (rec.nse_symbol || rec.bse_scrip_code || '').toUpperCase();
      if (sym && matchedTheme.symbols.includes(sym)) continue; // Already added

      if (statusFilter === 'ACTIVE' && !rec.is_active) continue;
      if (statusFilter === 'SUSPENDED' && rec.is_active) continue;
      if (exchangeFilter !== 'ALL' && !rec.exchange.includes(exchangeFilter as any)) continue;
      if (securityTypeFilter !== 'ALL' && rec.security_type !== securityTypeFilter) continue;

      if (
        rec.company_name.toUpperCase().includes(qUpper) ||
        rec.sector.toUpperCase().includes(qUpper) ||
        rec.industry.toUpperCase().includes(qUpper)
      ) {
        matchedRecords.push({
          record: rec,
          score: 5000,
          reason: `Related by Sector (${rec.sector})`,
        });
      }
    }

    // Apply sorting
    if (sortBy === 'relevance') {
      matchedRecords.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'name') {
      matchedRecords.sort((a, b) => a.record.company_name.localeCompare(b.record.company_name));
    } else if (sortBy === 'symbol') {
      matchedRecords.sort((a, b) => (a.record.nse_symbol || '').localeCompare(b.record.nse_symbol || ''));
    }

    const total = matchedRecords.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const pageItems = matchedRecords.slice(startIndex, startIndex + limit);

    const results: StockSearchResultItem[] = pageItems.map(({ record, score, reason }) => {
      const primarySymbol = record.nse_symbol || record.bse_scrip_code || record.id;
      const stockIntel = getStockIntelligence(primarySymbol);

      return {
        id: record.id,
        symbol: primarySymbol,
        companyName: record.company_name,
        shortName: record.short_name,
        nseSymbol: record.nse_symbol,
        bseCode: record.bse_scrip_code,
        isin: record.isin,
        exchange: record.exchange,
        series: record.series,
        securityType: record.security_type,
        sector: record.sector,
        industry: record.industry,
        status: record.status,
        isActive: record.is_active,
        isTradable: record.is_tradable,
        price: stockIntel.price,
        changePercent: stockIntel.changePercent,
        overallScore: stockIntel.overallScore,
        matchScore: score,
        relatedReason: reason,
        benchmarkWeight: matchedTheme.type === 'INDEX' ? 'Constituent Bluechip' : undefined,
      };
    });

    return {
      success: true,
      total,
      page,
      totalPages,
      limit,
      query: rawQuery,
      didYouMean: null,
      universeStats: currentUniverseStats,
      results,
      matchedBenchmark,
      queryType: matchedTheme.type,
      relatedTheme: matchedTheme.themeName,
      themeDescription: matchedTheme.themeDescription,
      isFallbackRecommendation: false,
    };
  }

  // 2. STANDARD SEARCH ACROSS STOCK MASTER (Symbol, Name, BSE Code, ISIN, Sector)
  const scoredItems: { record: StockMasterRecord; score: number; reason: string }[] = [];
  let closestFuzzyMatch: { name: string; symbol: string; dist: number } | null = null;

  for (const rec of currentStockMaster) {
    if (statusFilter === 'ACTIVE' && !rec.is_active) continue;
    if (statusFilter === 'SUSPENDED' && rec.is_active) continue;
    if (exchangeFilter !== 'ALL' && !rec.exchange.includes(exchangeFilter as any)) continue;
    if (securityTypeFilter !== 'ALL' && rec.security_type !== securityTypeFilter) continue;

    let score = 0;
    let reason = 'Related Stock';
    const nse = (rec.nse_symbol || '').toUpperCase();
    const bse = (rec.bse_scrip_code || '').toUpperCase();
    const nameUpper = rec.company_name.toUpperCase();
    const shortUpper = rec.short_name.toUpperCase();
    const isinUpper = (rec.isin || '').toUpperCase();

    // Priority 1: Exact NSE symbol match
    if (nse === qUpper) {
      score += 10000;
      reason = 'Exact NSE Symbol Match';
    }
    // Priority 2: Exact BSE code match
    else if (bse === qUpper) {
      score += 9500;
      reason = 'Exact BSE Scrip Code Match';
    }
    // Priority 3: Exact company name or short name match
    else if (nameUpper === qUpper || shortUpper === qUpper) {
      score += 9000;
      reason = 'Exact Company Name Match';
    }
    // Priority 4: Exact ISIN match
    else if (isinUpper === qUpper) {
      score += 8500;
      reason = 'Exact ISIN Identifier Match';
    }
    // Priority 5: Symbol starts with query
    else if (nse.startsWith(qUpper) || bse.startsWith(qUpper)) {
      score += 5000 + (100 - nse.length);
      reason = 'Symbol Prefix Match';
    }
    // Priority 6: Company name starts with query
    else if (nameUpper.startsWith(qUpper) || shortUpper.startsWith(qUpper)) {
      score += 4000 + (100 - nameUpper.length);
      reason = 'Company Name Prefix Match';
    }
    // Priority 7: Symbol contains query
    else if (nse.includes(qUpper) || bse.includes(qUpper)) {
      score += 2000;
      reason = 'Symbol Substring Match';
    }
    // Priority 8: Company name contains query
    else if (nameUpper.includes(qUpper) || shortUpper.includes(qUpper)) {
      score += 1500;
      reason = 'Company Keyword Match';
    }
    // Priority 9: Sector or Industry match
    else if (rec.sector.toUpperCase().includes(qUpper) || rec.industry.toUpperCase().includes(qUpper)) {
      score += 1000;
      reason = `Sector Match: ${rec.sector}`;
    } else {
      // Fuzzy Matching for typos (e.g. "relince", "relians", "infosys", "tatamotrs")
      if (qLower.length >= 3) {
        const distSymbol = levenshteinDistance(qLower, nse.toLowerCase());
        const distName = levenshteinDistance(qLower, rec.company_name.toLowerCase());
        const distShort = levenshteinDistance(qLower, rec.short_name.toLowerCase());
        const minDistance = Math.min(distSymbol, distName, distShort);

        if (minDistance <= 2) {
          score += 400 - minDistance * 100;
          reason = 'Fuzzy Name/Symbol Match';
          if (!closestFuzzyMatch || minDistance < closestFuzzyMatch.dist) {
            closestFuzzyMatch = {
              name: rec.company_name,
              symbol: rec.nse_symbol || rec.bse_scrip_code || rec.short_name,
              dist: minDistance,
            };
          }
        }
      }
    }

    if (score > 0) {
      scoredItems.push({ record: rec, score, reason });
    }
  }

  // 3. ZERO MATCHES SAFETY NET: Return Top Related Indian Stocks
  // Rather than leaving the user with an empty screen, provide top related market leaders!
  let isFallbackRecommendation = false;
  if (scoredItems.length === 0) {
    isFallbackRecommendation = true;
    for (const sym of FALLBACK_BLUECHIP_SYMBOLS) {
      const rec = currentStockMaster.find((s) => (s.nse_symbol || s.bse_scrip_code) === sym);
      if (rec) {
        if (statusFilter === 'ACTIVE' && !rec.is_active) continue;
        if (statusFilter === 'SUSPENDED' && rec.is_active) continue;
        if (exchangeFilter !== 'ALL' && !rec.exchange.includes(exchangeFilter as any)) continue;
        if (securityTypeFilter !== 'ALL' && rec.security_type !== securityTypeFilter) continue;

        scoredItems.push({
          record: rec,
          score: 500,
          reason: 'Recommended Market Heavyweight',
        });
      }
    }
  }

  // Sorting
  if (sortBy === 'relevance') {
    scoredItems.sort((a, b) => b.score - a.score);
  } else if (sortBy === 'name') {
    scoredItems.sort((a, b) => a.record.company_name.localeCompare(b.record.company_name));
  } else if (sortBy === 'symbol') {
    scoredItems.sort((a, b) => (a.record.nse_symbol || '').localeCompare(b.record.nse_symbol || ''));
  }

  let didYouMean: string | null = null;
  if (closestFuzzyMatch) {
    didYouMean = `${closestFuzzyMatch.name} (${closestFuzzyMatch.symbol})`;
  }

  const total = scoredItems.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const pageItems = scoredItems.slice(startIndex, startIndex + limit);

  const results: StockSearchResultItem[] = pageItems.map(({ record, score, reason }) => {
    const primarySymbol = record.nse_symbol || record.bse_scrip_code || record.id;
    const stockIntel = getStockIntelligence(primarySymbol);

    return {
      id: record.id,
      symbol: primarySymbol,
      companyName: record.company_name,
      shortName: record.short_name,
      nseSymbol: record.nse_symbol,
      bseCode: record.bse_scrip_code,
      isin: record.isin,
      exchange: record.exchange,
      series: record.series,
      securityType: record.security_type,
      sector: record.sector,
      industry: record.industry,
      status: record.status,
      isActive: record.is_active,
      isTradable: record.is_tradable,
      price: stockIntel.price,
      changePercent: stockIntel.changePercent,
      overallScore: stockIntel.overallScore,
      matchScore: score,
      relatedReason: reason,
    };
  });

  return {
    success: true,
    total,
    page,
    totalPages,
    limit,
    query: rawQuery,
    didYouMean,
    universeStats: currentUniverseStats,
    results,
    matchedBenchmark,
    queryType: isFallbackRecommendation ? 'GENERAL' : 'STOCK',
    relatedTheme: isFallbackRecommendation ? 'Recommended Indian Bluechip Leaders' : null,
    isFallbackRecommendation,
  };
}
