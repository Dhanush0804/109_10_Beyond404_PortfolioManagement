import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RiToolsLine } from 'react-icons/ri';
import Sidebar        from './components/layout/Sidebar';
import Topbar         from './components/layout/Topbar';
import DashboardPage  from './pages/DashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import UserManagementPage from './pages/UserManagementPage';
import PortfolioPage from './pages/PortfolioPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Fixed topbar */}
      <Topbar />

      {/* Scrollable page content */}
      <main
        className="app-main pb-12"
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--topbar-height)',
          background: 'var(--bg-canvas)',
        }}
      >
        <Routes>
          <Route path="/"         element={<DashboardPage />} />
          <Route path="/profile"  element={<UserProfilePage />} />
          <Route path="/users"    element={<UserManagementPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/analysis"  element={<ComingSoon label="Analysis" />} />
          <Route path="/community" element={<ComingSoon label="Community" />} />
          <Route path="/help"      element={<ComingSoon label="Help & Support" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 anim-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-active)' }}
      >
        <RiToolsLine className="text-2xl" style={{ color: 'var(--accent)' }} />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: 'var(--txt-primary)' }}>{label}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--txt-secondary)' }}>
          This section is under development
        </p>
      </div>
    </div>
  );
}
