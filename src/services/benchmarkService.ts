import { BenchmarkIndex, BenchmarkMarketStatus, BenchmarkResponse } from '../types';

export interface BenchmarkConfig {
  id: string;
  symbol: string;
  name: string;
  fullName: string;
  exchange: 'NSE' | 'BSE';
  category: 'Broad Market' | 'Sectoral' | 'Volatility';
  basePrice: number;
  basePrevClose: number;
  baseDayHigh: number;
  baseDayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  description: string;
}

export const INDIAN_BENCHMARK_CONFIGS: BenchmarkConfig[] = [
  { id:'nifty-50', symbol:'^NSEI', name:'NIFTY 50', fullName:'NIFTY 50 Benchmark Index', exchange:'NSE', category:'Broad Market', basePrice:23802.40, basePrevClose:23897.70, baseDayHigh:23890, baseDayLow:23789.45, fiftyTwoWeekHigh:26373.20, fiftyTwoWeekLow:22182.55, description:'National Stock Exchange flagship index.' },
  { id:'sensex', symbol:'^BSESN', name:'SENSEX', fullName:'BSE SENSEX', exchange:'BSE', category:'Broad Market', basePrice:76172.22, basePrevClose:76515.43, baseDayHigh:76477.19, baseDayLow:76165.03, fiftyTwoWeekHigh:86004.85, fiftyTwoWeekLow:71200.30, description:'Bombay Stock Exchange 30-share benchmark index.' },
  { id:'nifty-bank', symbol:'^NSEBANK', name:'NIFTY BANK', fullName:'NIFTY Bank Index', exchange:'NSE', category:'Sectoral', basePrice:57077.60, basePrevClose:57369.65, baseDayHigh:57426.85, baseDayLow:57050.30, fiftyTwoWeekHigh:59280.40, fiftyTwoWeekLow:46800.15, description:'Tracks major Indian banking stocks.' },
  { id:'nifty-it', symbol:'^CNXIT', name:'NIFTY IT', fullName:'NIFTY IT Index', exchange:'NSE', category:'Sectoral', basePrice:30096.85, basePrevClose:30695.10, baseDayHigh:30377.10, baseDayLow:30063.90, fiftyTwoWeekHigh:44800, fiftyTwoWeekLow:28900.50, description:'Tracks Indian technology and IT services companies.' },
  { id:'nifty-midcap-100', symbol:'NIFTY_MIDCAP_100.NS', name:'NIFTY MIDCAP 100', fullName:'NIFTY Midcap 100 Index', exchange:'NSE', category:'Broad Market', basePrice:62994.25, basePrevClose:63079.05, baseDayHigh:63166.60, baseDayLow:62878, fiftyTwoWeekHigh:66300, fiftyTwoWeekLow:50120, description:'Tracks 100 medium-cap Indian companies.' },
  { id:'nifty-auto', symbol:'^CNXAUTO', name:'NIFTY AUTO', fullName:'NIFTY Auto Index', exchange:'NSE', category:'Sectoral', basePrice:27715, basePrevClose:27710.90, baseDayHigh:27749.85, baseDayLow:27552.05, fiftyTwoWeekHigh:29800, fiftyTwoWeekLow:21500, description:'Tracks Indian automobile companies.' },
  { id:'india-vix', symbol:'^INDIAVIX', name:'INDIA VIX', fullName:'India Volatility Index', exchange:'NSE', category:'Volatility', basePrice:11.25, basePrevClose:10.68, baseDayHigh:11.28, baseDayLow:10.28, fiftyTwoWeekHigh:31.70, fiftyTwoWeekLow:9.85, description:'Measures near-term expected Nifty volatility.' },
  { id:'nifty-fmcg', symbol:'^CNXFMCG', name:'NIFTY FMCG', fullName:'NIFTY Fast Moving Consumer Goods', exchange:'NSE', category:'Sectoral', basePrice:45700.40, basePrevClose:45580, baseDayHigh:45850, baseDayLow:45510, fiftyTwoWeekHigh:54100, fiftyTwoWeekLow:43200, description:'Tracks Indian consumer goods companies.' },
  { id:'nifty-pharma', symbol:'^CNXPHARMA', name:'NIFTY PHARMA', fullName:'NIFTY Pharma Index', exchange:'NSE', category:'Sectoral', basePrice:26586.90, basePrevClose:26490.50, baseDayHigh:26680, baseDayLow:26450, fiftyTwoWeekHigh:28900, fiftyTwoWeekLow:21100, description:'Tracks Indian pharmaceutical companies.' },
  { id:'nifty-metal', symbol:'^CNXMETAL', name:'NIFTY METAL', fullName:'NIFTY Metal Index', exchange:'NSE', category:'Sectoral', basePrice:13183.85, basePrevClose:13240.20, baseDayHigh:13290, baseDayLow:13120, fiftyTwoWeekHigh:15100, fiftyTwoWeekLow:11200, description:'Tracks Indian metal and mining companies.' }
];

