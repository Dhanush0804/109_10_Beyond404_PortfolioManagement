import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  RiAddLine,
  RiAlertLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiExchangeFundsLine,
  RiLineChartLine,
  RiLoaderLine,
  RiPlayCircleLine,
  RiPriceTag3Line,
  RiRefreshLine,
} from 'react-icons/ri';
import { loadStockWisePnL } from '../store/slices/analyticsSlice';
import { clearAlgoState, runAlgoAnalysis } from '../store/slices/algoSlice';
import { loadAssetHoldings } from '../store/slices/assetHoldingsSlice';
import { loadInvestments, placeDummyBuyOrder, placeDummySellOrder } from '../store/slices/investmentSlice';
import SectionLoader from '../components/common/SectionLoader';
import MarketStockSearchPanel from '../components/portfolio/MarketStockSearchPanel';
import { formatCurrency } from '../utils/formatters';

const MAX_CHECKPOINT_TICKERS = 10;
const STRATEGY_OPTIONS = [{ label: 'momentumSMA', value: 'momentumSMA' }];

const normalizeTicker = (ticker) => String(ticker ?? '').trim().toUpperCase();

const actionStyle = {
  BUY: { color: 'var(--gain)', bg: 'var(--gain-bg)', border: 'var(--gain-border)' },
  SELL: { color: 'var(--loss)', bg: 'var(--loss-bg)', border: 'var(--loss-border)' },
  HOLD: { color: 'var(--warn)', bg: 'var(--warn-bg)', border: 'rgba(245,158,11,0.25)' },
};

const resolveStockMarket = (stock, ticker) => {
  const upperTicker = normalizeTicker(ticker);
  if (upperTicker.endsWith('.NS')) return 'NSE';
  if (upperTicker.endsWith('.BO')) return 'BSE';

  const raw = String(stock?.stockMarket ?? stock?.exchangeDisplay ?? stock?.exchange ?? '').trim().toUpperCase();
  if (raw.includes('NASDAQ')) return 'NASDAQ';
  if (raw.includes('NYSE')) return 'NYSE';
  if (raw.includes('EURONEXT')) return 'EURONEXT';
  if (raw.includes('NSE')) return 'NSE';
  if (raw.includes('BSE')) return 'BSE';

  return 'NASDAQ';
};

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

