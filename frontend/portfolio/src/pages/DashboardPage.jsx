import { useSelector } from 'react-redux';
import UserSelector from '../components/dashboard/UserSelector';
import StatsSummaryBar from '../components/dashboard/StatsSummaryBar';
import TotalHoldingCard from '../components/dashboard/TotalHoldingCard';
import MyPortfolioCards from '../components/dashboard/MyPortfolioCards';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import PortfolioOverviewTable from '../components/dashboard/PortfolioOverviewTable';

export default function DashboardPage() {
  const { selectedUser } = useSelector((s) => s.user);

  return (
    <div className="p-6 flex flex-col gap-6 anim-fade-in max-w-[1600px] mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--txt-primary)' }}>
            {selectedUser ? (
              <>Good day, <span style={{ color: 'var(--accent)' }}>{selectedUser.customerName.split(' ')[0]}</span> 👋</>
            ) : (
              'Portfolio Dashboard'
            )}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
            {selectedUser
              ? 'Here\'s a live overview of your stock portfolio'
              : 'Select a user from the dropdown to load their portfolio data'}
          </p>
        </div>
        <div className="w-64 z-20 relative">
          <UserSelector />
        </div>
      </div>

      {/* ── Stats bar ── */}
      <StatsSummaryBar />

      {/* ── Holdings + Portfolio cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
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
