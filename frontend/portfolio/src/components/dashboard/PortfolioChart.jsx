import { useDispatch, useSelector } from 'react-redux';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { loadChartData, setChartRange, setChartMode } from '../../store/slices/analyticsSlice';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import SectionLoader from '../common/SectionLoader';
import { RiArrowLeftLine, RiRefreshLine } from 'react-icons/ri';

const PORTFOLIO_RANGES = ['WEEKLY', 'MONTHLY', 'YEARLY'];
const STOCK_RANGE_MAP = {
  WEEKLY: '1W',
  MONTHLY: '1M',
  YEARLY: '1Y',
};

const rangeLabel = (range) => {
  if (range === 'WEEKLY') return 'W';
  if (range === 'MONTHLY') return 'M';
  if (range === 'YEARLY') return 'Y';
  return range;
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val  = payload[0]?.value ?? 0;
  const gain = payload[0]?.stroke === 'var(--gain)' || String(payload[0]?.stroke).includes('00c8');
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-soft)',
        minWidth: 140,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--txt-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: 'var(--txt-primary)' }}>
        {formatCurrency(val)}
      </p>
    </div>
  );
}

export default function PortfolioChart() {
  const dispatch = useDispatch();
  const { chartData, chartMode, chartRange, loadingChart } = useSelector((s) => s.analytics);
  const { selectedStock } = useSelector((s) => s.stocks);
  const { selectedUser }  = useSelector((s) => s.user);

  const handleRange = (r) => {
    dispatch(setChartRange(r));
    if (chartMode === 'stock' && selectedStock) {
      const stockRange = STOCK_RANGE_MAP[r] ?? '1Y';
      dispatch(loadChartData({
        mode: 'stock',
        stockId: selectedStock.stockId,
        ticker: selectedStock.ticker,
        range: stockRange,
      }));
    } else {
      dispatch(loadChartData({ mode: 'portfolio', customerId: selectedUser?.customerId, range: r }));
    }
  };

  const handleModeToggle = () => {
    dispatch(setChartMode('portfolio'));
    dispatch(loadChartData({ mode: 'portfolio', customerId: selectedUser?.customerId, range: chartRange }));
  };

  const handleRefresh = () => {
    if (loadingChart) return;
    if (chartMode === 'stock' && selectedStock) {
      const stockRange = STOCK_RANGE_MAP[chartRange] ?? '1Y';
      dispatch(loadChartData({
        mode: 'stock',
        stockId: selectedStock.stockId,
        ticker: selectedStock.ticker,
        range: stockRange,
      }));
      return;
    }

    if (selectedUser?.customerId) {
      dispatch(loadChartData({ mode: 'portfolio', customerId: selectedUser.customerId, range: chartRange }));
    }
  };

  const dataKey  = chartMode === 'stock' ? 'price' : 'value';
  const isEmpty  = !chartData || chartData.length === 0;

  const first      = chartData?.[0]?.[dataKey] ?? 0;
  const last       = chartData?.[chartData.length - 1]?.[dataKey] ?? 0;
  const isGain     = last >= first;
  const lineColor  = isGain ? 'var(--gain)' : 'var(--loss)';
  const gradId     = isGain ? 'gradGain' : 'gradLoss';
  const gradColorH = isGain ? '#00c896' : '#f0455a';

  const sampled = isEmpty
    ? []
    : chartData
        .filter((_, i) => i % Math.ceil(chartData.length / 80) === 0)
        .map((d) => ({ ...d, date: formatShortDate(d.date) }));

  const title = chartMode === 'stock' && selectedStock
    ? `${selectedStock.ticker ?? selectedStock.companyName} · Chart`
    : 'Your overall performance';

  const changeAmt = last - first;
  const changePct = first > 0 ? (changeAmt / first) * 100 : 0;

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 14 }}>
        <div className="flex flex-col gap-1">
          {chartMode === 'stock' && selectedStock && (
            <button
              onClick={handleModeToggle}
              className="flex items-center gap-1 text-[10px] font-semibold mb-0.5 w-fit transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              <RiArrowLeftLine /> Portfolio view
            </button>
          )}
          <p className="text-sm font-semibold" style={{ color: 'var(--txt-primary)' }}>{title}</p>
          {!isEmpty && (
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--txt-primary)' }}>
                {formatCurrency(last)}
              </span>
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{
                  background: isGain ? 'var(--gain-bg)' : 'var(--loss-bg)',
                  border: `1px solid ${isGain ? 'var(--gain-border)' : 'var(--loss-border)'}`,
                  color: isGain ? 'var(--gain)' : 'var(--loss)',
                }}
              >
                {isGain ? '+' : ''}{changePct.toFixed(2)}% ({isGain ? '+' : ''}{formatCurrency(changeAmt)})
              </span>
            </div>
          )}
        </div>

        {/* Range pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loadingChart || (!selectedUser?.customerId && chartMode !== 'stock')}
            className="inline-flex items-center justify-center rounded-md text-[10px] font-semibold disabled:opacity-50"
            style={{
              width: 28,
              height: 28,
              color: 'var(--txt-secondary)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
            }}
            title="Refresh chart"
          >
            <RiRefreshLine className={loadingChart ? 'animate-spin' : ''} />
          </button>

          <div
            className="flex items-center rounded-xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              padding: '0.25rem',
              gap: '0.25rem',
            }}
          >
            {PORTFOLIO_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => handleRange(r)}
                className="rounded-md font-semibold transition-all duration-200"
                style={chartRange === r ? {
                  background: 'var(--accent)',
                  color: '#fff',
                  boxShadow: 'var(--shadow-accent)',
                  minWidth: '32px',
                  height: '28px',
                  padding: '0 0.5rem',
                  fontSize: '11px',
                  lineHeight: 1,
                } : {
                  color: 'var(--txt-secondary)',
                  minWidth: '32px',
                  height: '28px',
                  padding: '0 0.5rem',
                  fontSize: '11px',
                  lineHeight: 1,
                }}
              >
                {rangeLabel(r)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <SectionLoader loading={loadingChart} minHeight={280}>
        {loadingChart && chartMode === 'portfolio' ? (
          <p className="text-[11px] mb-2" style={{ color: 'var(--txt-muted)' }}>
            Loading overall performance data. This endpoint may take up to 30-40 seconds.
          </p>
        ) : null}

        {isEmpty ? (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl"
            style={{ height: 280, background: 'var(--bg-elevated)' }}
          >
            <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>
              Select a user to load chart
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={sampled} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={gradColorH} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={gradColorH} stopOpacity={0.00} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--txt-muted)', fontSize: 10, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                interval={Math.ceil(sampled.length / 7)}
              />
              <YAxis
                tick={{ fill: 'var(--txt-muted)', fontSize: 10, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-soft)', strokeWidth: 1 }} />
              <Area
                type="monotoneX"
                dataKey={dataKey}
                stroke={gradColorH}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: gradColorH,
                  stroke: 'var(--bg-card)',
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </SectionLoader>
    </div>
  );
}
