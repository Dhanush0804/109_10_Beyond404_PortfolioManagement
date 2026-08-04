/** formatters.js – number / date helpers */

export const formatCurrency = (val, decimals = 2) => {
  if (val === null || val === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
};

export const formatPercent = (val, decimals = 2) => {
  if (val === null || val === undefined) return '—';
  const sign = val >= 0 ? '+' : '';
  return `${sign}${Number(val).toFixed(decimals)}%`;
};

export const formatLargeNumber = (val) => {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000)     return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)         return `$${(val / 1_000).toFixed(1)}K`;
  return formatCurrency(val);
};

export const formatDate = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatShortDate = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const isGain = (currentPrice, previousPrice) =>
  currentPrice >= previousPrice;
