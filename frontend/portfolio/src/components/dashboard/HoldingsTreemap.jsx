import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import SectionLoader from '../common/SectionLoader';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { RiRefreshLine } from 'react-icons/ri';
import { loadStockWisePnL } from '../../store/slices/analyticsSlice';
import { loadAssetHoldings } from '../../store/slices/assetHoldingsSlice';

const CURRENCY = 'USD';

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const derivePerformance = (stock) => {
  const pnlPercent = toNumber(stock?.pnlPercent);
  if (pnlPercent !== 0) return pnlPercent;

  const pnl = toNumber(stock?.pnl);
  if (pnl !== 0) return pnl;

  const lastPrice = toNumber(stock?.lastPrice ?? stock?.currentPrice);
  const prevPrice = toNumber(stock?.prevPrice ?? stock?.previousPrice);
  if (prevPrice > 0) {
    return ((lastPrice - prevPrice) / prevPrice) * 100;
  }

  return 0;
};

const tileColor = (performance) => {
  const abs = Math.abs(toNumber(performance));
  const intensity = clamp(abs / 35, 0.15, 0.9);

  if (toNumber(performance) >= 0) {
    return `rgba(0, 212, 138, ${0.28 + intensity * 0.45})`;
  }

  return `rgba(255, 71, 94, ${0.28 + intensity * 0.45})`;
};

function HoldingsTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-soft)',
        minWidth: 190,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--txt-muted)' }}>
        {row.ticker}
      </p>
      <p className="text-xs font-bold mt-1" style={{ color: 'var(--txt-primary)' }}>{row.name}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
        Shares: {row.quantity.toLocaleString('en-US', { maximumFractionDigits: 4 })}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--txt-secondary)' }}>
        Price: {formatCurrency(row.unitPrice, 2, CURRENCY)}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--txt-secondary)' }}>
        Holding: {formatCurrency(row.value, 2, CURRENCY)}
      </p>
      <p className="text-xs mt-0.5" style={{ color: toNumber(row.pnlPercent) >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
        P&L %: {formatPercent(row.pnlPercent)}
      </p>
    </div>
  );
}

function TreemapTile(props) {
  const {
    x,
    y,
    width,
    height,
    name,
    payload,
  } = props;

  const showPrimary = width > 84 && height > 46;
  const showSecondary = width > 130 && height > 70;
  const row = payload?.payload ?? payload ?? {};
  const pnlPercent = toNumber(row?.pnlPercent ?? 0);
  const pnlColor = pnlPercent > 0 ? '#00d48a' : pnlPercent < 0 ? '#ff475e' : '#cbd5e1';
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill: row?.fill || 'rgba(0, 212, 138, 0.32)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
      />
      {showPrimary ? (
        <text
          x={centerX}
          y={showSecondary ? centerY - 10 : centerY + 1}
          fill="#f3f4f6"
          fontSize={11}
          fontWeight={800}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {name}
        </text>
      ) : null}
      {showSecondary ? (
        <text
          x={centerX}
          y={centerY + 10}
          fill={pnlColor}
          fontSize={10}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {formatPercent(row?.pnlPercent ?? 0)}
        </text>
      ) : null}
    </g>
  );
}

export default function HoldingsTreemap() {
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

    const mapped = holdings
      .map((holding) => {
        const stock = stockById.get(Number(holding.stockId));
        if (!stock) return null;

        const quantity = toNumber(holding.quantity);
        if (quantity <= 0) return null;

        const directPrice = toNumber(stock.lastPrice ?? stock.currentPrice ?? stock.prevPrice);
        const fallbackPrice = quantity > 0 ? toNumber(stock.currentValue) / quantity : 0;
        const unitPrice = directPrice > 0 ? directPrice : fallbackPrice;
        const value = quantity * unitPrice;
        const performance = derivePerformance(stock);

        return {
          name: stock.companyName ?? `Stock #${holding.stockId}`,
          ticker: stock.ticker ?? `#${holding.stockId}`,
          quantity,
          unitPrice,
          value,
          pnlPercent: performance,
          fill: tileColor(performance),
        };
      })
      .filter(Boolean)
      .filter((row) => row.value > 0)
      .sort((left, right) => right.value - left.value);

    return mapped;
  }, [holdings, stockWise]);

  const totalValue = useMemo(() => data.reduce((sum, row) => sum + row.value, 0), [data]);

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
          <p className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Holdings Heatmap</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--txt-secondary)' }}>
            Rectangle size = shares held × current stock price
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
            title="Refresh holdings heatmap"
          >
            <RiRefreshLine className={loadingStockWise || loadingHoldings ? 'animate-spin' : ''} />
          </button>
          <span
            className="inline-flex items-center justify-center rounded-full text-[11px] font-semibold"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--txt-secondary)',
              minWidth: 152,
              height: 28,
              padding: '0 10px',
            }}
          >
            Total Value: {formatCurrency(totalValue, 2, CURRENCY)}
          </span>
        </div>
      </div>

      <SectionLoader loading={loadingStockWise || loadingHoldings} minHeight={300}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl" style={{ minHeight: 300, background: 'var(--bg-elevated)' }}>
            <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>No holdings available for selected user</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <Treemap
                data={data}
                dataKey="value"
                nameKey="ticker"
                isAnimationActive
                content={<TreemapTile />}
                stroke="rgba(255,255,255,0.08)"
              >
                <Tooltip content={<HoldingsTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}
      </SectionLoader>
    </div>
  );
}
