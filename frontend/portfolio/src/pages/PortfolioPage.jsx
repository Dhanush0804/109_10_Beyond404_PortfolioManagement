import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  RiAddLine,
  RiAlertLine,
  RiCloseLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiBarChartLine,
  RiExchangeFundsLine,
  RiLineChartLine,
  RiLoaderLine,
  RiMoneyDollarCircleLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiSubtractLine,
} from 'react-icons/ri';
import SectionLoader from '../components/common/SectionLoader';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';
import { loadStockWisePnL } from '../store/slices/analyticsSlice';
import { loadInvestments, placeDummyBuyOrder, placeDummySellOrder } from '../store/slices/investmentSlice';
import { fetchStockAnalyticsDetails } from '../api/stocksApi';
import { fetchPaginatedInvestmentHistory } from '../api/investmentApi';
import MarketStockSearchPanel from '../components/portfolio/MarketStockSearchPanel';

const INR = 'USD';

const RISK_STYLES = {
  HIGH: { color: 'var(--loss)', bg: 'var(--loss-bg)', border: 'var(--loss-border)' },
  MEDIUM: { color: 'var(--warn)', bg: 'var(--warn-bg)', border: 'rgba(245,158,11,0.25)' },
  LOW: { color: 'var(--gain)', bg: 'var(--gain-bg)', border: 'var(--gain-border)' },
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const resolveStockMarket = (stock) => {
  const ticker = String(stock?.ticker ?? '').toUpperCase();

  if (ticker.endsWith('.NS')) return 'NSE';
  if (ticker.endsWith('.BO')) return 'BSE';

  const raw = String(stock?.stockMarket ?? stock?.exchangeDisplay ?? stock?.exchange ?? '').trim().toUpperCase();

  if (raw.includes('NASDAQ')) return 'NASDAQ';
  if (raw.includes('NYSE')) return 'NYSE';
  if (raw.includes('EURONEXT')) return 'EURONEXT';
  if (raw.includes('NSE')) return 'NSE';
  if (raw.includes('BSE')) return 'BSE';

  return raw || ticker;
};

export default function PortfolioPage() {
  const PAGE_SIZE = 25;
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
  const [historyPage, setHistoryPage] = useState(0);
  const [stockHistory, setStockHistory] = useState({ items: [], totalItems: 0, page: 0, size: PAGE_SIZE, totalPages: 0 });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [orderQuantityInput, setOrderQuantityInput] = useState('1');

  useEffect(() => {
    if (!selectedUser?.customerId) return;
    dispatch(loadStockWisePnL(selectedUser.customerId));
    dispatch(loadInvestments(selectedUser.customerId));
    setSelectedStock(null);
    setSelectedSource('owned');
    setHistoryPage(0);
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

  useEffect(() => {
    setOrderQuantityInput('1');
  }, [selectedStock?.ticker]);

  useEffect(() => {
    if (!selectedUser?.customerId || !selectedStock?.stockId || selectedSource !== 'owned') {
      setStockHistory({ items: [], totalItems: 0, page: 0, size: PAGE_SIZE, totalPages: 0 });
      setHistoryError(null);
      return;
    }

    let isCancelled = false;
    setLoadingHistory(true);
    setHistoryError(null);

    fetchPaginatedInvestmentHistory({
      customerId: selectedUser.customerId,
      stockId: selectedStock.stockId,
      page: historyPage,
      size: PAGE_SIZE,
    }).then((data) => {
      if (!isCancelled) {
        setStockHistory(data);
      }
    }).catch((error) => {
      if (!isCancelled) {
        setHistoryError(error?.message ?? 'Unable to load transaction history.');
      }
    }).finally(() => {
      if (!isCancelled) {
        setLoadingHistory(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedUser?.customerId, selectedStock?.stockId, selectedSource, historyPage]);

  const selectedStockTransactions = useMemo(() => {
    if (!selectedStock?.stockId) return [];
    return investments.filter((item) => Number(item.stockId) === Number(selectedStock.stockId));
  }, [investments, selectedStock?.stockId]);

  const positionSummary = useMemo(() => {
    const buys = selectedStockTransactions.filter((item) => item.transactionType === 'BUY');
    const sells = selectedStockTransactions.filter((item) => item.transactionType === 'SELL');

    const buyAmount = buys.reduce((sum, item) => sum + toNumber(item.transactionAmount), 0);
    const sellAmount = sells.reduce((sum, item) => sum + toNumber(item.transactionAmount), 0);
    const sharesOwned = selectedStockTransactions.reduce((sum, item) => {
      const quantity = toNumber(item.quantity);
      return sum + (item.transactionType === 'BUY' ? quantity : -quantity);
    }, 0);

    return {
      transactionCount: selectedStockTransactions.length,
      buyCount: buys.length,
      sellCount: sells.length,
      buyAmount,
      sellAmount,
      netInvested: buyAmount - sellAmount,
      sharesOwned: Math.max(sharesOwned, 0),
    };
  }, [selectedStockTransactions]);

  const orderQuantity = useMemo(() => {
    const parsed = Number.parseInt(orderQuantityInput, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [orderQuantityInput]);

  const selectedPrice = toNumber(selectedStock?.lastPrice);
  const estimatedOrderAmount = orderQuantity * selectedPrice;

  if (!selectedUser?.customerId) {
    return (
      <div className="page-container flex items-center justify-center anim-fade-in" style={{ minHeight: 'calc(100vh - var(--topbar-height))' }}>
        <div
          className="card w-full max-w-md"
          style={{ padding: '18px 20px 16px' }}
        >
          <div className="flex items-start gap-3" style={{ minWidth: 0 }}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ color: 'var(--warn)', background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <RiAlertLine />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>
                Select user required
              </h2>
              <p className="text-sm" style={{ color: 'var(--txt-secondary)', marginTop: 4, lineHeight: 1.45 }}>
                Please select a user first to open the Portfolio page.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)', minHeight: 38, minWidth: 148, padding: '0 16px' }}
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
    setHistoryPage(0);
    loadStockDetails(stock, 'owned');
  };

  const handleSelectMarketStock = (stock) => {
    setHistoryPage(0);
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

  const handleQuantityInputChange = (value) => {
    if (/^\d*$/.test(value)) {
      setOrderQuantityInput(value);
    }
  };

  const decreaseQuantity = () => {
    setOrderQuantityInput(String(Math.max(orderQuantity - 1, 1)));
  };

  const increaseQuantity = () => {
    setOrderQuantityInput(String(orderQuantity + 1));
  };

  const handleOrder = async () => {
    const type = orderConfirmDialog.type;
    if (!selectedUser?.customerId || !selectedStock?.ticker || placingOrderType) return;

    setPlacingOrderType(type);
    setActionMessage(null);

    const stockMarket = resolveStockMarket(selectedStock);

    const payload = {
      stockName: selectedStock.companyName || selectedStock.ticker,
      customerId: selectedUser.customerId,
      ticker: selectedStock.ticker,
      stockMarket,
      transactionType: type,
      quantity: orderQuantity,
    };

    try {
      if (type === 'BUY') {
        await dispatch(placeDummyBuyOrder(payload)).unwrap();
      } else {
        await dispatch(placeDummySellOrder(payload)).unwrap();
      }

      await Promise.all([
        dispatch(loadStockWisePnL(selectedUser.customerId)),
        dispatch(loadInvestments(selectedUser.customerId)),
      ]);

      setHistoryPage(0);
      await loadStockDetails(
        {
          ticker: selectedStock.ticker,
          companyName: selectedStock.companyName,
        },
        'owned'
      );

      setActionMessage({
        type: 'success',
        text: `${type} order placed for ${selectedStock.ticker} (Qty: ${orderQuantity}).`,
      });
      setOrderQuantityInput('1');
      closeOrderConfirmDialog();
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error?.response?.data?.message ?? error?.message ?? `Unable to place ${type} order.`,
      });
    } finally {
      setOrderConfirmDialog({ open: false, type: null });
      setPlacingOrderType(null);
    }
  };

  const handleRefreshStockHistory = () => {
    if (!selectedUser?.customerId || !selectedStock?.stockId || selectedSource !== 'owned' || loadingHistory) {
      return;
    }

    setLoadingHistory(true);
    setHistoryError(null);

    fetchPaginatedInvestmentHistory({
      customerId: selectedUser.customerId,
      stockId: selectedStock.stockId,
      page: historyPage,
      size: PAGE_SIZE,
    }).then((data) => {
      setStockHistory(data);
    }).catch((error) => {
      setHistoryError(error?.message ?? 'Unable to load transaction history.');
    }).finally(() => {
      setLoadingHistory(false);
    });
  };

  return (
    <div className="page-container anim-fade-in" style={{ maxWidth: 1540, margin: '0 auto' }}>
      <section className="hero-section">

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

          <div
            className="grid grid-cols-2 gap-3 justify-end"
            style={{ paddingRight: '0.15rem', minWidth: 0 }}
          >
            <div
              className="rounded-2xl flex flex-col justify-between"
              style={{ background: 'rgba(10,13,20,0.72)', border: '1px solid var(--border-soft)', minWidth: 132, padding: '14px 16px' }}
            >
              <p className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--txt-muted)' }}>
                Stocks owned
              </p>
              <p className="text-2xl font-extrabold mt-1 leading-none" style={{ color: 'var(--txt-primary)' }}>
                {stockWise.length}
              </p>
            </div>

            <div
              className="rounded-2xl flex flex-col justify-between"
              style={{ background: 'rgba(10,13,20,0.72)', border: '1px solid var(--border-soft)', minWidth: 132, padding: '14px 16px' }}
            >
              <p className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--txt-muted)' }}>
                User risk
              </p>
              <span
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl text-[11px] font-bold w-fit"
                style={{ background: riskStyle.bg, border: `1px solid ${riskStyle.border}`, color: riskStyle.color }}
              >
                <RiShieldCheckLine />
                {selectedUser?.riskLevel ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(340px,440px)_1fr] gap-7 items-start">
        <div className="flex flex-col gap-6">
          <MarketStockSearchPanel
            onSelectStock={handleSelectMarketStock}
            disabled={!selectedUser || loadingSelectedDetails || placingOrderType !== null}
          />

          <section className="card" style={{ padding: '1.5rem' }}>
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
                <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
                  {stockWise.map((stock) => {
                    const isSelected = selectedSource === 'owned' && selectedStock?.ticker === stock.ticker;
                    const pnl = toNumber(stock.pnl);
                    const pnlPositive = pnl >= 0;

                    return (
                      <button
                        key={stock.stockId}
                        type="button"
                        onClick={() => handleSelectOwnedStock(stock)}
                        className="w-full text-left rounded-xl transition-all duration-200 hover:scale-[1.01]"
                        style={{
                          background: isSelected ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                          border: `1px solid ${isSelected ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                          padding: '0.95rem 1rem',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--txt-primary)' }}>{stock.ticker}</p>
                            <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--txt-secondary)' }}>{stock.companyName}</p>
                          </div>
                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                            style={{
                              color: pnlPositive ? 'var(--gain)' : 'var(--loss)',
                              background: pnlPositive ? 'var(--gain-bg)' : 'var(--loss-bg)',
                              border: `1px solid ${pnlPositive ? 'var(--gain-border)' : 'var(--loss-border)'}`,
                            }}
                          >
                            {pnlPositive ? '+' : ''}{formatCurrency(pnl, 2, INR)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2.5 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <p className="text-xs font-medium" style={{ color: 'var(--txt-muted)' }}>
                            Current: {formatCurrency(toNumber(stock.currentValue), 2, INR)}
                          </p>
                          <p className="text-xs font-bold" style={{ color: pnlPositive ? 'var(--gain)' : 'var(--loss)' }}>
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

        <section className="card" style={{ padding: '1.6rem' }}>
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
                <div
                  className="flex items-start justify-between gap-4 flex-wrap"
                  style={{ paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--txt-muted)' }}>Selected stock</p>
                    <h2 className="text-2xl font-bold mt-1" style={{ color: 'var(--txt-primary)' }}>
                      {selectedStock.ticker}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--txt-secondary)' }}>{selectedStock.companyName}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap justify-end" style={{ paddingRight: '0.2rem' }}>
                    <div
                      className="inline-flex items-center rounded-xl"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', height: 40 }}
                    >
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={placingOrderType !== null || loadingSelectedDetails}
                        className="h-full px-3 inline-flex items-center justify-center disabled:opacity-55"
                        style={{ color: 'var(--txt-primary)' }}
                        aria-label="Decrease quantity"
                      >
                        <RiSubtractLine />
                      </button>
                      <input
                        value={orderQuantityInput}
                        onChange={(event) => { handleQuantityInputChange(event.target.value); }}
                        onBlur={() => {
                          if (!orderQuantityInput || Number.parseInt(orderQuantityInput, 10) <= 0) {
                            setOrderQuantityInput('1');
                          }
                        }}
                        inputMode="numeric"
                        className="input border-0 text-center text-sm font-semibold"
                        style={{ width: 60, minHeight: 36, borderRadius: 0, boxShadow: 'none', background: 'transparent' }}
                        disabled={placingOrderType !== null || loadingSelectedDetails}
                        aria-label="Order quantity"
                      />
                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={placingOrderType !== null || loadingSelectedDetails}
                        className="h-full px-3 inline-flex items-center justify-center disabled:opacity-55"
                        style={{ color: 'var(--txt-primary)' }}
                        aria-label="Increase quantity"
                      >
                        <RiAddLine />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => openOrderConfirmDialog('BUY')}
                      disabled={placingOrderType !== null || loadingSelectedDetails}
                      className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold tracking-wide text-white disabled:opacity-55 transition-all duration-150 hover:scale-105 active:scale-95"
                      style={{
                        background: 'var(--gain)',
                        boxShadow: 'var(--shadow-gain)',
                        minWidth: '108px',
                        minHeight: '40px',
                        padding: '0.55rem 1rem',
                      }}
                    >
                      {placingOrderType === 'BUY' ? <RiLoaderLine className="animate-spin" /> : <RiArrowUpLine />}
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => openOrderConfirmDialog('SELL')}
                      disabled={placingOrderType !== null || loadingSelectedDetails}
                      className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold tracking-wide text-white disabled:opacity-55 transition-all duration-150 hover:scale-105 active:scale-95"
                      style={{
                        background: 'var(--loss)',
                        boxShadow: 'var(--shadow-loss)',
                        minWidth: '108px',
                        minHeight: '40px',
                        padding: '0.55rem 1rem',
                      }}
                    >
                      {placingOrderType === 'SELL' ? <RiLoaderLine className="animate-spin" /> : <RiArrowDownLine />}
                      Sell
                    </button>
                    <p className="text-xs font-semibold text-right w-full" style={{ color: 'var(--txt-secondary)', marginTop: 2 }}>
                      Est. order value: {selectedPrice > 0 ? formatCurrency(estimatedOrderAmount, 2, INR) : 'Price unavailable'}
                    </p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                        className="rounded-xl flex flex-col justify-between"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                      >
                        <div className="flex items-center gap-2" style={{ padding: '0.95rem 1rem 0.45rem' }}>
                          <Icon className="text-base" style={{ color: item.color }} />
                          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--txt-muted)' }}>{item.label}</p>
                        </div>
                        <p className="text-base font-extrabold" style={{ color: item.color, padding: '0 1rem 0.95rem' }}>{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="rounded-2xl"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{
                      color: 'var(--txt-muted)',
                      padding: '1.1rem 1.15rem 0.65rem',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    User transactions for this stock
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(138px, 1fr))',
                      gap: '0.75rem',
                      padding: '0.9rem 1.15rem 1.1rem',
                    }}
                  >
                    <Stat label="Total Txn" value={positionSummary.transactionCount} />
                    <Stat label="Buy Txn" value={positionSummary.buyCount} />
                    <Stat label="Sell Txn" value={positionSummary.sellCount} />
                    <Stat label="Shares Own" value={positionSummary.sharesOwned.toLocaleString('en-US', { maximumFractionDigits: 4 })} />
                    <Stat label="Buy Amount" value={formatCurrency(positionSummary.buyAmount, 2, INR)} />
                    <Stat label="Sell Amount" value={formatCurrency(positionSummary.sellAmount, 2, INR)} />
                    <Stat label="Net Invested" value={formatCurrency(positionSummary.netInvested, 2, INR)} />
                  </div>
                </div>

                {selectedSource === 'owned' ? (
                  <div
                    className="rounded-2xl min-h-[300px]"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div
                      className="flex items-start justify-between gap-3 mb-5 flex-wrap"
                      style={{
                        padding: '1rem 1.5rem 0.75rem 1.25rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        marginBottom: '0.6rem',
                      }}
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--txt-muted)' }}>
                          Investment History
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--txt-secondary)' }}>
                          Paginated transactions for {selectedStock.ticker}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRefreshStockHistory}
                          disabled={loadingHistory}
                          className="inline-flex items-center justify-center rounded-md text-[10px] font-semibold disabled:opacity-50"
                          style={{
                            width: 28,
                            height: 28,
                            color: 'var(--txt-secondary)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-card)',
                            marginTop: '0.2rem',
                          }}
                          title="Refresh history"
                        >
                          <RiRefreshLine className={loadingHistory ? 'animate-spin' : ''} />
                        </button>
                        <span
                          className="inline-flex items-center justify-center shrink-0 rounded-full text-[11px] font-semibold"
                          style={{
                            color: 'var(--txt-muted)',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            minWidth: '76px',
                            height: '30px',
                            padding: '0.35rem 0.8rem',
                            lineHeight: 1,
                            marginTop: '0.2rem',
                            marginRight: '0.4rem',
                          }}
                        >
                          Total: {stockHistory.totalItems}
                        </span>
                      </div>
                    </div>

                    <SectionLoader loading={loadingHistory} minHeight={220}>
                      {historyError ? (
                        <div className="rounded-2xl px-4 py-10 text-center" style={{ background: 'var(--loss-bg)', border: '1px solid var(--loss-border)', color: 'var(--loss)' }}>
                          {historyError}
                        </div>
                      ) : stockHistory.items.length === 0 ? (
                        <div className="rounded-2xl px-4 py-10 text-center" style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-soft)' }}>
                          <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>No transactions found for this stock.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4" style={{ padding: '0 1.25rem 1.25rem' }}>
                          <div className="overflow-x-auto rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                            <table className="data-table">
                              <thead>
                                <tr>
                                  {['Asset ID', 'Type', 'Quantity', 'Amount', 'Date'].map((heading) => (
                                    <th key={heading} className={heading === 'Type' ? 'text-center' : ''}>
                                      {heading}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {stockHistory.items.map((item) => {
                                  const isBuy = item.transactionType === 'BUY';
                                  return (
                                    <tr key={item.assetId}>
                                      <td className="text-sm" style={{ color: 'var(--txt-primary)' }}>#{item.assetId}</td>
                                      <td className="text-center">
                                        <span className="inline-flex items-center justify-center min-w-[52px] px-3 py-1 rounded-full text-[11px] font-semibold" style={isBuy ? { background: 'var(--gain-bg)', color: 'var(--gain)', border: '1px solid var(--gain-border)' } : { background: 'var(--loss-bg)', color: 'var(--loss)', border: '1px solid var(--loss-border)' }}>
                                          {item.transactionType}
                                        </span>
                                      </td>
                                      <td className="text-sm" style={{ color: 'var(--txt-primary)' }}>{Number(item.quantity ?? 0).toLocaleString('en-US')}</td>
                                      <td className="text-sm" style={{ color: 'var(--txt-primary)' }}>{formatCurrency(item.transactionAmount, 2, INR)}</td>
                                      <td className="text-sm" style={{ color: 'var(--txt-secondary)' }}>{formatDate(item.transactionTimestamp)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <PaginationControls
                            page={stockHistory.page}
                            totalPages={stockHistory.totalPages}
                            onPrevious={() => setHistoryPage((current) => Math.max(current - 1, 0))}
                            onNext={() => setHistoryPage((current) => current + 1)}
                          />
                        </div>
                      )}
                    </SectionLoader>
                  </div>
                ) : null}
              </div>
            )}
          </SectionLoader>
        </section>
      </div>

      {orderConfirmDialog.open && selectedStock ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--bg-overlay)' }}>
          <div className="w-full max-w-lg rounded-3xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-elevated)', padding: '18px 18px 16px' }}>
            {placingOrderType === orderConfirmDialog.type ? (
              <div
                style={{
                  height: 3,
                  borderRadius: 999,
                  marginBottom: 12,
                  background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 45%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.2s linear infinite',
                }}
              />
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3" style={{ minWidth: 0, paddingRight: 4 }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ color: 'var(--warn)', background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <RiAlertLine />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>
                    Confirm {orderConfirmDialog.type}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--txt-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                    You are about to place a {orderConfirmDialog.type} order for {selectedStock.ticker}.
                  </p>
                  <p className="text-sm" style={{ color: 'var(--txt-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                    Qty: <span style={{ color: 'var(--txt-primary)', fontWeight: 700 }}>{orderQuantity}</span>
                    {' · '}
                    {orderConfirmDialog.type === 'BUY' ? 'Estimated spend' : 'Estimated receive'}:{' '}
                    <span style={{ color: 'var(--txt-primary)', fontWeight: 700 }}>
                      {selectedPrice > 0 ? formatCurrency(estimatedOrderAmount, 2, INR) : 'Price unavailable'}
                    </span>
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

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-end gap-3 flex-wrap">
              <button
                type="button"
                onClick={closeOrderConfirmDialog}
                className="rounded-xl text-sm font-semibold"
                style={{
                  color: 'var(--txt-secondary)',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--bg-elevated)',
                  minWidth: 104,
                  minHeight: 38,
                  padding: '0 16px',
                }}
                disabled={placingOrderType !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOrder}
                className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-55"
                style={{
                  background: orderConfirmDialog.type === 'BUY' ? 'var(--gain)' : 'var(--loss)',
                  boxShadow: orderConfirmDialog.type === 'BUY' ? 'var(--shadow-gain)' : 'var(--shadow-loss)',
                  minWidth: 124,
                  minHeight: 38,
                  padding: '0 16px',
                  justifyContent: 'center',
                }}
                disabled={placingOrderType !== null}
              >
                {placingOrderType === orderConfirmDialog.type ? <RiLoaderLine className="animate-spin" /> : null}
                Confirm {orderConfirmDialog.type}
              </button>
              </div>
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
      className="rounded-xl flex flex-col justify-between"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        padding: '0.7rem 0.85rem',
        minHeight: '74px',
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--txt-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-extrabold mt-1.5" style={{ color: 'var(--txt-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function PaginationControls({ page, totalPages, onPrevious, onNext }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs" style={{ color: 'var(--txt-muted)' }}>
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrevious} disabled={page <= 0} className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50" style={{ background: 'var(--bg-card)', color: 'var(--txt-primary)', border: '1px solid var(--border-subtle)' }}>Previous</button>
        <button type="button" onClick={onNext} disabled={page + 1 >= totalPages} className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50" style={{ background: 'var(--bg-card)', color: 'var(--txt-primary)', border: '1px solid var(--border-subtle)' }}>Next</button>
      </div>
    </div>
  );
}
