import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { setSelectedStock } from '../../store/slices/stocksSlice';
import { loadChartData, setChartMode } from '../../store/slices/analyticsSlice';
import SectionLoader from '../common/SectionLoader';
import { Sparklines, SparklinesLine } from 'react-sparklines';

const FILTERS = ['All', 'Gainers', 'Losers'];

function getSparkData(stock, count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const base = stock.lastPrice ?? stock.currentValue ?? 100;
    const gain = (stock.pnl ?? 0) >= 0;
    return base * (0.97 + Math.sin(i * 1.3 + (stock.stockId ?? 0)) * 0.025 + (gain ? 0.004 * i : -0.004 * i));
  });
}

export default function PortfolioOverviewTable() {
  const dispatch = useDispatch();
  const STOCKWISE_CURRENCY = 'INR';
  const { stockWise, loadingStockWise, chartRange } = useSelector((s) => s.analytics);
  const { selectedStock } = useSelector((s) => s.stocks);
  const [filter, setFilter] = useState('All');

  const filtered = stockWise.filter((s) => {
    if (filter === 'Gainers') return (s.pnl ?? 0) >= 0;
    if (filter === 'Losers')  return (s.pnl ?? 0) < 0;
    return true;
  });

  const handleRowClick = (stock) => {
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 20 }}>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--txt-primary)' }}>Portfolio Overview</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--txt-secondary)' }}>
            Click any row to view stock chart
          </p>
        </div>
        <div
          className="flex items-center gap-0.5 p-1 rounded-xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={filter === f ? {
                background: f === 'Gainers' ? 'var(--gain)' : f === 'Losers' ? 'var(--loss)' : 'var(--accent)',
                color: '#fff',
              } : {
                color: 'var(--txt-secondary)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <SectionLoader loading={loadingStockWise} minHeight={200}>
        {filtered.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-xl py-12"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>
              {stockWise.length === 0 ? 'Select a user to view overview' : 'No stocks match this filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Stock', 'Last Price', 'Change', 'P&L', 'Volume', '7D Trend'].map((h) => (
                    <th key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((stock, idx) => {
                  const gain       = (stock.pnl ?? 0) >= 0;
                  const isSelected = selectedStock?.stockId === stock.stockId;
                  const ticker     = stock.ticker ?? stock.companyName?.slice(0, 4)?.toUpperCase() ?? '—';
                  const sparkData  = getSparkData(stock);

                  return (
                    <tr
                      key={stock.stockId}
                      onClick={() => handleRowClick(stock)}
                      className="cursor-pointer transition-all duration-150"
                      style={{
                        background: isSelected ? 'var(--accent-glow)' : 'transparent',
                      }}
                    >
                      {/* Stock */}
                      <td className="py-3 pr-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                              border: `1px solid ${isSelected ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                            }}
                          >
                            <span
                              className="text-[9px] font-black"
                              style={{ color: isSelected ? '#fff' : 'var(--accent)' }}
                            >
                              {ticker.slice(0, 3)}
                            </span>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold leading-none" style={{ color: 'var(--txt-primary)' }}>
                              {ticker}
                            </p>
                            <p
                              className="text-[9px] mt-0.5 truncate max-w-[120px]"
                              style={{ color: 'var(--txt-secondary)' }}
                            >
                              {stock.companyName ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Last price */}
                      <td
                        className="py-3 pr-4 text-[12px] font-semibold"
                        style={{ color: 'var(--txt-primary)', borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        {formatCurrency(stock.lastPrice ?? stock.currentValue ?? 0, 2, STOCKWISE_CURRENCY)}
                      </td>

                      {/* Change % */}
                      <td className="py-3 pr-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: gain ? 'var(--gain-bg)' : 'var(--loss-bg)',
                            border: `1px solid ${gain ? 'var(--gain-border)' : 'var(--loss-border)'}`,
                            color: gain ? 'var(--gain)' : 'var(--loss)',
                          }}
                        >
                          {gain ? <RiArrowUpLine className="text-[9px]" /> : <RiArrowDownLine className="text-[9px]" />}
                          {formatPercent(stock.pnlPercent)}
                        </span>
                      </td>

                      {/* P&L */}
                      <td
                        className="py-3 pr-4 text-[12px] font-semibold"
                        style={{ color: gain ? 'var(--gain)' : 'var(--loss)', borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        {gain ? '+' : ''}{formatCurrency(stock.pnl, 2, STOCKWISE_CURRENCY)}
                      </td>

                      {/* Volume */}
                      <td
                        className="py-3 pr-4 text-[12px]"
                        style={{ color: 'var(--txt-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        {stock.volume ?? '—'}
                      </td>

                      {/* Sparkline */}
                      <td className="py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <div className="w-20 h-7">
                          <Sparklines data={sparkData} min={0}>
                            <SparklinesLine
                              color={gain ? '#00c896' : '#f0455a'}
                              style={{ fill: 'none', strokeWidth: 1.5 }}
                            />
                          </Sparklines>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionLoader>
    </div>
  );
}
