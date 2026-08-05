import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  RiAlertLine,
  RiCloseLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiBarChartLine,
  RiExchangeFundsLine,
  RiLineChartLine,
  RiLoaderLine,
  RiMoneyDollarCircleLine,
  RiShieldCheckLine,
} from 'react-icons/ri';
import SectionLoader from '../components/common/SectionLoader';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { loadStockWisePnL } from '../store/slices/analyticsSlice';
import { loadInvestments, placeDummyBuyOrder, placeDummySellOrder } from '../store/slices/investmentSlice';
import { fetchStockAnalyticsDetails } from '../api/stocksApi';
import MarketStockSearchPanel from '../components/portfolio/MarketStockSearchPanel';

const INR = 'INR';

const RISK_STYLES = {
  HIGH: { color: 'var(--loss)', bg: 'var(--loss-bg)', border: 'var(--loss-border)' },
  MEDIUM: { color: 'var(--warn)', bg: 'var(--warn-bg)', border: 'rgba(245,158,11,0.25)' },
  LOW: { color: 'var(--gain)', bg: 'var(--gain-bg)', border: 'var(--gain-border)' },
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function PortfolioPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.user);
  const { stockWise, loadingStockWise } = useSelector((state) => state.analytics);
  const { items: investments, loading: loadingInvestments } = useSelector((state) => state.investments);

  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSource, setSelectedSource] = useState('owned');
  const [loadingSelectedDetails, setLoadingSelectedDetails] = useState(false);
  const [placingOrderType, setPlacingOrderType] = useState(null);
  const [orderConfirmDialog, setOrderConfirmDialog] = useState({ open: false, type: null });
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (!selectedUser?.customerId) return;
    dispatch(loadStockWisePnL(selectedUser.customerId));
    dispatch(loadInvestments(selectedUser.customerId));
    setSelectedStock(null);
    setSelectedSource('owned');
  }, [dispatch, selectedUser?.customerId]);

  const loadStockDetails = async (baseStock, source = 'owned') => {
    if (!baseStock?.ticker || !selectedUser?.customerId) return;

    setLoadingSelectedDetails(true);
    setActionMessage(null);
    setSelectedSource(source);

    try {
      const details = await fetchStockAnalyticsDetails({
        ticker: baseStock.ticker,
        customerId: selectedUser.customerId,
        source,
      });

      const merged = {
        ...baseStock,
        ...details,
        ticker: details?.ticker ?? baseStock.ticker,
        companyName: details?.companyName ?? baseStock.companyName,
        stockId: details?.stockId ?? baseStock.stockId ?? null,
        invested: toNumber(baseStock.invested),
        pnl: toNumber(baseStock.pnl),
        pnlPercent: toNumber(baseStock.pnlPercent),
        currentValue: toNumber(details?.currentValue ?? baseStock.currentValue),
        lastPrice: toNumber(details?.lastPrice ?? baseStock.lastPrice),
        prevPrice: toNumber(details?.prevPrice ?? baseStock.prevPrice),
      };

      setSelectedStock(merged);
    } finally {
      setLoadingSelectedDetails(false);
    }
  };

  useEffect(() => {
    if (!stockWise.length || selectedStock) return;
    loadStockDetails(stockWise[0], 'owned');
  }, [stockWise, selectedStock]);

  const selectedStockTransactions = useMemo(() => {
    if (!selectedStock?.stockId) return [];
    return investments.filter((item) => Number(item.stockId) === Number(selectedStock.stockId));
  }, [investments, selectedStock?.stockId]);

  const positionSummary = useMemo(() => {
    const buys = selectedStockTransactions.filter((item) => item.transactionType === 'BUY');
    const sells = selectedStockTransactions.filter((item) => item.transactionType === 'SELL');

    const buyAmount = buys.reduce((sum, item) => sum + toNumber(item.transactionAmount), 0);
    const sellAmount = sells.reduce((sum, item) => sum + toNumber(item.transactionAmount), 0);

    return {
      transactionCount: selectedStockTransactions.length,
      buyCount: buys.length,
      sellCount: sells.length,
      buyAmount,
      sellAmount,
      netInvested: buyAmount - sellAmount,
    };
  }, [selectedStockTransactions]);

  if (!selectedUser?.customerId) {
    return (
      <div className="min-h-[calc(100vh-var(--topbar-height))] flex items-center justify-center p-6 anim-fade-in">
        <div
          className="w-full max-w-md rounded-3xl p-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ color: 'var(--warn)', background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <RiAlertLine />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>
                Select user required
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--txt-secondary)' }}>
                Please select a user first to open the Portfolio page.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const riskStyle = RISK_STYLES[String(selectedUser?.riskLevel ?? 'MEDIUM').toUpperCase()] ?? RISK_STYLES.MEDIUM;

  const handleSelectOwnedStock = (stock) => {
    loadStockDetails(stock, 'owned');
  };

  const handleSelectMarketStock = (stock) => {
    loadStockDetails(stock, 'market');
  };

  const openOrderConfirmDialog = (type) => {
    if (!selectedStock || placingOrderType) return;
    setOrderConfirmDialog({ open: true, type });
  };

  const closeOrderConfirmDialog = () => {
    if (placingOrderType) return;
    setOrderConfirmDialog({ open: false, type: null });
  };

  const handleOrder = async () => {
    const type = orderConfirmDialog.type;
    if (!selectedUser?.customerId || !selectedStock?.stockId || placingOrderType) return;

    setPlacingOrderType(type);
    setActionMessage(null);

    const payload = {
      customerId: selectedUser.customerId,
      stockId: selectedStock.stockId,
      ticker: selectedStock.ticker,
      transactionType: type,
      quantity: 1,
    };

    try {
      if (type === 'BUY') {
        await placeDummyBuyOrder(payload);
      } else {
        await placeDummySellOrder(payload);
      }

      setActionMessage({
        type: 'success',
        text: `${type} order queued for ${selectedStock.ticker}.`,
      });
      closeOrderConfirmDialog();
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error?.message ?? `Unable to place ${type} order.`,
      });
    } finally {
      setPlacingOrderType(null);
    }
  };

  return (
    <div className="p-6 max-w-[1500px] mx-auto flex flex-col gap-6 anim-fade-in">
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-7"
        style={{
          background: 'linear-gradient(135deg, rgba(26,110,247,0.18) 0%, rgba(10,13,20,0.96) 56%, rgba(0,212,138,0.1) 100%)',
          border: '1px solid var(--border-soft)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <div
          className="absolute inset-y-0 right-0 w-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, rgba(26,110,247,0.24), transparent 70%)' }}
        />

        <div className="relative flex items-start justify-between gap-5 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] font-bold" style={{ color: 'var(--accent-light)' }}>
              Main Menu / Portfolio
            </p>
            <h1 className="text-2xl font-bold mt-2" style={{ color: 'var(--txt-primary)' }}>
              Portfolio positions
            </h1>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--txt-secondary)' }}>
              Review all stocks owned by the selected user and inspect position details before placing actions.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: 'rgba(10,13,20,0.72)', border: '1px solid var(--border-soft)' }}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--txt-muted)' }}>
                Stocks owned
              </p>
              <p className="text-3xl font-extrabold mt-2" style={{ color: 'var(--txt-primary)' }}>
                {stockWise.length}
              </p>
            </div>

            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: 'rgba(10,13,20,0.72)', border: '1px solid var(--border-soft)' }}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--txt-muted)' }}>
                User risk
              </p>
              <span
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: riskStyle.bg, border: `1px solid ${riskStyle.border}`, color: riskStyle.color }}
              >
                <RiShieldCheckLine />
                {selectedUser?.riskLevel ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <MarketStockSearchPanel
            onSelectStock={handleSelectMarketStock}
            disabled={!selectedUser || loadingSelectedDetails || placingOrderType !== null}
          />

          <section
            className="rounded-3xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Owned stocks</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
                  Select one stock to view user-specific details.
                </p>
              </div>
              {(loadingStockWise || loadingInvestments || loadingSelectedDetails) ? (
                <RiLoaderLine className="animate-spin text-lg" style={{ color: 'var(--accent)' }} />
              ) : null}
            </div>

            <SectionLoader loading={loadingStockWise} minHeight={220}>
              {!selectedUser ? (
                <div
                  className="rounded-2xl px-4 py-10 text-center"
                  style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>Select a user from dashboard to load stocks.</p>
                </div>
              ) : stockWise.length === 0 ? (
                <div
                  className="rounded-2xl px-4 py-10 text-center"
                  style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>No owned stocks found (count: 0).</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
                  {stockWise.map((stock) => {
                    const isSelected = selectedSource === 'owned' && selectedStock?.ticker === stock.ticker;
                    const pnl = toNumber(stock.pnl);
                    const pnlPositive = pnl >= 0;

                    return (
                      <button
                        key={stock.stockId}
                        type="button"
                        onClick={() => handleSelectOwnedStock(stock)}
                        className="w-full text-left rounded-2xl px-4 py-3 transition-all duration-200"
                        style={{
                          background: isSelected ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                          border: `1px solid ${isSelected ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--txt-primary)' }}>{stock.ticker}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--txt-secondary)' }}>{stock.companyName}</p>
                          </div>
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                            style={{
                              color: pnlPositive ? 'var(--gain)' : 'var(--loss)',
                              background: pnlPositive ? 'var(--gain-bg)' : 'var(--loss-bg)',
                              border: `1px solid ${pnlPositive ? 'var(--gain-border)' : 'var(--loss-border)'}`,
                            }}
                          >
                            {pnlPositive ? '+' : ''}{formatCurrency(pnl, 2, INR)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs" style={{ color: 'var(--txt-muted)' }}>
                            Current: {formatCurrency(toNumber(stock.currentValue), 2, INR)}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--txt-muted)' }}>
                            {formatPercent(toNumber(stock.pnlPercent))}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </SectionLoader>
          </section>
        </div>

        <section
          className="rounded-3xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
        >
          <SectionLoader loading={loadingInvestments} minHeight={420}>
            {!selectedStock ? (
              <div
                className="rounded-2xl px-4 py-20 text-center"
                style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}
              >
                <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>Select an owned stock or search a ticker to view details.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--txt-muted)' }}>Selected stock</p>
                    <h2 className="text-2xl font-bold mt-1" style={{ color: 'var(--txt-primary)' }}>
                      {selectedStock.ticker}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--txt-secondary)' }}>{selectedStock.companyName}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openOrderConfirmDialog('BUY')}
                      disabled={placingOrderType !== null || loadingSelectedDetails}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-55"
                      style={{ background: 'var(--gain)', boxShadow: 'var(--shadow-gain)' }}
                    >
                      {placingOrderType === 'BUY' ? <RiLoaderLine className="animate-spin" /> : <RiArrowUpLine />}
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => openOrderConfirmDialog('SELL')}
                      disabled={placingOrderType !== null || loadingSelectedDetails}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-55"
                      style={{ background: 'var(--loss)', boxShadow: 'var(--shadow-loss)' }}
                    >
                      {placingOrderType === 'SELL' ? <RiLoaderLine className="animate-spin" /> : <RiArrowDownLine />}
                      Sell
                    </button>
                  </div>
                </div>

                {actionMessage ? (
                  <div
                    className="rounded-2xl px-3 py-3 text-sm"
                    style={actionMessage.type === 'success'
                      ? { background: 'var(--gain-bg)', color: 'var(--gain)', border: '1px solid var(--gain-border)' }
                      : { background: 'var(--loss-bg)', color: 'var(--loss)', border: '1px solid var(--loss-border)' }}
                  >
                    {actionMessage.text}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {[
                    {
                      icon: RiMoneyDollarCircleLine,
                      label: 'Invested amount',
                      value: formatCurrency(toNumber(selectedStock.invested), 2, INR),
                      color: 'var(--accent)',
                    },
                    {
                      icon: RiLineChartLine,
                      label: 'Current value',
                      value: formatCurrency(toNumber(selectedStock.currentValue), 2, INR),
                      color: 'var(--txt-primary)',
                    },
                    {
                      icon: RiExchangeFundsLine,
                      label: 'Net P&L',
                      value: `${toNumber(selectedStock.pnl) >= 0 ? '+' : ''}${formatCurrency(toNumber(selectedStock.pnl), 2, INR)}`,
                      color: toNumber(selectedStock.pnl) >= 0 ? 'var(--gain)' : 'var(--loss)',
                    },
                    {
                      icon: RiBarChartLine,
                      label: 'Return %',
                      value: formatPercent(toNumber(selectedStock.pnlPercent)),
                      color: toNumber(selectedStock.pnlPercent) >= 0 ? 'var(--gain)' : 'var(--loss)',
                    },
                    {
                      icon: RiArrowUpLine,
                      label: 'Last price',
                      value: formatCurrency(toNumber(selectedStock.lastPrice), 2, INR),
                      color: 'var(--txt-primary)',
                    },
                    {
                      icon: RiArrowDownLine,
                      label: 'Prev close',
                      value: formatCurrency(toNumber(selectedStock.prevPrice), 2, INR),
                      color: 'var(--txt-primary)',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl p-4"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="text-sm" style={{ color: item.color }} />
                          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--txt-muted)' }}>{item.label}</p>
                        </div>
                        <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--txt-muted)' }}>
                    User transactions for this stock
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <Stat label="Total Txn" value={positionSummary.transactionCount} />
                    <Stat label="Buy Txn" value={positionSummary.buyCount} />
                    <Stat label="Sell Txn" value={positionSummary.sellCount} />
                    <Stat label="Buy Amount" value={formatCurrency(positionSummary.buyAmount, 2, INR)} />
                    <Stat label="Sell Amount" value={formatCurrency(positionSummary.sellAmount, 2, INR)} />
                    <Stat label="Net Invested" value={formatCurrency(positionSummary.netInvested, 2, INR)} />
                  </div>
                </div>
              </div>
            )}
          </SectionLoader>
        </section>
      </div>

      {orderConfirmDialog.open && selectedStock ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--bg-overlay)' }}>
          <div className="w-full max-w-md rounded-3xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-elevated)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ color: 'var(--warn)', background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <RiAlertLine />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>
                    Confirm {orderConfirmDialog.type}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--txt-secondary)' }}>
                    You are about to place a {orderConfirmDialog.type} order for {selectedStock.ticker}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeOrderConfirmDialog}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ color: 'var(--txt-muted)', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
                disabled={placingOrderType !== null}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeOrderConfirmDialog}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ color: 'var(--txt-secondary)', border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)' }}
                disabled={placingOrderType !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOrder}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-55"
                style={{
                  background: orderConfirmDialog.type === 'BUY' ? 'var(--gain)' : 'var(--loss)',
                  boxShadow: orderConfirmDialog.type === 'BUY' ? 'var(--shadow-gain)' : 'var(--shadow-loss)',
                }}
                disabled={placingOrderType !== null}
              >
                {placingOrderType === orderConfirmDialog.type ? <RiLoaderLine className="animate-spin" /> : null}
                Confirm {orderConfirmDialog.type}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      className="rounded-xl px-3 py-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--txt-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-bold mt-1" style={{ color: 'var(--txt-primary)' }}>
        {value}
      </p>
    </div>
  );
}
