import { useSelector } from 'react-redux';
import StatsSummaryBar from '../components/dashboard/StatsSummaryBar';
import TotalHoldingCard from '../components/dashboard/TotalHoldingCard';
import MyPortfolioCards from '../components/dashboard/MyPortfolioCards';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import PortfolioOverviewTable from '../components/dashboard/PortfolioOverviewTable';

export default function DashboardPage() {
  const { selectedUser } = useSelector((s) => s.user);

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

      {/* ── Overview table ── */}
      <PortfolioOverviewTable />

    </div>
  );
}
