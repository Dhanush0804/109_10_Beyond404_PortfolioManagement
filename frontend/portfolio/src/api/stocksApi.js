import axiosInstance from './axiosInstance';

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeTicker = (ticker) => String(ticker ?? '').trim().toUpperCase();

const mapStockEntity = (stock) => ({
  stockId: stock?.stockId ?? stock?.id ?? null,
  ticker: normalizeTicker(stock?.ticker ?? stock?.symbol),
  companyName: stock?.companyName ?? stock?.name ?? '',
  exchange: stock?.market ?? stock?.exchange ?? '',
  exchangeDisplay: stock?.exchangeDisplay ?? stock?.exchange_display ?? stock?.market ?? '',
});

export const fetchAllStocks = async () => {
  try {
    const { data } = await axiosInstance.get(`/beyond404/stocks/all?_t=${Date.now()}`);
    if (!Array.isArray(data)) return [];
    return data.map(mapStockEntity).filter((item) => item.ticker);
  } catch {
    console.warn('fetchAllStocks -> returning empty fallback');
    return [];
  }
};

export const searchMarketByCompanyName = async (companyName) => {
  const trimmed = String(companyName ?? '').trim();
  if (!trimmed) return [];

  try {
    const { data } = await axiosInstance.get('/api/market/search', {
      params: { companyName: trimmed },
    });

    const results = Array.isArray(data?.results) ? data.results : [];
    return results.map((item) => ({
      stockId: null,
      ticker: normalizeTicker(item?.symbol),
      companyName: item?.name ?? '',
      exchange: item?.exchange ?? '',
      exchangeDisplay: item?.exchangeDisplay ?? item?.exchange_display ?? item?.exchange ?? '',
      type: item?.type ?? '',
    })).filter((item) => item.ticker);
  } catch {
    console.warn('searchMarketByCompanyName -> returning empty fallback');
    return [];
  }
};

const fetchStockWiseEntry = async (customerId, ticker) => {
  if (!customerId || !ticker) return null;

  try {
    const { data } = await axiosInstance.get('/api/portfolio-analytics/stock-wise', {
      params: { customerId },
    });

    if (!Array.isArray(data)) return null;

    const normalizedTicker = normalizeTicker(ticker);
    const stock = data.find((item) => normalizeTicker(item?.ticker) === normalizedTicker);
    if (!stock) return null;

    return {
      stockId: stock?.stockId ?? null,
      ticker: normalizeTicker(stock?.ticker),
      companyName: stock?.companyName ?? '',
      invested: toNumber(stock?.invested),
      currentValue: toNumber(stock?.currentValue),
      pnl: toNumber(stock?.pnl),
      pnlPercent: toNumber(stock?.pnlPercent),
      lastPrice: toNumber(stock?.lastPrice),
      prevPrice: toNumber(stock?.prevPrice),
      volume: toNumber(stock?.volume, null),
      marketCap: stock?.marketCap ?? null,
    };
  } catch {
    return null;
  }
};

const fetchQuote = async (ticker) => {
  const normalizedTicker = normalizeTicker(ticker);
  if (!normalizedTicker) return null;

  try {
    const { data } = await axiosInstance.get(`/api/market/${encodeURIComponent(normalizedTicker)}/quote`);

    return {
      ticker: normalizedTicker,
      lastPrice: toNumber(data?.price),
      prevPrice: toNumber(data?.previousClose ?? data?.previous_close),
      change: toNumber(data?.change),
      changePercent: toNumber(data?.percentChange ?? data?.percent_change),
      open: toNumber(data?.open),
      high: toNumber(data?.high),
      low: toNumber(data?.low),
      volume: toNumber(data?.volume, null),
      currency: data?.currency ?? 'USD',
      timestamp: data?.timestamp ?? null,
    };
  } catch {
    return null;
  }
};

export const fetchStockAnalyticsDetails = async ({ ticker, customerId, source = 'owned' } = {}) => {
  const normalizedTicker = normalizeTicker(ticker);
  if (!normalizedTicker) return {};

  const [stockWise, quote] = await Promise.all([
    source === 'owned' ? fetchStockWiseEntry(customerId, normalizedTicker) : Promise.resolve(null),
    fetchQuote(normalizedTicker),
  ]);

  return {
    stockId: stockWise?.stockId ?? null,
    ticker: normalizedTicker,
    companyName: stockWise?.companyName ?? normalizedTicker,
    invested: toNumber(stockWise?.invested),
    currentValue: toNumber(stockWise?.currentValue),
    pnl: toNumber(stockWise?.pnl),
    pnlPercent: toNumber(stockWise?.pnlPercent),
    lastPrice: toNumber(quote?.lastPrice ?? stockWise?.lastPrice),
    prevPrice: toNumber(quote?.prevPrice ?? stockWise?.prevPrice),
    change: toNumber(quote?.change),
    changePercent: toNumber(quote?.changePercent),
    open: toNumber(quote?.open),
    high: toNumber(quote?.high),
    low: toNumber(quote?.low),
    volume: quote?.volume ?? stockWise?.volume ?? null,
    marketCap: stockWise?.marketCap ?? null,
    currency: quote?.currency ?? 'USD',
    timestamp: quote?.timestamp ?? null,
  };
};