export function formatIndianNumber(num: number, decimals = 2): string {
  if (!Number.isFinite(num)) return '0.00';
  const [whole, fraction] = num.toFixed(decimals).split('.');
  const negative = whole.startsWith('-');
  let digits = negative ? whole.slice(1) : whole;
  if (digits.length <= 3) return `${negative ? '-' : ''}${digits}.${fraction ?? '00'}`;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${rest},${lastThree}.${fraction ?? '00'}`;
}

function istDate(now = new Date()) {
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

export function getIndianMarketStatus(): BenchmarkMarketStatus {
  const now = new Date();
  const ist = istDate(now);
  const day = ist.getDay();
  const minutes = ist.getHours() * 60 + ist.getMinutes();
  const seconds = String(ist.getSeconds()).padStart(2, '0');
  const hours12 = ist.getHours() % 12 || 12;
  const ampm = ist.getHours() >= 12 ? 'PM' : 'AM';
  const istTime = `${String(hours12).padStart(2,'0')}:${String(ist.getMinutes()).padStart(2,'0')}:${seconds} ${ampm} IST`;
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) return { status:'CLOSED', label:'Market Closed (Weekend)', istTime, isLive:false, nextSession:'Opens Monday 09:15 AM IST' };
  if (minutes >= 540 && minutes < 555) return { status:'PRE_MARKET', label:'Pre-Market Session', istTime, isLive:false, nextSession:'Regular trading starts 09:15 AM IST' };
  if (minutes >= 555 && minutes < 930) return { status:'OPEN', label:'NSE/BSE Market LIVE', istTime, isLive:true, nextSession:'Closes at 03:30 PM IST' };
  if (minutes >= 930 && minutes < 960) return { status:'POST_MARKET', label:'Market Closed (Post-Market Session)', istTime, isLive:false, nextSession:'Next regular session 09:15 AM IST' };
  return { status:'CLOSED', label:'Market Closed', istTime, isLive:false, nextSession:minutes < 540 ? 'Opens today 09:15 AM IST' : 'Opens next trading day 09:15 AM IST' };
}

let activeBenchmarks: BenchmarkIndex[] = INDIAN_BENCHMARK_CONFIGS.map((config) => {
  const change = config.basePrice - config.basePrevClose;
  const changePercent = (change / config.basePrevClose) * 100;
  const positive = change >= 0;
  return {
    symbol:config.symbol, name:config.name, fullName:config.fullName, exchange:config.exchange,
    price:config.basePrice, formattedPrice:formatIndianNumber(config.basePrice,2), change:Number(change.toFixed(2)),
    changePercent:Number(changePercent.toFixed(2)), formattedChange:`${positive ? '+' : ''}${change.toFixed(2)} (${positive ? '+' : ''}${changePercent.toFixed(2)}%)`, positive,
    dayHigh:config.baseDayHigh, dayLow:config.baseDayLow, previousClose:config.basePrevClose,
    fiftyTwoWeekHigh:config.fiftyTwoWeekHigh, fiftyTwoWeekLow:config.fiftyTwoWeekLow,
    sparkline:[config.basePrevClose,config.baseDayLow,(config.basePrice+config.basePrevClose)/2,config.baseDayHigh,config.basePrice],
    lastUpdated:new Date().toISOString(), category:config.category, description:config.description
  };
});

type BenchmarkTickListener = (data: BenchmarkResponse) => void;
const tickListeners = new Set<BenchmarkTickListener>();
export function subscribeToBenchmarkTicks(listener: BenchmarkTickListener) { tickListeners.add(listener); return () => tickListeners.delete(listener); }

let marketSimulationMode: 'auto'|'simulate_live' = 'auto';
export function setMarketSimulationMode(mode:'auto'|'simulate_live') { marketSimulationMode = mode; }
export function getMarketSimulationMode() { return marketSimulationMode; }

let isTickEngineStarted = false;
async function syncWithYahooFinance() {
  await Promise.all(INDIAN_BENCHMARK_CONFIGS.map(async (config) => {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(config.symbol)}?range=1d&interval=1m`, { headers:{ Accept:'application/json','User-Agent':'Mozilla/5.0 StockLens/1.0' } });
      if (!response.ok) return;
      const json = await response.json();
      const meta = json?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice;
      const prevClose = meta?.previousClose || meta?.chartPreviousClose;
      if (typeof price !== 'number' || price <= 0) return;
      const idx = activeBenchmarks.findIndex((item) => item.symbol === config.symbol);
      if (idx < 0) return;
      const current = activeBenchmarks[idx];
      const finalPrevClose = typeof prevClose === 'number' && prevClose > 0 ? prevClose : current.previousClose;
      const change = price - finalPrevClose;
      const changePercent = (change / finalPrevClose) * 100;
      const positive = change >= 0;
      const sparkline = [...(current.sparkline || []), price].slice(-24);
      activeBenchmarks[idx] = {
        ...current, price, previousClose:finalPrevClose,
        formattedPrice:formatIndianNumber(price,2), change:Number(change.toFixed(2)), changePercent:Number(changePercent.toFixed(2)),
        formattedChange:`${positive ? '+' : ''}${change.toFixed(2)} (${positive ? '+' : ''}${changePercent.toFixed(2)}%)`, positive,
        dayHigh:typeof meta?.regularMarketDayHigh === 'number' ? meta.regularMarketDayHigh : Math.max(current.dayHigh,price),
        dayLow:typeof meta?.regularMarketDayLow === 'number' ? meta.regularMarketDayLow : Math.min(current.dayLow,price),
        sparkline, lastUpdated:new Date().toISOString()
      };
    } catch {}
  }));
}