export default function AnalysisPage() {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.user);
  const { stockWise, loadingStockWise } = useSelector((state) => state.analytics);
  const { items: holdings, loading: loadingHoldings } = useSelector((state) => state.assetHoldings);
  const { runLoading, runError, lastRun } = useSelector((state) => state.algo);

  const [checkpointTickers, setCheckpointTickers] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState('momentumSMA');
  const [selectionMessage, setSelectionMessage] = useState(null);
  const [tradeSelections, setTradeSelections] = useState({});
  const [selectedTradeTicker, setSelectedTradeTicker] = useState(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState(null);

  useEffect(() => {
    if (!selectedUser?.customerId) return;
    dispatch(loadStockWisePnL(selectedUser.customerId));
    dispatch(loadAssetHoldings(selectedUser.customerId));
    dispatch(loadInvestments(selectedUser.customerId));
  }, [dispatch, selectedUser?.customerId]);

  useEffect(() => {
    return () => {
      dispatch(clearAlgoState());
    };
  }, [dispatch]);

  const canAddMore = checkpointTickers.length < MAX_CHECKPOINT_TICKERS;

  const ownedTickerRows = useMemo(() => {
    return Array.isArray(stockWise) ? stockWise.filter((row) => normalizeTicker(row?.ticker)) : [];
  }, [stockWise]);

  const stockByTicker = useMemo(() => {
    return new Map(ownedTickerRows.map((row) => [normalizeTicker(row.ticker), row]));
  }, [ownedTickerRows]);

  const ownedSharesByTicker = useMemo(() => {
    const stockIdToTicker = new Map(ownedTickerRows.map((row) => [Number(row.stockId), normalizeTicker(row.ticker)]));
    const map = new Map();

    (Array.isArray(holdings) ? holdings : []).forEach((item) => {
      const stockId = Number(item?.stockId);
      const ticker = stockIdToTicker.get(stockId);
      if (!ticker) return;

      const quantity = Number(item?.quantity ?? 0);
      if (!Number.isFinite(quantity)) return;

      map.set(ticker, quantity);
    });

    return map;
  }, [holdings, ownedTickerRows]);

  useEffect(() => {
    const signals = Array.isArray(lastRun?.signals) ? lastRun.signals : [];
    if (!signals.length) {
      setTradeSelections({});
      setSelectedTradeTicker(null);
      return;
    }

    setTradeSelections((current) => {
      const next = {};
      signals.forEach((signal) => {
        const ticker = normalizeTicker(signal?.ticker);
        if (!ticker) return;
        const previous = current[ticker];
        const defaultSide = String(signal?.action ?? '').toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
        next[ticker] = {
          side: previous?.side === 'SELL' ? 'SELL' : previous?.side === 'BUY' ? 'BUY' : defaultSide,
          quantity: toPositiveInt(previous?.quantity, 1),
        };
      });
      return next;
    });

    setSelectedTradeTicker((current) => {
      const normalized = normalizeTicker(current);
      return signals.some((signal) => normalizeTicker(signal?.ticker) === normalized)
        ? normalized
        : normalizeTicker(signals[0]?.ticker);
    });
  }, [lastRun]);

  const addTickerToCheckpoint = (inputTicker) => {
    const ticker = normalizeTicker(inputTicker);
    if (!ticker) return;

    if (checkpointTickers.includes(ticker)) {
      setSelectionMessage(`${ticker} is already in checkpoint.`);
      return;
    }

    if (!canAddMore) {
      setSelectionMessage(`Checkpoint limit reached. Max ${MAX_CHECKPOINT_TICKERS} tickers allowed.`);
      return;
    }

    setCheckpointTickers((current) => [...current, ticker]);
    setSelectionMessage(`${ticker} added to analysis checkpoint.`);
  };

  const removeTickerFromCheckpoint = (ticker) => {
    const normalized = normalizeTicker(ticker);
    setCheckpointTickers((current) => current.filter((item) => item !== normalized));
  };

  const handleAnalyze = async () => {
    if (!selectedUser?.customerId || runLoading) return;
    setTradeMessage(null);

    await dispatch(runAlgoAnalysis({
      customerId: selectedUser.customerId,
      strategyName: selectedStrategy,
      tickers: checkpointTickers,
      dryRun: true,
    }));
  };

  const handleRefreshOwned = () => {
    if (!selectedUser?.customerId || loadingStockWise || loadingHoldings) return;
    dispatch(loadStockWisePnL(selectedUser.customerId));
    dispatch(loadAssetHoldings(selectedUser.customerId));
  };

  const setTradeSide = (ticker, side) => {
    setTradeSelections((current) => ({
      ...current,
      [ticker]: {
        side,
        quantity: toPositiveInt(current[ticker]?.quantity, 1),
      },
    }));
  };

  const setTradeQuantity = (ticker, quantityValue) => {
    if (!/^\d*$/.test(quantityValue)) return;

    setTradeSelections((current) => ({
      ...current,
      [ticker]: {
        side: current[ticker]?.side === 'SELL' ? 'SELL' : 'BUY',
        quantity: quantityValue,
      },
    }));
  };

  const handleExecuteTrade = async () => {
    if (!selectedUser?.customerId || tradeLoading) return;
    if (!selectedTradeTicker) return;

    const signal = (Array.isArray(lastRun?.signals) ? lastRun.signals : []).find(
      (item) => normalizeTicker(item?.ticker) === selectedTradeTicker
    );

    if (!signal) return;

    const selection = tradeSelections[selectedTradeTicker] ?? { side: 'BUY', quantity: 1 };
    const side = selection.side === 'SELL' ? 'SELL' : 'BUY';
    const quantity = toPositiveInt(selection.quantity, 1);
    const ownedShares = Number(ownedSharesByTicker.get(selectedTradeTicker) ?? 0);

    if (side === 'SELL' && quantity > ownedShares) {
      setTradeMessage({
        type: 'error',
        text: `Sell rejected: ${selectedTradeTicker} owned shares are ${ownedShares.toLocaleString('en-US', { maximumFractionDigits: 4 })}, requested ${quantity}.`,
      });
      return;
    }

    const stockMeta = stockByTicker.get(selectedTradeTicker);
    const stockMarket = resolveStockMarket(stockMeta, selectedTradeTicker);
    const payload = {
      stockName: stockMeta?.companyName ?? selectedTradeTicker,
      ticker: selectedTradeTicker,
      stockMarket,
      customerId: selectedUser.customerId,
      transactionType: side,
      quantity,
    };

    setTradeLoading(true);
    setTradeMessage(null);

    try {
      if (side === 'BUY') {
        await dispatch(placeDummyBuyOrder(payload)).unwrap();
      } else {
        await dispatch(placeDummySellOrder(payload)).unwrap();
      }

      await Promise.all([
        dispatch(loadStockWisePnL(selectedUser.customerId)),
        dispatch(loadAssetHoldings(selectedUser.customerId)),
        dispatch(loadInvestments(selectedUser.customerId)),
      ]);

      setTradeMessage({
        type: 'success',
        text: `${side} order placed for ${selectedTradeTicker} (Qty: ${quantity}).`,
      });
    } catch (error) {
      setTradeMessage({
        type: 'error',
        text: error?.response?.data?.message ?? error?.message ?? `Unable to place ${side} order.`,
      });
    } finally {
      setTradeLoading(false);
    }
  };

  const selectedSignal = useMemo(() => {
    return (Array.isArray(lastRun?.signals) ? lastRun.signals : []).find(
      (signal) => normalizeTicker(signal?.ticker) === selectedTradeTicker
    ) ?? null;
  }, [lastRun, selectedTradeTicker]);

  const selectedTrade = selectedTradeTicker ? (tradeSelections[selectedTradeTicker] ?? { side: 'BUY', quantity: 1 }) : { side: 'BUY', quantity: 1 };
  const selectedTradeQuantity = toPositiveInt(selectedTrade.quantity, 1);
  const selectedTradePrice = Number(selectedSignal?.lastPrice ?? 0);
  const selectedTradeAmount = selectedTradeQuantity * (Number.isFinite(selectedTradePrice) ? selectedTradePrice : 0);
  const selectedOwnedShares = Number(ownedSharesByTicker.get(selectedTradeTicker ?? '') ?? 0);

  if (!selectedUser?.customerId) {
    return (
      <div className="page-container flex items-center justify-center anim-fade-in" style={{ minHeight: 'calc(100vh - var(--topbar-height))' }}>
        <div className="card w-full max-w-lg" style={{ padding: '20px 22px' }}>
          <div className="flex items-start gap-3" style={{ minWidth: 0 }}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ color: 'var(--warn)', background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <RiAlertLine />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Select user required</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--txt-secondary)' }}>
                Pick a user from the top-right user menu to run algo trading analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container anim-fade-in" style={{ maxWidth: 1460, margin: '0 auto' }}>
      <section className="hero-section">
        <div className="relative flex items-start justify-between gap-5 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] font-bold" style={{ color: 'var(--accent-light)' }}>
              Main Menu / Analysis
            </p>
            <h1 className="text-2xl font-bold mt-2" style={{ color: 'var(--txt-primary)' }}>
              Algo Trading Workbench
            </h1>
            <p className="text-sm mt-2 max-w-3xl" style={{ color: 'var(--txt-secondary)' }}>
              Build an analysis checkpoint of up to 10 tickers, choose a strategy, and run one-shot paper-trading signals.
              If no ticker is selected, backend automatically analyzes all owned stocks.
            </p>
          </div>

          <div
            className="rounded-2xl"
            style={{ background: 'rgba(10,13,20,0.72)', border: '1px solid var(--border-soft)', padding: '14px 16px', minWidth: 240 }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--txt-muted)' }}>
              Checkpoint quantity
            </p>
            <p className="text-3xl font-extrabold mt-2" style={{ color: 'var(--txt-primary)' }}>
              {checkpointTickers.length}
              <span className="text-base font-semibold ml-1" style={{ color: 'var(--txt-secondary)' }}>/ {MAX_CHECKPOINT_TICKERS}</span>
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
              Only tickers are selected here. No quantity input required.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,420px)_minmax(620px,1fr)] gap-4 items-stretch">
        <div className="flex flex-col gap-4">
          <MarketStockSearchPanel
            onSelectStock={(stock) => addTickerToCheckpoint(stock?.ticker)}
            disabled={runLoading || !canAddMore}
          />

          <section className="card" style={{ padding: '16px 16px 14px' }}>
            <div className="flex items-center justify-between gap-3" style={{ marginBottom: 14 }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Owned stocks</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
                  Quick add from portfolio positions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefreshOwned}
                disabled={loadingStockWise}
                className="inline-flex items-center justify-center rounded-md text-[10px] font-semibold disabled:opacity-50"
                style={{
                  width: 28,
                  height: 28,
                  color: 'var(--txt-secondary)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                }}
                title="Refresh owned stocks"
              >
                <RiRefreshLine className={loadingStockWise ? 'animate-spin' : ''} />
              </button>
            </div>

            <SectionLoader loading={loadingStockWise} minHeight={200}>
              {ownedTickerRows.length === 0 ? (
                <div className="rounded-2xl px-4 py-10 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}>
                  <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>
                    No owned stocks available for this user.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {ownedTickerRows.map((stock) => {
                    const ticker = normalizeTicker(stock.ticker);
                    const selected = checkpointTickers.includes(ticker);

                    return (
                      <button
                        key={ticker}
                        type="button"
                        onClick={() => addTickerToCheckpoint(ticker)}
                        disabled={selected || !canAddMore || runLoading}
                        className="w-full text-left rounded-xl px-3 py-2.5 disabled:opacity-60"
                        style={{
                          background: selected ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                          border: `1px solid ${selected ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        <p className="text-xs font-bold" style={{ color: selected ? 'var(--accent)' : 'var(--txt-primary)' }}>{ticker}</p>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--txt-secondary)' }}>{stock.companyName}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </SectionLoader>
          </section>
        </div>

        <div className="flex">
          <section className="card w-full" style={{ padding: '16px 16px 14px' }}>
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Analysis checkpoint</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
                  Cart-style ticker list sent to algo engine.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCheckpointTickers([])}
                disabled={checkpointTickers.length === 0 || runLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold disabled:opacity-50"
                style={{
                  color: 'var(--loss)',
                  background: 'var(--loss-bg)',
                  border: '1px solid var(--loss-border)',
                  minWidth: 90,
                  height: 30,
                  padding: '0 10px',
                }}
              >
                <RiDeleteBinLine />
                Clear all
              </button>
            </div>

            {selectionMessage ? (
              <div className="rounded-xl px-3 py-2 text-xs mb-3" style={{ background: 'var(--bg-elevated)', color: 'var(--txt-secondary)', border: '1px solid var(--border-subtle)' }}>
                {selectionMessage}
              </div>
            ) : null}

            {checkpointTickers.length === 0 ? (
              <div className="rounded-2xl px-4 py-8 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}>
                <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>
                  No tickers selected. Analyze will run for all owned stocks in backend.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                {checkpointTickers.map((ticker) => (
                  <div
                    key={ticker}
                    className="rounded-xl px-3 py-2.5 flex items-center justify-between"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--txt-primary)' }}>{ticker}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--txt-muted)' }}>Ticker</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTickerFromCheckpoint(ticker)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--loss-bg)', color: 'var(--loss)', border: '1px solid var(--loss-border)' }}
                      title={`Remove ${ticker}`}
                    >
                      <RiCloseLine />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 14, paddingTop: 14 }}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--txt-secondary)' }}>Strategy</span>
                  <select
                    value={selectedStrategy}
                    onChange={(event) => setSelectedStrategy(event.target.value)}
                    className="input text-sm rounded-xl"
                    style={{ height: 38, paddingLeft: 12, paddingRight: 34 }}
                    disabled={runLoading}
                  >
                    {STRATEGY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <span className="text-[11px]" style={{ color: 'var(--txt-muted)' }}>
                    Backend currently supports only momentumSMA.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={runLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-55"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: 'var(--shadow-accent)',
                    minWidth: 154,
                    minHeight: 38,
                    padding: '0 16px',
                  }}
                >
                  {runLoading ? <RiLoaderLine className="animate-spin" /> : <RiPlayCircleLine />}
                  {runLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {runError ? (
              <div className="rounded-2xl px-3 py-3 text-sm mt-4" style={{ background: 'var(--loss-bg)', color: 'var(--loss)', border: '1px solid var(--loss-border)' }}>
                {String(runError)}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <section className="card" style={{ padding: '16px 16px 14px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              <RiLineChartLine style={{ color: 'var(--accent)' }} />
              <h3 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Algo signals</h3>
            </div>

            {!lastRun ? (
              <div className="rounded-2xl px-4 py-12 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}>
                <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>Run analysis to view generated signals.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  <MetaPill label="Customer" value={`#${lastRun.customerId ?? selectedUser.customerId}`} />
                  <MetaPill label="Strategy" value={lastRun.strategyName ?? selectedStrategy} />
                  <MetaPill label="Risk" value={lastRun.riskLevel ?? selectedUser.riskLevel ?? 'MEDIUM'} />
                  <MetaPill label="Dry Run" value={String(lastRun.dryRun ?? true).toUpperCase()} />
                </div>

                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
                  <table className="data-table analysis-signals-table">
                    <thead>
                      <tr>
                        {['Ticker', 'Action', 'Score', 'Confidence', 'Last Price', 'Order', 'Quantity', 'Owned Shares', 'Reason'].map((heading) => (
                          <th key={heading}>{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(lastRun.signals) ? lastRun.signals : []).map((signal) => {
                        const ticker = normalizeTicker(signal?.ticker);
                        const rowSelection = tradeSelections[ticker] ?? { side: 'BUY', quantity: 1 };
                        const rowSide = rowSelection.side === 'SELL' ? 'SELL' : 'BUY';
                        const rowQuantity = rowSelection.quantity ?? 1;
                        const ownedShares = Number(ownedSharesByTicker.get(ticker) ?? 0);
                        const style = actionStyle[String(signal.action ?? 'HOLD').toUpperCase()] ?? actionStyle.HOLD;
                        return (
                          <tr
                            key={`${signal.ticker}-${signal.reason}`}
                            onClick={() => setSelectedTradeTicker(ticker)}
                            className="cursor-pointer"
                            style={selectedTradeTicker === ticker ? { background: 'var(--accent-glow)' } : undefined}
                          >
                            <td className="font-semibold" style={{ color: 'var(--txt-primary)' }}>{ticker}</td>
                            <td>
                              <span
                                className="inline-flex items-center justify-center rounded-full text-[11px] font-semibold"
                                style={{
                                  background: style.bg,
                                  color: style.color,
                                  border: `1px solid ${style.border}`,
                                  minWidth: 54,
                                  height: 24,
                                  padding: '0 9px',
                                }}
                              >
                                {signal.action}
                              </span>
                            </td>
                            <td style={{ color: 'var(--txt-primary)' }}>{Number(signal.score ?? 0).toFixed(2)}</td>
                            <td style={{ color: 'var(--txt-primary)' }}>{Number(signal.confidence ?? 0).toFixed(2)}</td>
                            <td style={{ color: 'var(--txt-primary)' }}>{formatCurrency(Number(signal.lastPrice ?? 0), 2, 'USD')}</td>
                            <td>
                              <select
                                value={rowSide}
                                onChange={(event) => setTradeSide(ticker, event.target.value)}
                                className="input text-xs rounded-lg"
                                style={{ minHeight: 30, paddingLeft: 8, paddingRight: 24, maxWidth: 84 }}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <option value="BUY">BUY</option>
                                <option value="SELL">SELL</option>
                              </select>
                            </td>
                            <td>
                              <input
                                value={String(rowQuantity)}
                                onChange={(event) => setTradeQuantity(ticker, event.target.value)}
                                onBlur={() => {
                                  setTradeSelections((current) => ({
                                    ...current,
                                    [ticker]: {
                                      side: rowSide,
                                      quantity: toPositiveInt(current[ticker]?.quantity, 1),
                                    },
                                  }));
                                }}
                                className="input text-xs rounded-lg"
                                style={{ minHeight: 30, width: 82, paddingLeft: 8, paddingRight: 8 }}
                                inputMode="numeric"
                                onClick={(event) => event.stopPropagation()}
                              />
                            </td>
                            <td style={{ color: 'var(--txt-primary)' }}>
                              {rowSide === 'SELL'
                                ? ownedShares.toLocaleString('en-US', { maximumFractionDigits: 4 })
                                : '-'}
                            </td>
                            <td style={{ color: 'var(--txt-secondary)' }}>{signal.reason}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedSignal ? (
                  <div className="rounded-2xl px-4 py-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--txt-muted)' }}>
                          Selected execution
                        </p>
                        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--txt-primary)' }}>
                          {selectedTradeTicker} · {selectedTrade.side}
                        </p>
                        {selectedTrade.side === 'SELL' ? (
                          <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
                            Shares owned: {selectedOwnedShares.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--txt-muted)' }}>
                          Estimated Amount
                        </p>
                        <p className="text-base font-bold mt-1" style={{ color: 'var(--txt-primary)' }}>
                          {formatCurrency(selectedTradeAmount, 2, 'USD')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setTradeSide(selectedTradeTicker, 'BUY')}
                        className="inline-flex items-center justify-center rounded-xl text-xs font-semibold"
                        style={selectedTrade.side === 'BUY'
                          ? { color: 'white', background: 'var(--gain)', border: '1px solid var(--gain)', minWidth: 80, height: 30, padding: '0 10px' }
                          : { color: 'var(--gain)', background: 'var(--gain-bg)', border: '1px solid var(--gain-border)', minWidth: 80, height: 30, padding: '0 10px' }}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeSide(selectedTradeTicker, 'SELL')}
                        className="inline-flex items-center justify-center rounded-xl text-xs font-semibold"
                        style={selectedTrade.side === 'SELL'
                          ? { color: 'white', background: 'var(--loss)', border: '1px solid var(--loss)', minWidth: 80, height: 30, padding: '0 10px' }
                          : { color: 'var(--loss)', background: 'var(--loss-bg)', border: '1px solid var(--loss-border)', minWidth: 80, height: 30, padding: '0 10px' }}
                      >
                        SELL
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteTrade}
                        disabled={tradeLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-55"
                        style={{
                          background: selectedTrade.side === 'SELL' ? 'var(--loss)' : 'var(--gain)',
                          boxShadow: selectedTrade.side === 'SELL' ? 'var(--shadow-loss)' : 'var(--shadow-gain)',
                          minWidth: 158,
                          minHeight: 34,
                          padding: '0 14px',
                        }}
                      >
                        {tradeLoading ? <RiLoaderLine className="animate-spin" /> : <RiExchangeFundsLine />}
                        Execute {selectedTrade.side}
                      </button>
                    </div>

                    {tradeMessage ? (
                      <div
                        className="rounded-xl px-3 py-2 text-xs mt-3"
                        style={tradeMessage.type === 'success'
                          ? { background: 'var(--gain-bg)', color: 'var(--gain)', border: '1px solid var(--gain-border)' }
                          : { background: 'var(--loss-bg)', color: 'var(--loss)', border: '1px solid var(--loss-border)' }}
                      >
                        {tradeMessage.text}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {lastRun.disclaimer ? (
                  <div className="rounded-xl px-3 py-2 text-xs flex items-start gap-2" style={{ background: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <RiPriceTag3Line className="mt-0.5 shrink-0" />
                    <span>{lastRun.disclaimer}</span>
                  </div>
                ) : null}
              </div>
            )}
      </section>
    </div>
  );
}

function MetaPill({ label, value }) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--txt-muted)' }}>{label}</p>
      <p className="text-sm font-semibold mt-1" style={{ color: 'var(--txt-primary)' }}>{value}</p>
    </div>
  );
}
