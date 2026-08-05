import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RiBellLine, RiSearchLine, RiUserLine, RiSunLine, RiMoonLine, RiArrowDownSLine } from 'react-icons/ri';
import { useTheme } from '../../contexts/ThemeContext';
import UserSelector from '../dashboard/UserSelector';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const selectedUser = useSelector((s) => s.user.selectedUser);
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const initials = selectedUser
    ? selectedUser.customerName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center gap-3 px-6"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--topbar-height)',
        background: 'var(--bg-overlay)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Pill nav */}
      <div
        className="flex items-center gap-0.5 px-1.5 py-1 rounded-xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        {['Wallets', 'Tools'].map((tab) => (
          <button
            key={tab}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-100"
            style={{ color: 'var(--txt-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.color = 'var(--txt-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--txt-secondary)';
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-[360px]">
        <div className="relative">
          <RiSearchLine
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: 'var(--txt-muted)' }}
          />
          <input
            type="text"
            placeholder="Search stocks, AI insights…"
            className="input w-full text-sm pl-9 pr-4 py-2 rounded-full"
            style={{ fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--txt-secondary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--txt-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
        >
          {theme === 'dark' ? <RiSunLine className="text-base" /> : <RiMoonLine className="text-base" />}
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--txt-secondary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--txt-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
        >
          <RiBellLine className="text-base" />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--loss)' }}
          />
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((current) => !current)}
            className="flex items-center gap-2.5 rounded-xl pl-1.5 pr-3 py-1.5 transition-all duration-200"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: selectedUser ? 'var(--accent)' : 'var(--bg-card)', boxShadow: selectedUser ? 'var(--shadow-accent)' : 'none' }}
            >
              {initials ?? <RiUserLine style={{ color: 'var(--txt-muted)' }} />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[12px] font-semibold leading-none" style={{ color: 'var(--txt-primary)' }}>
                {selectedUser?.customerName ?? 'Select User'}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--txt-muted)' }}>
                {selectedUser ? `Risk: ${selectedUser.riskLevel}` : 'No user selected'}
              </p>
            </div>
            <RiArrowDownSLine className={`text-base transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--txt-muted)' }} />
          </button>

          {isUserMenuOpen ? (
            <div
              className="absolute right-0 top-[calc(100%+10px)] w-[320px] rounded-2xl p-3 z-50"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-3 px-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-muted)' }}>
                    Current User
                  </p>
                  <p className="text-sm font-semibold mt-1" style={{ color: 'var(--txt-primary)' }}>
                    {selectedUser?.customerName ?? 'No user selected'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (selectedUser) navigate('/profile');
                  }}
                  disabled={!selectedUser}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-50"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--border-active)' }}
                >
                  View profile
                </button>
              </div>

              <UserSelector onSelected={() => setIsUserMenuOpen(false)} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
