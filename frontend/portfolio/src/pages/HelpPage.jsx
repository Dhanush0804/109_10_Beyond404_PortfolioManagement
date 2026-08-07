import React, { useState } from 'react';
import { RiQuestionLine, RiAddLine, RiSubtractLine, RiMailLine, RiGithubLine } from 'react-icons/ri';

const FAQS = [
  {
    q: 'How do I add a new investment to my portfolio?',
    a: 'Go to the Portfolio page and click the "+ Add Investment" button. Fill in the stock ticker, quantity, and purchase price, then hit Save. Your portfolio will update immediately.',
  },
  {
    q: 'How is my P&L (Profit & Loss) calculated?',
    a: 'P&L is calculated as Current Value minus Total Invested. Current Value is fetched in real-time from the market data service using the latest available price for each stock.',
  },
  {
    q: 'Why is some market data showing as unavailable?',
    a: 'Market data is sourced from live APIs. Outside of trading hours or for certain regional symbols, data may be delayed or temporarily unavailable. Try refreshing the page or checking back during market hours.',
  },
  {
    q: 'Can I track multiple customers or portfolios?',
    a: 'Yes. Use the "Select User" dropdown in the top bar to switch between customer profiles. Each customer has their own independent portfolio and analytics view.',
  },
  {
    q: 'How do I view the historical performance of a stock?',
    a: 'Navigate to the Analysis page, select the stock from the list, and use the date-range selector (1D, 1W, 1M, 6M, 1Y) to view its historical price chart and investment history.',
  },
];

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.875rem',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        boxShadow: open ? '0 4px 20px rgba(0,0,0,0.2)' : '0 1px 6px rgba(0,0,0,0.1)',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.4rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          gap: '1rem',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              minWidth: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--txt-primary)' }}>
            {faq.q}
          </span>
        </div>
        {open
          ? <RiSubtractLine style={{ color: 'var(--accent)', flexShrink: 0, fontSize: '1.1rem' }} />
          : <RiAddLine style={{ color: 'var(--txt-muted)', flexShrink: 0, fontSize: '1.1rem' }} />
        }
      </button>

      {open && (
        <div
          style={{
            padding: '0 1.4rem 1.1rem 1.4rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.9rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--txt-secondary)', lineHeight: 1.7, margin: 0 }}>
            {faq.a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <section
      className="anim-fade-in"
      style={{
        minHeight: '80vh',
        background: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '3rem 2rem',
        gap: '2.5rem',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '1rem',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--shadow-accent)',
          }}
        >
          <RiQuestionLine style={{ color: '#fff', fontSize: '1.5rem' }} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: '0.5rem' }}>
          Help &amp; Support
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--txt-muted)' }}>
          Frequently asked questions about Beyond404 Portfolio Manager
        </p>
      </div>

      {/* FAQ accordion */}
      <div style={{ width: '100%', maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {FAQS.map((faq, i) => (
          <FaqItem key={i} faq={faq} index={i} />
        ))}
      </div>

      {/* Contact footer */}
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.875rem',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p style={{ fontWeight: 600, color: 'var(--txt-primary)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
            Still have questions?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', margin: 0 }}>
            Reach out to the Beyond404 team
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href="mailto:support@beyond404.dev"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <RiMailLine /> Email Us
          </a>
          <a
            href="https://github.com/beyond404"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--bg-elevated)',
              color: 'var(--txt-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <RiGithubLine /> GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
