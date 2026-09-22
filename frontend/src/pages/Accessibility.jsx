import React from 'react';

export default function Accessibility() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-gray-900">
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-extrabold mb-4">Accessibility Statement</h1>
        <p className="text-sm text-gray-500 mb-8">Target Standard: WCAG 2.2 AA Compliance</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Our Commitment</h2>
          <p className="text-gray-700">
            Amazon T-SMILE is dedicated to making this portal accessible to everyone, including users relying on screen readers, keyboard navigation, or assistive technologies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Accessibility Features</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Keyboard Navigation:</strong> All form elements, buttons, and links feature high-visibility focus rings.</li>
            <li><strong>ARIA Live Regions:</strong> Dynamic content updates announce automatically via <code>aria-live="polite"</code>.</li>
            <li><strong>Semantic HTML:</strong> Pages use standard landmarks (<code>&lt;main&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;nav&gt;</code>) for straightforward screen reader navigation.</li>
          </ul>
        </section>
      </article>
    </main>
  );
}