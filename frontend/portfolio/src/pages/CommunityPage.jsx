import React from 'react';

// Feature overview for the Beyond404 Portfolio Management app
const FEATURES = [
  'Real‑time portfolio analytics and stock‑wise P&L',
  'Historical investment tracking with customizable date ranges',
  'Market data lookup and quote aggregation',
  'User‑friendly dashboard with interactive charts',
];

const CONTRIBUTORS = [
  {
    name: 'Abhinav',
    useCase: 'I use the analytics dashboard to monitor my tech‑stock allocations and set alerts for sudden price moves.',
  },
  {
    name: 'Dhanush',
    useCase: 'The historical investment view helps me evaluate long‑term performance of my mutual‑fund portfolio.',
  },
  {
    name: 'Divyansh',
    useCase: 'I love the market‑quote explorer – it gives me quick snapshots before I place a trade.',
  },
  {
    name: 'Tushar',
    useCase: 'The clean UI lets me share portfolio summaries with clients without any extra tools.',
  },
];

export default function CommunityPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-8 anim-fade-in" style={{ background: 'var(--bg-canvas)' }}>
      <h2 className="text-3xl font-bold" style={{ color: 'var(--txt-primary)' }}>
        Made by Team: Beyond404
      </h2>

      {/* Feature list */}
      <div className="w-full max-w-3xl" style={{ background: 'var(--bg-elevated)', borderRadius: '0.75rem', boxShadow: 'var(--shadow-elevated)', padding: '1.5rem' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--txt-primary)' }}>
          What you can do with this app
        </h3>
        <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--txt-secondary)' }}>
          {FEATURES.map((feat, i) => (
            <li key={i}>{feat}</li>
          ))}
        </ul>
      </div>

      {/* Contributors and their use‑cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {CONTRIBUTORS.map((c, idx) => (
          <div
            key={c.name}
            className="p-4 rounded-lg"
            style={{
              background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            <h4 className="text-lg font-medium mb-2" style={{ color: 'var(--txt-primary)' }}>
              {c.name}
            </h4>
            <p className="text-sm" style={{ color: 'var(--txt-secondary)' }}>
              {c.useCase}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
