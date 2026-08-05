import { NavLink } from 'react-router-dom';
import {
  RiDashboardLine, RiLineChartLine, RiBarChartBoxLine,
  RiTeamLine, RiCustomerService2Line, RiShieldLine, RiUserLine,
} from 'react-icons/ri';
import { TbChartDonut4 } from 'react-icons/tb';

const MAIN_NAV = [
  { to: '/',          icon: RiDashboardLine,      label: 'Dashboard'  },
  { to: '/portfolio', icon: RiLineChartLine,       label: 'Portfolio'  },
  { to: '/analysis',  icon: RiBarChartBoxLine,     label: 'Analysis'   },
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
        `relative flex items-center rounded-xl text-sm font-semibold transition-all duration-200 group
        ${isActive
          ? 'text-white'
          : 'hover:text-[var(--txt-primary)]'
        }`
      }
      style={({ isActive }) => isActive ? {
        background: 'var(--accent)',
        boxShadow: 'var(--shadow-accent)',
        color: '#fff',
        paddingTop: '0.95rem',
        paddingBottom: '0.95rem',
        paddingLeft: '1.25rem',
        paddingRight: '1.25rem',
        gap: '0.9rem',
      } : {
        color: 'var(--txt-secondary)',
        paddingTop: '0.95rem',
        paddingBottom: '0.95rem',
        paddingLeft: '1.25rem',
        paddingRight: '1.25rem',
        gap: '0.9rem',
      }}
    >
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <Icon className="text-base shrink-0" />
      </span>
      <span className="tracking-tight text-sm font-semibold leading-none">{label}</span>
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
        className="flex items-center gap-4 px-5"
        style={{
          paddingTop: '1.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '0.25rem',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'var(--accent)',
            boxShadow: 'var(--shadow-accent)',
          }}
        >
          <TbChartDonut4 className="text-white text-[22px]" />
        </div>
        <div>
          <p className="font-extrabold text-[18px] leading-none tracking-tight" style={{ color: 'var(--txt-primary)' }}>
            Sto<span style={{ color: 'var(--accent)' }}>vest</span>
          </p>
          <p className="text-[11px] mt-1.5 font-medium tracking-wide leading-tight" style={{ color: 'var(--txt-muted)' }}>
            Portfolio Manager
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 px-4"
        style={{
          paddingTop: '1.6rem',
          paddingBottom: '2rem',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.18em] px-2"
          style={{
            color: 'var(--txt-muted)',
            marginTop: '0.45rem',
            marginBottom: '0.95rem',
          }}
        >
          Main Menu
        </p>
        <div className="flex flex-col" style={{ gap: '0.8rem' }}>
          {MAIN_NAV.map((n) => <NavItem key={n.to} {...n} />)}
        </div>

        <div style={{ marginTop: '2.3rem' }}>
          <p
            className="text-xs font-bold uppercase tracking-[0.18em] px-2"
            style={{
              color: 'var(--txt-muted)',
              marginBottom: '0.95rem',
            }}
          >
            Support
          </p>
          <div className="flex flex-col" style={{ gap: '0.8rem' }}>
            {SUPPORT_NAV.map((n) => <NavItem key={n.to} {...n} />)}
          </div>
        </div>
      </nav>

      {/* Bottom badge */}
      <div
        className="px-4 py-4"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <RiShieldLine className="text-base shrink-0" style={{ color: 'var(--accent)' }} />
          <div>
            <p className="text-xs font-bold leading-tight" style={{ color: 'var(--txt-primary)' }}>Beyond404</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--txt-muted)' }}>© 2024 · v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
