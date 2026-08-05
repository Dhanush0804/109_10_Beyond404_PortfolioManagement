import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RiArrowUpLine, RiArrowDownLine, RiArrowRightSLine } from 'react-icons/ri';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { setSelectedStock } from '../../store/slices/stocksSlice';
import { loadChartData, setChartMode } from '../../store/slices/analyticsSlice';
import SectionLoader from '../common/SectionLoader';

function StockChip({ stock, isActive, onClick }) {
  const STOCKWISE_CURRENCY = 'INR';
  const current  = stock.currentPrice ?? stock.lastPrice ?? 0;
  const previous = stock.previousPrice ?? stock.prevPrice ?? 0;
  const gain     = current >= previous;
  const diff     = current - previous;
  const pct      = previous > 0 ? (diff / previous) * 100 : 0;
  const ticker   = stock.ticker ?? stock.companyName?.split(' ')[0]?.slice(0, 4)?.toUpperCase() ?? '—';

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col gap-2 p-4 rounded-xl text-left transition-all duration-200 min-w-[155px]"
      style={{
        background: isActive ? 'var(--accent-glow)' : 'var(--bg-elevated)',
        border: `1px solid ${isActive ? 'var(--border-active)' : 'var(--border-subtle)'}`,
        boxShadow: isActive ? 'var(--shadow-accent)' : 'none',
      }}
    >
      {/* Ticker */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md"
          style={{
            background: isActive ? 'var(--accent)' : 'var(--bg-card)',
            color: isActive ? '#fff' : 'var(--accent)',
            border: isActive ? 'none' : '1px solid var(--border-subtle)',
          }}
        >
          {ticker}
        </span>
        <span
          className="text-[10px] font-bold flex items-center gap-0.5"
          style={{ color: gain ? 'var(--gain)' : 'var(--loss)' }}
        >
          {gain ? <RiArrowUpLine /> : <RiArrowDownLine />}
          {formatPercent(pct)}
        </span>
      </div>

      {/* Price */}
      <p className="text-sm font-extrabold tracking-tight mt-0.5" style={{ color: 'var(--txt-primary)' }}>
        {formatCurrency(current, 2, STOCKWISE_CURRENCY)}
      </p>

      {/* Company name */}
      <p className="text-[10px] font-medium truncate max-w-[125px]" style={{ color: 'var(--txt-secondary)' }}>
        {stock.companyName ?? '—'}
      </p>
    </button>
  );
}

export default function MyPortfolioCards() {
  const dispatch                            = useDispatch();
  const { stockWise, loadingStockWise, chartRange } = useSelector((s) => s.analytics);
  const { selectedStock }                   = useSelector((s) => s.stocks);
  const [showAll, setShowAll]               = useState(false);

  const visible = showAll ? stockWise : stockWise.slice(0, 6);

  const handleStockClick = (stock) => {
    dispatch(setSelectedStock(stock));
    dispatch(setChartMode('stock'));
    dispatch(loadChartData({ mode: 'stock', stockId: stock.stockId, ticker: stock.ticker, range: chartRange }));
  };

  return (
    <div
      className="rounded-2xl"
      style={{
        padding: '20px 24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--txt-primary)' }}>My Portfolio</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--txt-secondary)' }}>
            Click a stock to view its chart
          </p>
        </div>
        {stockWise.length > 6 && (
          <button
            onClick={() => setShowAll((p) => !p)}
            className="flex items-center gap-0.5 text-[10px] font-semibold transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            {showAll ? 'Show less' : `See all (${stockWise.length})`}
            <RiArrowRightSLine className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <SectionLoader loading={loadingStockWise} minHeight={100}>
        {stockWise.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>Select a user to view portfolio</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto" style={{ paddingBottom: 4, scrollbarWidth: 'thin' }}>
            {visible.map((stock) => (
              <StockChip
                key={stock.stockId}
                stock={stock}
                isActive={selectedStock?.stockId === stock.stockId}
                onClick={() => handleStockClick(stock)}
              />
            ))}
          </div>
        )}
      </SectionLoader>
    </div>
  );
}
