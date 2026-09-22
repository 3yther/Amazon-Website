import React, { useState } from 'react';

const PATHWAYS = [
  "All Pathways",
  "Digital Software Development",
  "Digital Support Services",
  "Design, Surveying and Planning for Construction",
  "Education and Early Years",
  "Health",
  "Management and Administration"
];

export default function TLevelsNearYou() {
  const [postcode, setPostcode] = useState('');
  const [pathway, setPathway] = useState('');
  const [radius, setRadius] = useState('15');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!postcode.trim()) {
      setError('Please enter a UK postcode.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedPathway = pathway === "All Pathways" ? "" : pathway;
      const res = await fetch(`/api/content/providers/search/?postcode=${encodeURIComponent(postcode)}&pathway=${encodeURIComponent(selectedPathway)}&radius=${radius}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find T Levels Near You</h1>
        <p className="mt-2 text-lg text-gray-600">
          Discover schools and colleges offering Amazon-aligned T Level qualifications across the UK.
        </p>
      </header>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="postcode-input" className="block text-sm font-semibold text-gray-700 mb-1">
              UK Postcode <span className="text-red-600">*</span>
            </label>
            <input
              id="postcode-input"
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label htmlFor="pathway-select" className="block text-sm font-semibold text-gray-700 mb-1">
              T Level Pathway
            </label>
            <select
              id="pathway-select"
              value={pathway}
              onChange={(e) => setPathway(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {PATHWAYS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="radius-select" className="block text-sm font-semibold text-gray-700 mb-1">
              Search Radius
            </label>
            <select
              id="radius-select"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="5">5 miles</option>
              <option value="15">15 miles</option>
              <option value="30">30 miles</option>
              <option value="50">50 miles</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full md:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Find Providers'}
        </button>
      </form>

      {results.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((provider) => (
            <li key={provider.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-900">{provider.name}</h2>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-900 rounded-full">
                    {provider.distance_miles} miles away
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{provider.address}, {provider.postcode}</p>

                <h3 className="mt-4 text-xs font-bold uppercase text-gray-500">Available T Levels:</h3>
                <ul className="mt-1 space-y-1">
                  {provider.offered_courses && provider.offered_courses.length > 0 ? (
                    provider.offered_courses.map((course, idx) => (
                      <li key={idx} className="text-sm font-medium text-gray-800 flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2" />
                        {course.pathway_name} ({course.start_year})
                      </li>
                    ))
                  ) : (
                    <li className="text-sm italic text-gray-500">Contact provider for course details</li>
                  )}
                </ul>
              </div>

              {provider.website_url && (
                <div className="mt-6 border-t pt-3">
                  <a
                    href={provider.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-800 hover:underline"
                  >
                    Visit Provider Website
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}