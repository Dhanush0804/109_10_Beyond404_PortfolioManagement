import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { RiRefreshLine } from 'react-icons/ri';
import { loadStockWisePnL } from '../../store/slices/analyticsSlice';
import { loadAssetHoldings } from '../../store/slices/assetHoldingsSlice';
import SectionLoader from '../common/SectionLoader';

const PIE_COLORS = ['#1a6ef7', '#00c896', '#f59e0b', '#f0455a', '#38bdf8', '#a78bfa', '#14b8a6', '#fb7185'];

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-soft)',
        minWidth: 170,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--txt-muted)' }}>
        {item.ticker}
      </p>
      <p className="text-xs font-bold mt-1" style={{ color: 'var(--txt-primary)' }}>{item.name}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>Shares: {item.value.toLocaleString('en-US', { maximumFractionDigits: 4 })}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--txt-secondary)' }}>Weight: {item.percent.toFixed(2)}%</p>
    </div>
  );
}

export default function HoldingsPieChart() {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((s) => s.user);
  const { stockWise, loadingStockWise } = useSelector((s) => s.analytics);
  const { items: holdings, loading: loadingHoldings } = useSelector((s) => s.assetHoldings);

  const handleRefresh = () => {
    if (!selectedUser?.customerId || loadingStockWise || loadingHoldings) return;
    dispatch(loadStockWisePnL(selectedUser.customerId));
    dispatch(loadAssetHoldings(selectedUser.customerId));
  };

  const data = useMemo(() => {
    const stockById = new Map(stockWise.map((stock) => [Number(stock.stockId), stock]));

    return holdings
      .map((holding) => {
        const stock = stockById.get(Number(holding.stockId));
        return {
          name: stock?.companyName ?? `Stock #${holding.stockId}`,
          ticker: stock?.ticker ?? `#${holding.stockId}`,
          value: Number(holding.quantity ?? 0),
        };
      })
      .filter((row) => row.value > 0);
  }, [holdings, stockWise]);

  const totalShares = useMemo(() => data.reduce((sum, row) => sum + row.value, 0), [data]);

  const enriched = useMemo(() => {
    if (!totalShares) return [];
    return data.map((row) => ({
      ...row,
      percent: (row.value / totalShares) * 100,
    }));
  }, [data, totalShares]);

  return (
    <div
      className="rounded-2xl"
      style={{
        padding: '16px 18px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap" style={{ marginBottom: 10 }}>
        <div>
          <p className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Holdings Distribution</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--txt-secondary)' }}>
            Share quantity split across currently held stocks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={!selectedUser?.customerId || loadingStockWise || loadingHoldings}
            className="inline-flex items-center justify-center rounded-md text-[10px] font-semibold disabled:opacity-50"
            style={{
              width: 28,
              height: 28,
              color: 'var(--txt-secondary)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
            }}
            title="Refresh holdings distribution"
          >
            <RiRefreshLine className={loadingStockWise || loadingHoldings ? 'animate-spin' : ''} />
          </button>
          <span
            className="inline-flex items-center justify-center rounded-full text-[11px] font-semibold"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--txt-secondary)',
              minWidth: 108,
              height: 28,
              padding: '0 10px',
            }}
          >
            Total Shares: {totalShares.toLocaleString('en-US', { maximumFractionDigits: 4 })}
          </span>
        </div>
      </div>

      <SectionLoader loading={loadingStockWise || loadingHoldings} minHeight={280}>
        {enriched.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl" style={{ minHeight: 280, background: 'var(--bg-elevated)' }}>
            <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>No holdings available for selected user</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_1fr] gap-4 items-center">
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={enriched}
                    dataKey="value"
                    nameKey="ticker"
                    innerRadius={56}
                    outerRadius={96}
                    stroke="var(--bg-card)"
                    strokeWidth={2}
                    paddingAngle={2}
                    isAnimationActive
                  >
                    {enriched.map((entry, idx) => (
                      <Cell key={`${entry.ticker}-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {enriched.map((row, idx) => (
                <div
                  key={`${row.ticker}-${idx}`}
                  className="rounded-xl"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    padding: '10px 12px',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold" style={{ color: 'var(--txt-primary)' }}>{row.ticker}</p>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                  </div>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--txt-secondary)' }}>{row.name}</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--txt-primary)' }}>
                    Shares: <span className="font-bold">{row.value.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionLoader>
    </div>
  );
}
