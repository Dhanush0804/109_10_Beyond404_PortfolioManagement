import { useEffect, useRef, useState } from 'react';
import { RiLoaderLine, RiSearchLine } from 'react-icons/ri';
import { searchMarketByCompanyName } from '../../api/stocksApi';

const SUPPORTED_EXCHANGES = new Set(['NASDAQ', 'NYSE', 'NSE', 'BSE', 'EURONEXT']);
const SEARCH_DEBOUNCE_MS = 900;

const normalizeTicker = (ticker) => String(ticker ?? '').trim().toUpperCase();
const normalizeExchange = (exchange) => String(exchange ?? '').trim().toUpperCase();

const isStockType = (type) => {
  const normalized = String(type ?? '').trim().toLowerCase();
  if (!normalized) return true;
  return normalized.includes('equity') || normalized.includes('stock');
};

const isSupportedMarketResult = (item) => {
  const exchange = normalizeExchange(item?.exchange);
  const exchangeDisplay = normalizeExchange(item?.exchangeDisplay);
  return SUPPORTED_EXCHANGES.has(exchange) || SUPPORTED_EXCHANGES.has(exchangeDisplay);
};

const scoreResult = (item, queryUpper) => {
  const ticker = normalizeTicker(item?.ticker);
  const company = String(item?.companyName ?? '').toUpperCase();
  let score = 0;

  if (ticker === queryUpper) score += 120;
  if (ticker.startsWith(queryUpper)) score += 40;
  if (company.startsWith(queryUpper)) score += 24;
  if (company.includes(queryUpper)) score += 14;
  if (isSupportedMarketResult(item)) score += 12;
  if (isStockType(item?.type)) score += 10;

  return score;
};

const sanitizeResults = (items, query) => {
  const queryUpper = String(query ?? '').trim().toUpperCase();
  const candidates = Array.isArray(items) ? items : [];
  const byTicker = new Map();

  candidates.forEach((item) => {
    const ticker = normalizeTicker(item?.ticker);
    if (!ticker) return;

    if (!isStockType(item?.type)) return;
    if (!isSupportedMarketResult(item)) return;

    const current = {
      ...item,
      ticker,
      exchange: normalizeExchange(item?.exchange),
      exchangeDisplay: item?.exchangeDisplay ?? item?.exchange ?? '',
      _score: scoreResult(item, queryUpper),
    };

    const existing = byTicker.get(ticker);
    if (!existing || current._score > existing._score) {
      byTicker.set(ticker, current);
    }
  });

  return Array.from(byTicker.values())
    .sort((left, right) => right._score - left._score)
    .slice(0, 8)
    .map(({ _score, ...item }) => item);
};

export default function MarketStockSearchPanel({ onSelectStock, disabled = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const searchValue = query.trim();
    if (!searchValue || disabled) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchMarketByCompanyName(searchValue);
        if (requestIdRef.current !== currentRequestId) return;
        setResults(sanitizeResults(response, searchValue));
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, disabled]);

  return (
    <div
      className="rounded-2xl"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
    >
      <div style={{ padding: '1.25rem 1.25rem 1.1rem' }}>
        <p className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--txt-muted)' }}>
        Search New Stock
        </p>

        <div className="relative">
          <RiSearchLine
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[17px]"
            style={{ color: 'var(--txt-muted)' }}
          />
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); }}
            placeholder="Search by company name…"
            className="input w-full rounded-xl text-sm"
            style={{
              minHeight: '46px',
              paddingLeft: '2.8rem',
              paddingRight: '1rem',
              fontWeight: 600,
              lineHeight: '1.35',
            }}
            disabled={disabled}
          />
        </div>
      </div>

      {query.trim() ? (
        <div
          className="mx-5 mb-5 mt-1 rounded-xl p-3 max-h-48 overflow-y-auto"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          {loading ? (
            <p className="text-xs px-2 py-2 flex items-center gap-1.5" style={{ color: 'var(--txt-muted)' }}>
              <RiLoaderLine className="animate-spin" /> Searching...
            </p>
          ) : results.length === 0 ? (
            <p className="text-xs px-2 py-2" style={{ color: 'var(--txt-muted)' }}>
              No stock found.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((result) => (
                <button
                  key={`${result.ticker}-${result.exchange}`}
                  type="button"
                  onClick={() => {
                    onSelectStock(result);
                    setQuery('');
                    setResults([]);
                  }}
                  className="w-full text-left rounded-xl px-3 py-2"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  disabled={disabled}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{result.ticker}</span>
                    <span className="text-[10px]" style={{ color: 'var(--txt-muted)' }}>{result.exchangeDisplay || result.exchange}</span>
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--txt-primary)' }}>{result.companyName}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}