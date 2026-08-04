import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadAllUsers, setSelectedUser } from '../../store/slices/userSlice';
import { loadAllStocks } from '../../store/slices/stocksSlice';
import { loadInvestments } from '../../store/slices/investmentSlice';
import { loadPortfolioSummary, loadStockWisePnL, loadChartData } from '../../store/slices/analyticsSlice';
import { RiUserLine, RiArrowDownSLine, RiLoaderLine } from 'react-icons/ri';

export default function UserSelector() {
  const dispatch = useDispatch();
  const { allUsers, loadingUsers, selectedUser } = useSelector((s) => s.user);

  useEffect(() => { dispatch(loadAllUsers()); }, [dispatch]);

  const handleSelect = (e) => {
    const id   = Number(e.target.value);
    const user = allUsers.find((u) => u.customerId === id);
    if (!user) return;
    dispatch(setSelectedUser(user));
    dispatch(loadAllStocks());
    dispatch(loadInvestments(id));
    dispatch(loadPortfolioSummary(id));
    dispatch(loadStockWisePnL(id));
    dispatch(loadChartData({ mode: 'portfolio', customerId: id, range: '1Y' }));
  };

  return (
    <div className="relative">
      {/* Icon left */}
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-10"
        style={{ color: 'var(--accent)' }}
      >
        {loadingUsers
          ? <RiLoaderLine className="animate-spin" />
          : <RiUserLine />
        }
      </span>

      <select
        id="user-selector"
        onChange={handleSelect}
        value={selectedUser?.customerId ?? ''}
        className="w-full appearance-none text-xs font-medium pl-8 pr-9 py-2.5 rounded-lg outline-none cursor-pointer transition-all duration-200"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-soft)',
          color: 'var(--txt-primary)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--border-active)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
        onBlur={(e)  => { e.target.style.borderColor = 'var(--border-soft)';   e.target.style.boxShadow = 'none'; }}
      >
        <option value="" disabled>Select user…</option>
        {allUsers.map((u) => (
          <option key={u.customerId} value={u.customerId}>{u.customerName}</option>
        ))}
      </select>

      {/* Chevron right */}
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-base"
        style={{ color: 'var(--txt-muted)' }}
      >
        <RiArrowDownSLine />
      </span>
    </div>
  );
}
