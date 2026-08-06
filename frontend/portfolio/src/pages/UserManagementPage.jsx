import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  RiAddLine,
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiLoaderLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiUserLine,
} from 'react-icons/ri';
import SectionLoader from '../components/common/SectionLoader';
import { formatCurrency, formatDate } from '../utils/formatters';
import { fetchPaginatedInvestmentHistory } from '../api/investmentApi';
import { addUser, clearUserCreateState, deleteUser, loadAllUsers, setSelectedUser } from '../store/slices/userSlice';

const RISK_OPTIONS = ['High', 'Medium', 'Low'];

const RISK_STYLES = {
  High: { color: 'var(--loss)', bg: 'var(--loss-bg)', border: 'var(--loss-border)' },
  Medium: { color: 'var(--warn)', bg: 'var(--warn-bg)', border: 'rgba(245,158,11,0.25)' },
  Low: { color: 'var(--gain)', bg: 'var(--gain-bg)', border: 'var(--gain-border)' },
};

export default function UserManagementPage() {
  const PAGE_SIZE = 25;
  const dispatch = useDispatch();
  const {
    allUsers,
    loadingUsers,
    creatingUser,
    deletingUser,
    createError,
    deleteError,
    lastCreatedUserName,
    lastDeletedUserName,
    selectedUser,
  } = useSelector((state) => state.user);
  const [form, setForm] = useState({ customerName: '', riskLevel: 'Medium' });
  const [transactionPage, setTransactionPage] = useState(0);
  const [userTransactions, setUserTransactions] = useState({ items: [], totalItems: 0, page: 0, size: PAGE_SIZE, totalPages: 0 });
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null,
    confirmText: '',
  });

  useEffect(() => {
    dispatch(loadAllUsers());

    return () => {
      dispatch(clearUserCreateState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!selectedUser?.customerId) {
      setUserTransactions({ items: [], totalItems: 0, page: 0, size: PAGE_SIZE, totalPages: 0 });
      setTransactionPage(0);
      return;
    }

    let isCancelled = false;
    setLoadingTransactions(true);

    fetchPaginatedInvestmentHistory({
      customerId: selectedUser.customerId,
      page: transactionPage,
      size: PAGE_SIZE,
    }).then((data) => {
      if (!isCancelled) {
        setUserTransactions(data);
      }
    }).finally(() => {
      if (!isCancelled) {
        setLoadingTransactions(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedUser?.customerId, transactionPage]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const customerName = form.customerName.trim();

    if (!customerName || creatingUser) {
      return;
    }

    const result = await dispatch(addUser({ customerName, riskLevel: form.riskLevel }));
    if (addUser.fulfilled.match(result)) {
      setForm({ customerName: '', riskLevel: 'Medium' });
    }
  };

  const openDeleteDialog = (user) => {
    setDeleteDialog({
      open: true,
      user,
      confirmText: '',
    });
  };

  const closeDeleteDialog = () => {
    if (deletingUser) return;
    setDeleteDialog({
      open: false,
      user: null,
      confirmText: '',
    });
  };

  const handleDeleteConfirm = async (event) => {
    event.preventDefault();
    if (!deleteDialog.user || deletingUser) return;

    const typedName = deleteDialog.confirmText.trim();
    if (typedName !== deleteDialog.user.customerName) return;

    const result = await dispatch(deleteUser({
      customerId: deleteDialog.user.customerId,
      customerName: deleteDialog.user.customerName,
    }));

    if (deleteUser.fulfilled.match(result)) {
      closeDeleteDialog();
    }
  };

  const isDeleteNameMatch = deleteDialog.user
    ? deleteDialog.confirmText.trim() === deleteDialog.user.customerName
    : false;

  const handleRefreshUsers = () => {
    if (loadingUsers || creatingUser || deletingUser) return;
    dispatch(loadAllUsers());
  };

  const handleRefreshTransactions = () => {
    if (!selectedUser?.customerId || loadingTransactions) return;
    setLoadingTransactions(true);
    fetchPaginatedInvestmentHistory({
      customerId: selectedUser.customerId,
      page: transactionPage,
      size: PAGE_SIZE,
    }).then((data) => {
      setUserTransactions(data);
    }).finally(() => {
      setLoadingTransactions(false);
    });
  };

  return (
    <div className="page-container anim-fade-in" style={{ maxWidth: 1440, margin: '0 auto' }}>
      <section className="hero-section">
        <div className="relative flex items-start justify-between gap-5 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] font-bold" style={{ color: 'var(--accent-light)' }}>
              Main Menu / User Management
            </p>
            <h1 className="text-2xl font-bold mt-2" style={{ color: 'var(--txt-primary)' }}>
              Manage customers and onboarding
            </h1>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--txt-secondary)' }}>
              Review current users and add a new customer with a generated UUID payload and a controlled risk profile.
            </p>
          </div>

          <div
            className="min-w-[240px] rounded-2xl"
            style={{ background: 'rgba(10,13,20,0.72)', border: '1px solid var(--border-soft)', padding: '14px 16px' }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--txt-muted)' }}>
              Current users
            </p>
            <p className="text-3xl font-extrabold mt-2" style={{ color: 'var(--txt-primary)' }}>
              {allUsers.length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
              Live rows loaded from the customer API.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_minmax(340px,420px)] gap-5 items-start">
        <section className="card" style={{ padding: '16px 18px' }}>
          <div className="flex items-center justify-between gap-4" style={{ marginBottom: 12, paddingInline: 2 }}>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Current users</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
                Click a row to make that customer the active user in the app.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshUsers}
                disabled={loadingUsers || creatingUser || deletingUser}
                className="inline-flex items-center justify-center rounded-md text-[10px] font-semibold disabled:opacity-50"
                style={{
                  width: 28,
                  height: 28,
                  color: 'var(--txt-secondary)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                }}
                title="Refresh users"
              >
                <RiRefreshLine className={loadingUsers ? 'animate-spin' : ''} />
              </button>
              {loadingUsers ? <RiLoaderLine className="animate-spin text-lg" style={{ color: 'var(--accent)' }} /> : null}
            </div>
          </div>

          {allUsers.length === 0 && !loadingUsers ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}
            >
              <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto" style={{ marginTop: 2 }}>
              <table className="data-table user-mgmt-table">
                <thead>
                  <tr>
                    {['User', 'Customer ID', 'Risk Level', 'Status', 'Actions'].map((heading) => (
                      <th key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => {
                    const isActive = selectedUser?.customerId === user.customerId;
                    const riskStyle = RISK_STYLES[user.riskLevel] ?? RISK_STYLES.Medium;

                    return (
                      <tr
                        key={user.customerId}
                        className="cursor-pointer transition-colors"
                        onClick={() => {
                          dispatch(setSelectedUser(user));
                          setTransactionPage(0);
                        }}
                        onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--bg-elevated)'; }}
                        onMouseLeave={(event) => { event.currentTarget.style.background = isActive ? 'rgba(26,110,247,0.08)' : 'transparent'; }}
                        style={isActive ? { background: 'rgba(26,110,247,0.08)' } : undefined}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
                            >
                              <RiUserLine />
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--txt-primary)' }}>{user.customerName}</p>
                              <p className="text-xs" style={{ color: 'var(--txt-secondary)' }}>Customer profile</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-xs font-medium" style={{ color: 'var(--txt-secondary)' }}>
                          #{user.customerId}
                        </td>
                        <td>
                          <span
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: riskStyle.bg,
                              border: `1px solid ${riskStyle.border}`,
                              color: riskStyle.color,
                              minWidth: 84,
                              height: 28,
                              padding: '0 10px',
                            }}
                          >
                            <RiShieldCheckLine />
                            {user.riskLevel}
                          </span>
                        </td>
                        <td>
                          <span
                            className="inline-flex items-center justify-center gap-1 rounded-full text-[11px] font-semibold"
                            style={isActive
                              ? { background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--border-active)', minWidth: 86, height: 24, padding: '0 10px' }
                              : { background: 'transparent', color: 'var(--txt-muted)', border: '1px solid var(--border-subtle)', minWidth: 86, height: 24, padding: '0 10px' }}
                          >
                            {isActive ? 'Active user' : 'Available'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDeleteDialog(user);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-85"
                            style={{
                              color: 'var(--loss)',
                              background: 'var(--loss-bg)',
                              border: '1px solid var(--loss-border)',
                              minWidth: 82,
                              height: 28,
                              padding: '0 10px',
                            }}
                          >
                            <RiDeleteBinLine />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card sticky top-[calc(var(--topbar-height)+20px)]" style={{ padding: '18px 20px' }}>
          <div className="flex items-start gap-3" style={{ marginBottom: 14 }}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
            >
              <RiAddLine className="text-base" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Add user</h2>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginBottom: 12 }} />

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'var(--txt-secondary)' }}>Customer name</span>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="input text-sm rounded-xl"
                style={{ height: 38, paddingLeft: 12, paddingRight: 12 }}
                maxLength={100}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'var(--txt-secondary)' }}>Risk level</span>
              <select
                name="riskLevel"
                value={form.riskLevel}
                onChange={handleChange}
                className="input text-sm rounded-xl"
                style={{ height: 38, paddingLeft: 12, paddingRight: 34 }}
              >
                {RISK_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            {createError ? (
              <div
                className="rounded-2xl px-3 py-3 text-sm"
                style={{ background: 'var(--loss-bg)', color: 'var(--loss)', border: '1px solid var(--loss-border)' }}
              >
                {createError}
              </div>
            ) : null}

            {lastCreatedUserName ? (
              <div
                className="rounded-2xl px-3 py-3 text-sm flex items-center gap-2"
                style={{ background: 'var(--gain-bg)', color: 'var(--gain)', border: '1px solid var(--gain-border)' }}
              >
                <RiCheckLine />
                {lastCreatedUserName} was added successfully.
              </div>
            ) : null}

            {lastDeletedUserName ? (
              <div
                className="rounded-2xl px-3 py-3 text-sm flex items-center gap-2"
                style={{ background: 'var(--gain-bg)', color: 'var(--gain)', border: '1px solid var(--gain-border)' }}
              >
                <RiCheckLine />
                {lastDeletedUserName} was deleted successfully.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={creatingUser || !form.customerName.trim()}
              className="mt-1 inline-flex items-center justify-center gap-2 px-4 rounded-2xl text-sm font-semibold text-white transition-opacity disabled:opacity-55 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)', minHeight: 38 }}
            >
              {creatingUser ? <RiLoaderLine className="animate-spin" /> : <RiAddLine />}
              {creatingUser ? 'Adding user...' : 'Add user'}
            </button>
          </form>
        </section>
      </div>

      <section className="card" style={{ padding: '16px 18px' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap" style={{ marginBottom: 12, paddingInline: 2 }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>User transactions</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
              {selectedUser ? `Showing transactions for ${selectedUser.customerName}` : 'Select a user to view transaction history'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshTransactions}
              disabled={!selectedUser?.customerId || loadingTransactions}
              className="inline-flex items-center justify-center rounded-md text-[10px] font-semibold disabled:opacity-50"
              style={{
                width: 28,
                height: 28,
                color: 'var(--txt-secondary)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
              }}
              title="Refresh transactions"
            >
              <RiRefreshLine className={loadingTransactions ? 'animate-spin' : ''} />
            </button>
            {selectedUser ? (
              <p className="text-xs font-semibold" style={{ color: 'var(--txt-muted)' }}>
                Total: {userTransactions.totalItems}
              </p>
            ) : null}
          </div>
        </div>

        <SectionLoader loading={loadingTransactions} minHeight={260}>
          {!selectedUser ? (
            <div className="rounded-2xl px-4 py-12 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}>
              <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>Select a user to view all transactions.</p>
            </div>
          ) : userTransactions.items.length === 0 ? (
            <div className="rounded-2xl px-4 py-12 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}>
              <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>No transactions found for this user.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              <div className="overflow-x-auto" style={{ marginTop: 2 }}>
                <table className="data-table user-mgmt-table">
                  <thead>
                    <tr>
                      {['Asset ID', 'Stock ID', 'Type', 'Quantity', 'Amount', 'Date'].map((heading) => (
                        <th key={heading}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userTransactions.items.map((item) => {
                      const isBuy = item.transactionType === 'BUY';
                      return (
                        <tr key={item.assetId}>
                          <td style={{ color: 'var(--txt-primary)' }}>#{item.assetId}</td>
                          <td style={{ color: 'var(--txt-secondary)' }}>#{item.stockId}</td>
                          <td>
                            <span className="inline-flex items-center justify-center gap-1 rounded-full text-[11px] font-semibold" style={isBuy ? { background: 'var(--gain-bg)', color: 'var(--gain)', border: '1px solid var(--gain-border)', minWidth: 50, height: 24, padding: '0 9px' } : { background: 'var(--loss-bg)', color: 'var(--loss)', border: '1px solid var(--loss-border)', minWidth: 50, height: 24, padding: '0 9px' }}>
                              {item.transactionType}
                            </span>
                          </td>
                          <td style={{ color: 'var(--txt-primary)' }}>{Number(item.quantity ?? 0).toLocaleString('en-US')}</td>
                          <td style={{ color: 'var(--txt-primary)' }}>{formatCurrency(item.transactionAmount, 2, 'USD')}</td>
                          <td style={{ color: 'var(--txt-secondary)' }}>{formatDate(item.transactionTimestamp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                page={userTransactions.page}
                totalPages={userTransactions.totalPages}
                onPrevious={() => setTransactionPage((current) => Math.max(current - 1, 0))}
                onNext={() => setTransactionPage((current) => current + 1)}
              />
            </div>
          )}
        </SectionLoader>
      </section>

      {deleteDialog.open && deleteDialog.user ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--bg-overlay)' }}
        >
          <div
            className="w-full max-w-lg rounded-3xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-elevated)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ color: 'var(--loss)', background: 'var(--loss-bg)', border: '1px solid var(--loss-border)' }}
                >
                  <RiAlertLine />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>
                    Delete user confirmation
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--txt-secondary)' }}>
                    This action will permanently delete {deleteDialog.user.customerName} and related investments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDeleteDialog}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ color: 'var(--txt-muted)', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
                disabled={deletingUser}
              >
                <RiCloseLine />
              </button>
            </div>

            <form className="mt-5 flex flex-col gap-4" onSubmit={handleDeleteConfirm}>
              <p className="text-xs" style={{ color: 'var(--txt-secondary)' }}>
                Type <span style={{ color: 'var(--txt-primary)', fontWeight: 700 }}>{deleteDialog.user.customerName}</span> to confirm deletion.
              </p>

              <input
                value={deleteDialog.confirmText}
                onChange={(event) => {
                  setDeleteDialog((current) => ({ ...current, confirmText: event.target.value }));
                }}
                className="input px-3 py-3 text-sm rounded-xl"
                placeholder="Type exact user name"
                autoFocus
              />

              {deleteError ? (
                <div
                  className="rounded-2xl px-3 py-3 text-sm"
                  style={{ background: 'var(--loss-bg)', color: 'var(--loss)', border: '1px solid var(--loss-border)' }}
                >
                  {deleteError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ color: 'var(--txt-secondary)', border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)' }}
                  disabled={deletingUser}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isDeleteNameMatch || deletingUser}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-55 disabled:cursor-not-allowed"
                  style={{ background: 'var(--loss)', boxShadow: 'var(--shadow-loss)' }}
                >
                  {deletingUser ? <RiLoaderLine className="animate-spin" /> : <RiDeleteBinLine />}
                  {deletingUser ? 'Deleting...' : 'Confirm delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PaginationControls({ page, totalPages, onPrevious, onNext }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs" style={{ color: 'var(--txt-muted)' }}>
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrevious} disabled={page <= 0} className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50" style={{ background: 'var(--bg-elevated)', color: 'var(--txt-primary)', border: '1px solid var(--border-subtle)' }}>Previous</button>
        <button type="button" onClick={onNext} disabled={page + 1 >= totalPages} className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50" style={{ background: 'var(--bg-elevated)', color: 'var(--txt-primary)', border: '1px solid var(--border-subtle)' }}>Next</button>
      </div>
    </div>
  );
}