import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadUserById } from '../store/slices/userSlice';
import { loadInvestments } from '../store/slices/investmentSlice';
import {
  RiArrowLeftLine, RiShieldCheckLine, RiExchangeLine,
  RiCalendarLine, RiUserLine,
} from 'react-icons/ri';
import { formatCurrency, formatDate } from '../utils/formatters';
import SectionLoader from '../components/common/SectionLoader';

const RISK_COLORS = {
  High:   { color: 'var(--loss)', bg: 'var(--loss-bg)', border: 'var(--loss-border)' },
  Medium: { color: 'var(--warn)', bg: 'var(--warn-bg)', border: 'rgba(245,158,11,0.25)' },
  Low:    { color: 'var(--gain)', bg: 'var(--gain-bg)', border: 'var(--gain-border)' },
};

export default function UserProfilePage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { selectedUser, loadingProfile } = useSelector((s) => s.user);
  const { items: investments, loading: loadingInv } = useSelector((s) => s.investments);

  useEffect(() => {
    if (selectedUser?.customerId) {
      dispatch(loadUserById(selectedUser.customerId));
      dispatch(loadInvestments(selectedUser.customerId));
    }
  }, [selectedUser?.customerId]);

  const totalBought = investments
    .filter((t) => t.transactionType === 'BUY')
    .reduce((s, t) => s + Number(t.transactionAmount), 0);
  const totalSold = investments
    .filter((t) => t.transactionType === 'SELL')
    .reduce((s, t) => s + Number(t.transactionAmount), 0);

  const initials  = selectedUser?.customerName?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '?';
  const riskStyle = RISK_COLORS[selectedUser?.riskLevel] ?? RISK_COLORS.Medium;

  return (
    <div className="page-container anim-fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
        style={{ color: 'var(--txt-secondary)' }}
      >
        <RiArrowLeftLine /> Back to Dashboard
      </button>

      <SectionLoader loading={loadingProfile} minHeight={200}>
        {!selectedUser ? (
          <div
            className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <RiUserLine className="text-2xl" style={{ color: 'var(--txt-muted)' }} />
            </div>
            <p style={{ color: 'var(--txt-muted)' }}>No user selected</p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Profile hero card */}
            <div className="hero-section">
              {/* Decorative blob */}
              <div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'var(--accent-glow)', filter: 'blur(32px)' }}
              />

              <div className="flex items-start gap-5 flex-wrap relative z-10">
                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                    boxShadow: 'var(--shadow-accent)',
                  }}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold" style={{ color: 'var(--txt-primary)' }}>
                    {selectedUser.customerName}
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--txt-secondary)' }}>
                    Customer ID: <span style={{ color: 'var(--txt-primary)', fontWeight: 600 }}>#{selectedUser.customerId}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{
                        background: riskStyle.bg,
                        border: `1px solid ${riskStyle.border}`,
                        color: riskStyle.color,
                      }}
                    >
                      <RiShieldCheckLine />
                      {selectedUser.riskLevel} Risk
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{
                        background: 'var(--accent-glow)',
                        border: '1px solid var(--border-active)',
                        color: 'var(--accent)',
                      }}
                    >
                      <RiExchangeLine />
                      {investments.length} Transactions
                    </span>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex gap-6 flex-wrap">
                  {[
                    { label: 'Total Bought', val: formatCurrency(totalBought), color: 'var(--gain)' },
                    { label: 'Total Sold',   val: formatCurrency(totalSold),   color: 'var(--loss)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-muted)' }}>
                        {label}
                      </p>
                      <p className="text-lg font-extrabold mt-1" style={{ color }}>
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transaction history */}
            <div className="card p-5">
              <p className="text-sm font-bold mb-5" style={{ color: 'var(--txt-primary)' }}>
                Transaction History
              </p>

              <SectionLoader loading={loadingInv} minHeight={200}>
                {investments.length === 0 ? (
                  <div
                    className="flex items-center justify-center rounded-xl py-12"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>No transactions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {['#', 'Stock ID', 'Type', 'Amount', 'Date'].map((h) => (
                            <th key={h}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map((inv, i) => {
                          const isBuy = inv.transactionType === 'BUY';
                          return (
                            <tr
                              key={inv.assetId ?? i}
                              className="transition-colors"
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <td className="py-3.5 pr-6 text-xs" style={{ color: 'var(--txt-muted)' }}>
                                {i + 1}
                              </td>
                              <td className="py-3.5 pr-6">
                                <span
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                                  style={{
                                    background: 'var(--accent-glow)',
                                    color: 'var(--accent)',
                                    border: '1px solid var(--border-active)',
                                  }}
                                >
                                  #{inv.stockId}
                                </span>
                              </td>
                              <td className="py-3.5 pr-6">
                                <span
                                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
                                  style={{
                                    background: isBuy ? 'var(--gain-bg)' : 'var(--loss-bg)',
                                    border: `1px solid ${isBuy ? 'var(--gain-border)' : 'var(--loss-border)'}`,
                                    color: isBuy ? 'var(--gain)' : 'var(--loss)',
                                  }}
                                >
                                  {inv.transactionType}
                                </span>
                              </td>
                              <td
                                className="py-3.5 pr-6 text-xs font-bold"
                                style={{
                                  color: isBuy ? 'var(--gain)' : 'var(--loss)',
                                }}
                              >
                                {isBuy ? '+' : '−'}{formatCurrency(inv.transactionAmount)}
                              </td>
                              <td className="py-3.5 text-xs" style={{ color: 'var(--txt-secondary)' }}>
                                <span className="flex items-center gap-1.5">
                                  <RiCalendarLine style={{ color: 'var(--txt-muted)' }} />
                                  {formatDate(inv.transactionTimestamp)}
                                </span>
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
          </div>
        )}
      </SectionLoader>
    </div>
  );
}
