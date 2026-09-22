import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ContentLibrary from './ContentLibrary';
import TLevelsNearYou from './pages/TLevelsNearYou';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Accessibility from './pages/Accessibility';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-slate-900 text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-amber-400">T-SMILE Portal</Link>
            <nav className="space-x-6 text-sm font-semibold">
              <Link to="/" className="hover:text-amber-400">Content Library</Link>
              <Link to="/near-you" className="hover:text-amber-400">T Levels Near You</Link>
            </nav>
          </div>
        </header>

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<ContentLibrary />} />
            <Route path="/near-you" element={<TLevelsNearYou />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/accessibility" element={<Accessibility />} />
          </Routes>
        </div>

        <footer className="bg-slate-900 text-gray-400 text-sm py-6 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© 2026 Amazon T-SMILE Portal. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/terms" className="hover:underline hover:text-amber-400">Terms & Conditions</Link>
              <Link to="/privacy" className="hover:underline hover:text-amber-400">Privacy Policy</Link>
              <Link to="/accessibility" className="hover:underline hover:text-amber-400">Accessibility</Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}