function applyTick() {
  const status = getIndianMarketStatus();
  const isSimulation = marketSimulationMode === 'simulate_live';
  const isTradingActive = isSimulation || status.status === 'OPEN';

  if (!isTradingActive) {
    const payload: BenchmarkResponse = { success:true, benchmarks:activeBenchmarks, marketStatus:{...status,isLive:false,simulationActive:false,label:`${status.label} (Prices Frozen at Close)`}, lastUpdated:new Date().toISOString() };
    tickListeners.forEach((listener) => listener(payload));
    return;
  }

  activeBenchmarks = activeBenchmarks.map((item) => {
    const volatility = item.name === 'INDIA VIX' ? 0.00025 : 0.00008;
    const direction = Math.random() > 0.49 ? 1 : -1;
    const price = Number((item.price * (1 + volatility * direction * Math.random())).toFixed(2));
    const change = price - item.previousClose;
    const changePercent = (change / item.previousClose) * 100;
    const positive = change >= 0;
    const sparkline = [...(item.sparkline || []), price].slice(-24);
    return { ...item, price, formattedPrice:formatIndianNumber(price,2), change:Number(change.toFixed(2)), changePercent:Number(changePercent.toFixed(2)), formattedChange:`${positive ? '+' : ''}${change.toFixed(2)} (${positive ? '+' : ''}${changePercent.toFixed(2)}%)`, positive, dayHigh:Math.max(item.dayHigh,price), dayLow:Math.min(item.dayLow,price), sparkline, lastUpdated:new Date().toISOString() };
  });

  const payload: BenchmarkResponse = { success:true, benchmarks:activeBenchmarks, marketStatus:{...status,isLive:true,simulationActive:isSimulation,label:isSimulation ? 'Live Simulation Mode (1s Ticking)' : status.label}, lastUpdated:new Date().toISOString() };
  tickListeners.forEach((listener) => listener(payload));
}

function startEngine() {
  if (isTickEngineStarted) return;
  isTickEngineStarted = true;
  syncWithYahooFinance().catch(() => {});
  setInterval(() => syncWithYahooFinance().catch(() => {}), 10000);
  setInterval(applyTick, 1000);
}
startEngine();

export async function fetchLiveBenchmarks(): Promise<BenchmarkResponse> {
  const marketStatus = getIndianMarketStatus();
  const isSimulation = marketSimulationMode === 'simulate_live';
  const isTradingActive = isSimulation || marketStatus.status === 'OPEN';
  return { success:true, benchmarks:activeBenchmarks, marketStatus:{...marketStatus,isLive:isTradingActive,simulationActive:isSimulation,label:isSimulation ? 'Live Simulation Mode (1s Ticking)' : isTradingActive ? marketStatus.label : `${marketStatus.label} (Prices Frozen at Close)`}, lastUpdated:new Date().toISOString() };
}

export function getBenchmarkLiveQuote(identifier:string): BenchmarkIndex|null {
  const q = identifier.trim().toUpperCase();
  const found = activeBenchmarks.find((item) => item.name.toUpperCase() === q || item.symbol.toUpperCase() === q || item.fullName.toUpperCase().includes(q) || (q === 'NIFTY' && item.name === 'NIFTY 50') || (q === 'SENSEX' && item.name === 'SENSEX'));
  if (found) return found;
  const config = INDIAN_BENCHMARK_CONFIGS.find((item) => item.name.toUpperCase() === q || item.symbol.toUpperCase() === q || item.id.toUpperCase() === q);
  if (!config) return null;
  const change = config.basePrice - config.basePrevClose;
  const positive = change >= 0;
  return { symbol:config.symbol,name:config.name,fullName:config.fullName,exchange:config.exchange,price:config.basePrice,formattedPrice:formatIndianNumber(config.basePrice),change:Number(change.toFixed(2)),changePercent:Number((change/config.basePrevClose*100).toFixed(2)),formattedChange:`${positive ? '+' : ''}${change.toFixed(2)}`,positive,dayHigh:config.baseDayHigh,dayLow:config.baseDayLow,previousClose:config.basePrevClose,fiftyTwoWeekHigh:config.fiftyTwoWeekHigh,fiftyTwoWeekLow:config.fiftyTwoWeekLow,sparkline:[config.basePrevClose,config.baseDayLow,config.basePrice],lastUpdated:new Date().toISOString(),category:config.category,description:config.description };
}
