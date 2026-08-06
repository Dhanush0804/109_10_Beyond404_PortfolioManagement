import React from 'react';

const CONTRIBUTORS = [
  {
    name: 'Abhinav',
    initials: 'AB',
    useCase: 'I use the analytics dashboard to monitor my tech‑stock allocations and spot sudden price moves before anyone else.',
  },
  {
    name: 'Dhanush',
    initials: 'DH',
    useCase: 'The historical investment view helps me evaluate long‑term performance of my mutual‑fund portfolio with ease.',
  },
  {
    name: 'Divyansh',
    initials: 'DV',
    useCase: 'I love the market‑quote explorer — it gives me quick price snapshots right before I place a trade.',
  },
  {
    name: 'Tushar',
    initials: 'TU',
    useCase: 'The clean portfolio summary lets me share reports with clients instantly without any extra tools.',
  },
];

const ACCENT_COLORS = [
  'var(--accent)',
  '#10b981',
  '#6366f1',
  '#f59e0b',
];

export default function CommunityPage() {
  return (
    <section
      style={{
        minHeight: '80vh',
        background: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        gap: '2.5rem',
      }}
      className="anim-fade-in"
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: '0.5rem' }}>
          Made by Team: <span style={{ color: 'var(--accent)' }}>Beyond404</span>
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--txt-muted)' }}>
          How our contributors use this portfolio management platform
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        {CONTRIBUTORS.map((c, idx) => (
          <div
            key={c.name}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
            }}
          >
            {/* Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: ACCENT_COLORS[idx % ACCENT_COLORS.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {c.initials}
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--txt-primary)', margin: 0 }}>
                {c.name}
              </h4>
            </div>

            {/* Quote */}
            <p style={{ fontSize: '0.875rem', color: 'var(--txt-secondary)', lineHeight: 1.6, margin: 0 }}>
              &ldquo;{c.useCase}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
