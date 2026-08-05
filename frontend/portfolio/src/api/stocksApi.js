import axiosInstance from './axiosInstance';

const DUMMY_STOCKS = [
  { stockId: 1, companyName: 'Apple Inc.',      ticker: 'AAPL', sector: 'Technology',   currentPrice: 189.50, previousPrice: 182.30 },
  { stockId: 2, companyName: 'Tesla Inc.',       ticker: 'TSLA', sector: 'Automotive',   currentPrice: 248.20, previousPrice: 259.80 },
  { stockId: 3, companyName: 'Microsoft Corp.',  ticker: 'MSFT', sector: 'Technology',   currentPrice: 415.60, previousPrice: 398.10 },
  { stockId: 4, companyName: 'Google LLC',       ticker: 'GOOG', sector: 'Technology',   currentPrice: 178.90, previousPrice: 171.40 },
  { stockId: 5, companyName: 'NVIDIA Corp.',     ticker: 'NVDA', sector: 'Semiconductors', currentPrice: 875.30, previousPrice: 820.00 },
  { stockId: 6, companyName: 'Amazon.com Inc.',  ticker: 'AMZN', sector: 'E-Commerce',   currentPrice: 198.40, previousPrice: 205.60 },
];

const DUMMY_MARKET_RESULTS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NMS', type: 'Equity', exchange_display: 'NASDAQ' },
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NMS', type: 'Equity', exchange_display: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NMS', type: 'Equity', exchange_display: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NMS', type: 'Equity', exchange_display: 'NASDAQ' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Limited', exchange: 'NSE', type: 'Equity', exchange_display: 'NSE' },
];

const mapMarketResult = (result) => ({
  ticker: result?.symbol ?? result?.ticker ?? '',
  companyName: result?.name ?? result?.companyName ?? '',
  exchange: result?.exchange ?? '',
  type: result?.type ?? '',
  exchangeDisplay: result?.exchange_display ?? result?.exchangeDisplay ?? '',
});

export const fetchAllStocks = async () => {
  try {
    const { data } = await axiosInstance.get('/beyond404/stocks/all');
    return data;
  } catch {
    console.warn('fetchAllStocks → using dummy data');
    return DUMMY_STOCKS;
  }
};

export const fetchStockById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/beyond404/stocks/${id}`);
    return data;
  } catch {
    console.warn('fetchStockById → using dummy data');
    return DUMMY_STOCKS.find((s) => s.stockId === Number(id)) ?? DUMMY_STOCKS[0];
  }
};

export const fetchStocksBySector = async (sector) => {
  try {
    const { data } = await axiosInstance.get('/beyond404/stocks/sector', { params: { sector } });
    return data;
  } catch {
    console.warn('fetchStocksBySector → using dummy data');
    return DUMMY_STOCKS.filter((s) => s.sector === sector);
  }
};

export const searchStocksByTickerQuery = async (query) => {
  const q = String(query ?? '').trim();
  if (!q) return [];

  try {
    const { data } = await axiosInstance.get('/api/stocks/dummy/search', { params: { q } });
    return Array.isArray(data) ? data : [];
  } catch {
    console.warn('searchStocksByTickerQuery → using dummy search data');
    const normalized = q.toUpperCase();
    return DUMMY_STOCKS
      .filter((stock) =>
        stock.ticker.toUpperCase().includes(normalized)
        || stock.companyName.toUpperCase().includes(normalized)
      )
      .map((stock) => ({
        stockId: stock.stockId,
        ticker: stock.ticker,
        companyName: stock.companyName,
      }));
  }
};

export const fetchStockAnalyticsDetails = async ({ ticker, customerId }) => {
  try {
    const { data } = await axiosInstance.get(`/api/chart-data/${ticker}`, { params: { range: '1d' } });
    const latestPoint = Array.isArray(data?.ranges?.['1D']) && data.ranges['1D'].length > 0
      ? data.ranges['1D'][data.ranges['1D'].length - 1]
      : null;

    const previousPoint = Array.isArray(data?.ranges?.['1D']) && data.ranges['1D'].length > 1
      ? data.ranges['1D'][data.ranges['1D'].length - 2]
      : null;

    const currentPrice = Number(latestPoint?.price ?? data?.currentPrice ?? 0);
    const prevPrice = Number(previousPoint?.price ?? data?.previousClose ?? 0);

    return {
      customerId,
      ticker: data?.tickerId ?? ticker,
      companyName: data?.companyName ?? ticker,
      currentValue: currentPrice,
      lastPrice: currentPrice,
      prevPrice,
      volume: latestPoint?.volume ? `${(Number(latestPoint.volume) / 1_000_000).toFixed(1)}M` : '—',
      marketCap: '',
    };
  } catch {
    console.warn('fetchStockAnalyticsDetails → using dummy stock details');
    const stock = DUMMY_STOCKS.find((s) => s.ticker.toUpperCase() === String(ticker).toUpperCase()) ?? DUMMY_STOCKS[0];
    return {
      customerId,
      stockId: stock.stockId,
      ticker: stock.ticker,
      companyName: stock.companyName,
      currentValue: stock.currentPrice,
      lastPrice: stock.currentPrice,
      prevPrice: stock.previousPrice,
      volume: '—',
      marketCap: '',
    };
  }
};

export const searchMarketByCompanyName = async (companyName) => {
  const query = String(companyName ?? '').trim();
  if (!query) return [];

  try {
    const { data } = await axiosInstance.get('/api/market/search', {
      params: { companyName: query },
    });
    const results = Array.isArray(data?.results) ? data.results : [];
    return results.map(mapMarketResult).filter((item) => item.ticker);
  } catch {
    console.warn('searchMarketByCompanyName → using dummy search data');
    const normalized = query.toUpperCase();
    return DUMMY_MARKET_RESULTS
      .filter((item) =>
        item.symbol.toUpperCase().includes(normalized)
        || item.name.toUpperCase().includes(normalized)
      )
      .map(mapMarketResult);
  }
};
