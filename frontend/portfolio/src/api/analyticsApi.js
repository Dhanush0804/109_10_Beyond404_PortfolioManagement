import axiosInstance from './axiosInstance';
import mockChartData from '../data/mockChartData.json';

/* ── Dummy: overall P&L stats ── */
const buildDummySummary = () => ({
  totalInvested: 210590.00,
  currentValue:  228304.11,
  totalProfit:    17714.11,
  totalLoss:       5230.00,
  netPnL:         17714.11,
  returnPercent:    8.41,
  totalPositions:    6,
});

/* ── Dummy: per-stock P&L ── */
const buildDummyStockWise = () => [
  { stockId: 1, ticker: 'AAPL', companyName: 'Apple Inc.',     invested: 18950, currentValue: 20745, pnl:  1795, pnlPercent:  9.47, lastPrice: 189.50, prevPrice: 182.30, marketCap: '2.9T', volume: '62.1M' },
  { stockId: 2, ticker: 'TSLA', companyName: 'Tesla Inc.',      invested: 24820, currentValue: 22338, pnl: -2482, pnlPercent: -10.00, lastPrice: 248.20, prevPrice: 259.80, marketCap: '790B', volume: '98.4M' },
  { stockId: 3, ticker: 'MSFT', companyName: 'Microsoft Corp.', invested: 41560, currentValue: 45716, pnl:  4156, pnlPercent:  10.00, lastPrice: 415.60, prevPrice: 398.10, marketCap: '3.1T', volume: '21.3M' },
  { stockId: 4, ticker: 'GOOG', companyName: 'Google LLC',       invested: 17890, currentValue: 19679, pnl:  1789, pnlPercent:  10.00, lastPrice: 178.90, prevPrice: 171.40, marketCap: '2.2T', volume: '18.7M' },
  { stockId: 5, ticker: 'NVDA', companyName: 'NVIDIA Corp.',     invested: 87530, currentValue: 96283, pnl:  8753, pnlPercent:  10.00, lastPrice: 875.30, prevPrice: 820.00, marketCap: '2.1T', volume: '42.9M' },
  { stockId: 6, ticker: 'AMZN', companyName: 'Amazon Inc.',      invested: 19840, currentValue: 17856, pnl: -1984, pnlPercent: -10.00, lastPrice: 198.40, prevPrice: 205.60, marketCap: '2.0T', volume: '33.5M' },
];

/* ── Dummy: overall portfolio chart ── */
const buildDummyPortfolioChart = () => {
  const data = [];
  const now = new Date('2024-01-01');
  let value = 180000;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    value += (Math.random() - 0.42) * 2400;
    data.push({ date: d.toISOString().split('T')[0], value: Math.round(value) });
  }
  return data;
};

/* ── Get mock stock chart data by ticker or stockId and range ── */
const getMockStockChartData = (stockId, ticker, range = '1Y') => {
  const tickerMap = { 1: 'AAPL', 2: 'TSLA', 3: 'MSFT', 4: 'GOOG', 5: 'NVDA', 6: 'AMZN' };
  const key = ticker || tickerMap[stockId] || 'AAPL';
  const stockObj = mockChartData[key] || mockChartData['AAPL'];
  
  if (stockObj.ranges && stockObj.ranges[range]) {
    return stockObj.ranges[range];
  }

  // Generated fallback if requested range isn't explicitly defined in JSON
  const base = stockObj.currentPrice || 200;
  const count = range === '1D' ? 7 : range === '1W' ? 7 : range === '1M' ? 30 : 90;
  return Array.from({ length: count }, (_, i) => ({
    date: `Point ${i + 1}`,
    price: parseFloat((base * (0.9 + Math.sin(i * 0.5) * 0.1)).toFixed(2)),
    volume: Math.round(Math.random() * 50_000_000 + 10_000_000),
  }));
};

export const fetchPortfolioSummary = async (customerId) => {
  try {
    const { data } = await axiosInstance.get('/api/analytics/summary', { params: { customerId } });
    return data;
  } catch {
    console.warn('fetchPortfolioSummary → using dummy data');
    return buildDummySummary();
  }
};

export const fetchStockWisePnL = async (customerId) => {
  try {
    const { data } = await axiosInstance.get('/api/analytics/stock-wise', { params: { customerId } });
    return data;
  } catch {
    console.warn('fetchStockWisePnL → using dummy data');
    return buildDummyStockWise();
  }
};

/**
 * Fetch time-series chart data.
 * @param {string} mode     - 'portfolio' | 'stock'
 * @param {number} stockId  - stock ID
 * @param {string} ticker   - stock ticker symbol (e.g. 'AAPL', 'MSFT')
 * @param {string} range    - '1D' | '1W' | '1M' | '6M' | '1Y'
 * @param {number} customerId
 */
export const fetchChartData = async ({ mode = 'portfolio', stockId = null, ticker = null, range = '1Y', customerId = null } = {}) => {
  try {
    if (mode === 'stock' && (stockId || ticker)) {
      // Backend Endpoint: GET /api/chart-data/{tickerOrStockId}?range={range}
      const identifier = ticker || stockId;
      const { data } = await axiosInstance.get(`/api/chart-data/${identifier}`, { params: { range } });
      return data;
    }
    const { data } = await axiosInstance.get('/api/analytics/portfolio-chart', { params: { customerId, range } });
    return data;
  } catch {
    console.warn('fetchChartData → using mock JSON response structure');
    return mode === 'stock' ? getMockStockChartData(stockId, ticker, range) : buildDummyPortfolioChart();
  }
};
