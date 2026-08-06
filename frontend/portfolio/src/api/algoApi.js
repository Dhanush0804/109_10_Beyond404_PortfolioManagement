import axiosInstance from './axiosInstance';

const normalizeTicker = (ticker) => String(ticker ?? '').trim().toUpperCase();

export const runAlgoOnce = async ({ customerId, tickers = [], strategyName = 'momentumSMA', dryRun = true } = {}) => {
  const uniqueTickers = Array.from(
    new Set((Array.isArray(tickers) ? tickers : []).map(normalizeTicker).filter(Boolean))
  );

  const payload = {
    customerId,
    tickers: uniqueTickers,
    strategyName,
    dryRun,
  };

  const { data } = await axiosInstance.post('/api/algo/run-once', payload);
  return data;
};
