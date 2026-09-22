import React from 'react';

export default function TermsAndConditions() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-gray-900">
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-extrabold mb-4">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: September 2026</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">1. Terms of Portal Access</h2>
          <p className="text-gray-700">
            By accessing the Amazon T-SMILE Portal, you agree to these Terms and Conditions. This portal provides resources for students, parents, teachers, and alumni interested in T Level qualifications.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">2. Content Access Control</h2>
          <p className="text-gray-700">
            Free educational materials can be viewed without registration. Gated resources require user authentication or validated guest session tokens. Downloading gated content without authorization is strictly prohibited.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">3. Admin and Staff Security</h2>
          <p className="text-gray-700">
            Staff access strictly requires Multi-Factor Authentication (MFA). Accounts attempting unauthorized access will be suspended immediately.
          </p>
        </section>
      </article>
    </main>
  );
}