import { NavLink } from 'react-router-dom';
import {
  RiDashboardLine, RiLineChartLine, RiBarChartBoxLine, RiStockLine,
  RiTeamLine, RiCustomerService2Line, RiShieldLine, RiUserLine,
} from 'react-icons/ri';
import { TbChartDonut4 } from 'react-icons/tb';

const MAIN_NAV = [
  { to: '/',          icon: RiDashboardLine,      label: 'Dashboard'  },
  { to: '/portfolio', icon: RiLineChartLine,       label: 'Portfolio'  },
  { to: '/analysis',  icon: RiBarChartBoxLine,     label: 'Analysis'   },
  { to: '/market',    icon: RiStockLine,            label: 'Market'     },
  { to: '/users',     icon: RiUserLine,             label: 'User Management' },
];

const SUPPORT_NAV = [
  { to: '/community', icon: RiTeamLine,             label: 'Community'    },
  { to: '/help',      icon: RiCustomerService2Line,  label: 'Help & Support' },
];

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
        ${isActive
          ? 'text-white'
          : 'hover:text-[var(--txt-primary)]'
        }`
      }
      style={({ isActive }) => isActive ? {
        background: 'var(--accent)',
        boxShadow: 'var(--shadow-accent)',
        color: '#fff',
      } : {
        color: 'var(--txt-secondary)',
      }}
    >
      <Icon className="text-base shrink-0" />
      <span className="tracking-tight">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 flex flex-col z-40 overflow-y-auto"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-[18px]"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'var(--accent)',
            boxShadow: 'var(--shadow-accent)',
          }}
        >
          <TbChartDonut4 className="text-white text-lg" />
        </div>
        <div>
          <p className="font-bold text-[15px] leading-none" style={{ color: 'var(--txt-primary)' }}>
            Sto<span style={{ color: 'var(--accent)' }}>vest</span>
          </p>
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--txt-muted)' }}>
            Portfolio Manager
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p
          className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
          style={{ color: 'var(--txt-muted)' }}
        >
          Main Menu
        </p>
        {MAIN_NAV.map((n) => <NavItem key={n.to} {...n} />)}

        <div className="pt-5">
          <p
            className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
            style={{ color: 'var(--txt-muted)' }}
          >
            Support
          </p>
          {SUPPORT_NAV.map((n) => <NavItem key={n.to} {...n} />)}
        </div>
      </nav>

      {/* Bottom badge */}
      <div
        className="px-4 py-4"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <RiShieldLine className="text-sm shrink-0" style={{ color: 'var(--accent)' }} />
          <div>
            <p className="text-[10px] font-semibold" style={{ color: 'var(--txt-primary)' }}>Beyond404</p>
            <p className="text-[9px]" style={{ color: 'var(--txt-muted)' }}>© 2024 · v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
