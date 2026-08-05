import { useState } from 'react';
import { RiLoaderLine, RiSearchLine } from 'react-icons/ri';
import { searchMarketByCompanyName } from '../../api/stocksApi';

export default function MarketStockSearchPanel({ onSelectStock, disabled = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = async (value) => {
    setQuery(value);
    const searchValue = value.trim();

    if (!searchValue) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await searchMarketByCompanyName(searchValue);
      setResults(response);
    } finally {
      setLoading(false);
    }
  };

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
            onChange={(event) => { handleInputChange(event.target.value); }}
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
                  onClick={() => onSelectStock(result)}
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