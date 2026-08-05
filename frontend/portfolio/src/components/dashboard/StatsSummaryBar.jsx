import { useSelector } from 'react-redux';
import { RiArrowUpLine, RiArrowDownLine, RiWalletLine, RiPieChartLine, RiExchangeLine } from 'react-icons/ri';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import SectionLoader from '../common/SectionLoader';

const STAT_CONFIGS = [
  {
    key:       'totalProfit',
    label:     'Total Profit',
    icon:      RiArrowUpLine,
    colorKey:  'gain',
  },
  {
    key:       'totalLoss',
    label:     'Total Loss',
    icon:      RiArrowDownLine,
    colorKey:  'loss',
  },
  {
    key:       'netPnL',
    label:     'Net P&L',
    icon:      RiExchangeLine,
    colorKey:  'dynamic', // computed based on sign
  },
  {
    key:       'totalInvested',
    label:     'Invested',
    icon:      RiWalletLine,
    colorKey:  'accent',
  },
  {
    key:       'returnPercent',
    label:     'Return %',
    icon:      RiPieChartLine,
    colorKey:  'warn',
    format:    'percent',
  },
];

export default function StatsSummaryBar() {
  const { summary, loadingSummary } = useSelector((s) => s.analytics);

  return (
    <SectionLoader loading={loadingSummary} minHeight={88}>
      {!summary ? (
        <div
          className="rounded-2xl p-4 flex items-center justify-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            minHeight: 88,
          }}
        >
          <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>Select a user to view statistics</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAT_CONFIGS.map((cfg, i) => {
            const raw  = summary[cfg.key] ?? 0;
            const val  = cfg.format === 'percent' ? formatPercent(raw) : formatCurrency(raw);
            const Icon = cfg.icon;

            let color, bg, border;
            if (cfg.colorKey === 'gain')    { color = 'var(--gain)';  bg = 'var(--gain-bg)';  border = 'var(--gain-border)'; }
            else if (cfg.colorKey === 'loss')   { color = 'var(--loss)';  bg = 'var(--loss-bg)';  border = 'var(--loss-border)'; }
            else if (cfg.colorKey === 'dynamic') {
              const isPos = raw >= 0;
              color  = isPos ? 'var(--gain)'  : 'var(--loss)';
              bg     = isPos ? 'var(--gain-bg)' : 'var(--loss-bg)';
              border = isPos ? 'var(--gain-border)' : 'var(--loss-border)';
            }
            else if (cfg.colorKey === 'accent') { color = 'var(--accent)'; bg = 'var(--accent-glow)'; border = 'var(--border-active)'; }
            else {
              color  = 'var(--warn)'; bg = 'var(--warn-bg)'; border = 'rgba(245,158,11,0.25)';
            }

            return (
              <div
                key={cfg.key}
                className="rounded-xl p-4 flex flex-col gap-2 anim-slide-up transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--txt-muted)' }}
                  >
                    {cfg.label}
                  </p>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <Icon className="text-[10px]" style={{ color }} />
                  </div>
                </div>
                <p className="text-base font-extrabold anim-count" style={{ color }}>
                  {val}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </SectionLoader>
  );
}
