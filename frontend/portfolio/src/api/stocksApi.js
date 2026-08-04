import axiosInstance from './axiosInstance';

const DUMMY_STOCKS = [
  { stockId: 1, companyName: 'Apple Inc.',      ticker: 'AAPL', sector: 'Technology',   currentPrice: 189.50, previousPrice: 182.30 },
  { stockId: 2, companyName: 'Tesla Inc.',       ticker: 'TSLA', sector: 'Automotive',   currentPrice: 248.20, previousPrice: 259.80 },
  { stockId: 3, companyName: 'Microsoft Corp.',  ticker: 'MSFT', sector: 'Technology',   currentPrice: 415.60, previousPrice: 398.10 },
  { stockId: 4, companyName: 'Google LLC',       ticker: 'GOOG', sector: 'Technology',   currentPrice: 178.90, previousPrice: 171.40 },
  { stockId: 5, companyName: 'NVIDIA Corp.',     ticker: 'NVDA', sector: 'Semiconductors', currentPrice: 875.30, previousPrice: 820.00 },
  { stockId: 6, companyName: 'Amazon.com Inc.',  ticker: 'AMZN', sector: 'E-Commerce',   currentPrice: 198.40, previousPrice: 205.60 },
];

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
