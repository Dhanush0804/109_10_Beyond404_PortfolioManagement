import React from 'react';

export default function CommunityPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-8 anim-fade-in">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--txt-primary)' }}>
        Made by Team: Beyond404
      </h2>
      <p className="text-lg" style={{ color: 'var(--txt-secondary)' }}>
        Build by:
      </p>
      <ul className="list-disc list-inside text-base" style={{ color: 'var(--txt-primary)' }}>
        <li>Abhinav</li>
        <li>Dhanush</li>
        <li>Divyansh</li>
        <li>Tushar</li>
      </ul>
    </section>
  );
}
