import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  RiAddLine,
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiLoaderLine,
  RiShieldCheckLine,
  RiUserLine,
} from 'react-icons/ri';
import { addUser, clearUserCreateState, deleteUser, loadAllUsers, setSelectedUser } from '../store/slices/userSlice';

const RISK_OPTIONS = ['High', 'Medium', 'Low'];

const RISK_STYLES = {
  High: { color: 'var(--loss)', bg: 'var(--loss-bg)', border: 'var(--loss-border)' },
  Medium: { color: 'var(--warn)', bg: 'var(--warn-bg)', border: 'rgba(245,158,11,0.25)' },
  Low: { color: 'var(--gain)', bg: 'var(--gain-bg)', border: 'var(--gain-border)' },
};

export default function UserManagementPage() {
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

  return (
    <div className="p-6 max-w-[1500px] mx-auto flex flex-col gap-6 anim-fade-in">
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-7"
        style={{
          background: 'linear-gradient(135deg, rgba(26,110,247,0.18) 0%, rgba(10,13,20,0.96) 56%, rgba(0,212,138,0.1) 100%)',
          border: '1px solid var(--border-soft)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <div
          className="absolute inset-y-0 right-0 w-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, rgba(26,110,247,0.24), transparent 70%)' }}
        />
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
            className="min-w-[220px] rounded-2xl px-4 py-3"
            style={{ background: 'rgba(10,13,20,0.72)', border: '1px solid var(--border-soft)' }}
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_420px] gap-6 items-start">
        <section
          className="rounded-3xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Current users</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
                Click a row to make that customer the active user in the app.
              </p>
            </div>
            {loadingUsers ? <RiLoaderLine className="animate-spin text-lg" style={{ color: 'var(--accent)' }} /> : null}
          </div>

          {allUsers.length === 0 && !loadingUsers ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-soft)' }}
            >
              <p className="text-sm" style={{ color: 'var(--txt-muted)' }}>No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    {['User', 'Customer ID', 'Risk Level', 'Status', 'Actions'].map((heading) => (
                      <th
                        key={heading}
                        className="text-left pb-3 px-3"
                        style={{
                          color: 'var(--txt-muted)',
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      >
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
                        onClick={() => dispatch(setSelectedUser(user))}
                        onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--bg-elevated)'; }}
                        onMouseLeave={(event) => { event.currentTarget.style.background = isActive ? 'rgba(26,110,247,0.08)' : 'transparent'; }}
                        style={isActive ? { background: 'rgba(26,110,247,0.08)' } : undefined}
                      >
                        <td className="px-3 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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
                        <td className="px-3 py-3.5 text-xs font-medium" style={{ color: 'var(--txt-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                          #{user.customerId}
                        </td>
                        <td className="px-3 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: riskStyle.bg,
                              border: `1px solid ${riskStyle.border}`,
                              color: riskStyle.color,
                            }}
                          >
                            <RiShieldCheckLine />
                            {user.riskLevel}
                          </span>
                        </td>
                        <td className="px-3 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                            style={isActive
                              ? { background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--border-active)' }
                              : { background: 'transparent', color: 'var(--txt-muted)', border: '1px solid var(--border-subtle)' }}
                          >
                            {isActive ? 'Active user' : 'Available'}
                          </span>
                        </td>
                        <td className="px-3 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDeleteDialog(user);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-85"
                            style={{
                              color: 'var(--loss)',
                              background: 'var(--loss-bg)',
                              border: '1px solid var(--loss-border)',
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

        <section
          className="rounded-3xl p-5 sticky top-[calc(var(--topbar-height)+24px)]"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
            >
              <RiAddLine className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--txt-primary)' }}>Add user</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--txt-secondary)' }}>
                Sends a POST to /api/customers/add (proxied to backend :8080 in dev).
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--txt-secondary)' }}>Customer name</span>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="input px-3 py-3 text-sm rounded-xl"
                maxLength={100}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--txt-secondary)' }}>Risk level</span>
              <select
                name="riskLevel"
                value={form.riskLevel}
                onChange={handleChange}
                className="input px-3 py-3 text-sm rounded-xl"
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
              className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity disabled:opacity-55 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}
            >
              {creatingUser ? <RiLoaderLine className="animate-spin" /> : <RiAddLine />}
              {creatingUser ? 'Adding user...' : 'Add user'}
            </button>
          </form>
        </section>
      </div>

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