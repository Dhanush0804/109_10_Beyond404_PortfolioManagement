import LoadingSpinner from './LoadingSpinner';

export default function SectionLoader({ loading, minHeight = 120, children }) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          minHeight,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner />
          <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--txt-secondary)' }}>
            Loading…
          </span>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
