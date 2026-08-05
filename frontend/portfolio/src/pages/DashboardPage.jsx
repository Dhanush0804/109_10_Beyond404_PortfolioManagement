import { Suspense, lazy, useMemo } from 'react';
import { useSelector } from 'react-redux';
import StatsSummaryBar from '../components/dashboard/StatsSummaryBar';
import TotalHoldingCard from '../components/dashboard/TotalHoldingCard';
import MyPortfolioCards from '../components/dashboard/MyPortfolioCards';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import HoldingsPieChart from '../components/dashboard/HoldingsPieChart';
import PortfolioOverviewTable from '../components/dashboard/PortfolioOverviewTable';

const HoldingsTreemap = lazy(() => import('../components/dashboard/HoldingsTreemap'));

export default function DashboardPage() {
  const { selectedUser } = useSelector((s) => s.user);
  const {
    summary,
    stockWise,
    chartData,
    loadingSummary,
    loadingStockWise,
    loadingChart,
  } = useSelector((s) => s.analytics);
  const { loading: loadingHoldings } = useSelector((s) => s.assetHoldings);

  const canRenderHoldingsTreemap = useMemo(() => {
    if (!selectedUser) return false;
    if (loadingSummary || loadingStockWise || loadingChart || loadingHoldings) return false;
    if (!summary) return false;
    if (!Array.isArray(stockWise)) return false;
    if (!Array.isArray(chartData) || chartData.length === 0) return false;
    return true;
  }, [selectedUser, loadingSummary, loadingStockWise, loadingChart, loadingHoldings, summary, stockWise, chartData]);

  return (
    <div className="page-container anim-fade-in" style={{ maxWidth: 1440, margin: '0 auto' }}>

      {/* ── Page header ── */}
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--txt-primary)' }}>
          {selectedUser ? (
            <>Good day, <span style={{ color: 'var(--accent)' }}>{selectedUser.customerName.split(' ')[0]}</span> 👋</>
          ) : (
            'Portfolio Dashboard'
          )}
        </h1>
        <p className="text-xs" style={{ color: 'var(--txt-secondary)', marginTop: 4 }}>
          {selectedUser
            ? 'Here\'s a live overview of your stock portfolio'
            : 'Use the top-right user menu to select a user and load portfolio data'}
        </p>
      </div>

      {/* ── Stats bar ── */}
      <StatsSummaryBar />

      {/* ── Holdings + Portfolio cards ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,320px)_1fr] gap-4 items-stretch">
        <TotalHoldingCard />
        <MyPortfolioCards />
      </div>

      {/* ── Chart ── */}
      <PortfolioChart />

      {/* ── Holdings Heatmap (lazy after Redux data is ready) ── */}
      {canRenderHoldingsTreemap ? (
        <Suspense
          fallback={(
            <div
              className="rounded-2xl"
              style={{
                minHeight: 300,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            />
          )}
        >
          <HoldingsTreemap />
        </Suspense>
      ) : null}

      {/* ── Holdings Distribution ── */}
      <HoldingsPieChart />

      {/* ── Overview table ── */}
      <PortfolioOverviewTable />

    </div>
  );
}
