import { useSelector } from 'react-redux';
import { RiArrowUpLine, RiArrowDownLine, RiPulseLine } from 'react-icons/ri';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import SectionLoader from '../common/SectionLoader';

export default function TotalHoldingCard() {
  const { summary, loadingSummary } = useSelector((s) => s.analytics);
  const isGain = (summary?.netPnL ?? 0) >= 0;

  return (
    <SectionLoader loading={loadingSummary} minHeight={180}>
      {summary ? (
        <div
          className="rounded-xl p-5 flex flex-col gap-3 anim-slide-up relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Decorative glow blob */}
          <div
            className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
            style={{
              background: isGain ? 'var(--gain-bg)' : 'var(--loss-bg)',
              filter: 'blur(24px)',
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--txt-muted)' }}>
              Total Holding
            </p>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold"
              style={{
                background: 'var(--accent-glow)',
                border: '1px solid var(--border-active)',
                color: 'var(--accent)',
              }}
            >
              <RiPulseLine className="text-xs" /> LIVE
            </span>
          </div>

          {/* Big value */}
          <div>
            <p
              className="text-3xl font-extrabold tracking-tight anim-count"
              style={{ color: 'var(--txt-primary)' }}
            >
              {formatCurrency(summary.currentValue)}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm"
                style={{
                  background: isGain ? 'var(--gain-bg)' : 'var(--loss-bg)',
                  border: `1px solid ${isGain ? 'var(--gain-border)' : 'var(--loss-border)'}`,
                  color: isGain ? 'var(--gain)' : 'var(--loss)',
                }}
              >
                {isGain ? <RiArrowUpLine /> : <RiArrowDownLine />}
                {formatPercent(summary.returnPercent)}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--txt-secondary)' }}>
                {isGain ? '+' : ''}{formatCurrency(summary.netPnL)} all time
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-4 pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            {[
              { label: 'Invested',  val: formatCurrency(summary.totalInvested), color: 'var(--txt-primary)' },
              { label: 'Positions', val: summary.totalPositions ?? '—',         color: 'var(--txt-primary)' },
              { label: 'Today P&L', val: (isGain ? '+' : '') + formatCurrency(summary.netPnL), color: isGain ? 'var(--gain)' : 'var(--loss)' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--txt-muted)' }}>
                  {label}
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-5 flex flex-col items-center justify-center min-h-[160px] gap-2"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <RiPulseLine style={{ color: 'var(--txt-muted)' }} className="text-base" />
          </div>
          <p className="text-xs" style={{ color: 'var(--txt-muted)' }}>Select a user to view holdings</p>
        </div>
      )}
    </SectionLoader>
  );
}
