import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-gray-900">
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-extrabold mb-4">Privacy Policy & UK GDPR Notice</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: September 2026</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">1. UK GDPR Compliance</h2>
          <p className="text-gray-700">
            The T-SMILE Portal strictly complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">2. Guest User Tracking</h2>
          <p className="text-gray-700">
            Unregistered guests are identified via a locally generated UUID <code>sessionId</code> stored in browser local storage. This allows tracking Expressions of Interest (EOI) and chatbot queries without forcing upfront account registration.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">3. Data Security & Storage</h2>
          <p className="text-gray-700">
            User credentials and profiles are stored securely in AWS RDS PostgreSQL. Gated learning assets are delivered securely through temporary, signed AWS S3 URLs.
          </p>
        </section>
      </article>
    </main>
  );
}