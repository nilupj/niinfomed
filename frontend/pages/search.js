import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { searchContent } from '../utils/api';

export default function Search() {
  const router = useRouter();
  const { q: query } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showOverview, setShowOverview] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    articles: 5,
    conditions: 5,
    drugs: 5,
    news: 5,
    wellness: 5,
    homeopathy: 5,
    ayurveda: 5,
    yoga: 5
  });

  const defaultResults = {
    articles: [],
    conditions: [],
    drugs: [],
    news: [],
    wellness: [],
    ayurveda: [],
    homeopathy: [],
    yoga: [],
    videos: [],
    social: []
  };

  const [results, setResults] = useState(defaultResults);

  useEffect(() => {
    if (query) setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setLoading(false);
      setResults(defaultResults);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const filters = { type: activeFilter !== 'all' ? activeFilter : '' };
        const data = await searchContent(searchQuery, filters);

        if (data.error) throw new Error(data.error);

        setResults({
          articles: Array.isArray(data.articles) ? data.articles : [],
          conditions: Array.isArray(data.conditions) ? data.conditions : [],
          drugs: Array.isArray(data.drugs) ? data.drugs : [],
          news: Array.isArray(data.news) ? data.news : [],
          wellness: Array.isArray(data.wellness) ? data.wellness : [],
          ayurveda: Array.isArray(data.ayurveda) ? data.ayurveda : [],
          homeopathy: Array.isArray(data.homeopathy) ? data.homeopathy : [],
          yoga: Array.isArray(data.yoga) ? data.yoga : [],
          videos: Array.isArray(data.videos) ? data.videos : [],
          social: Array.isArray(data.social) ? data.social : []
        });
      } catch (err) {
        console.error('Search error:', err);
        setError('Error fetching search results. Please try again.');
        setResults(defaultResults);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, activeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalResults = Object.values(results).reduce(
    (sum, section) => sum + (Array.isArray(section) ? section.length : 0),
    0
  );

  const getResultUrl = (result, type) => {
    const slug = result.slug || result.id;
    switch (type) {
      case 'articles': return `/articles/${slug}`;
      case 'conditions': return `/conditions/${slug}`;
      case 'drugs': return `/drugs/${slug}`;
      case 'news': return `/news/${slug}`;
      case 'wellness': return `/wellness/${slug}`;
      case 'ayurveda': return `/ayurveda/${slug}`;
      case 'homeopathy': return `/homeopathy/${slug}`;
      case 'yoga': return `/yoga-exercise/${slug}`;
      case 'videos': return `/videos/${slug}`;
      case 'social': return `/social-media/${slug}`;
      default: return '#';
    }
  };

  const showMore = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: prev[section] + 5
    }));
  };

  // Skip first condition in list if overview is visible
  const conditionList = showOverview && results.conditions.length > 0
    ? results.conditions.slice(1)
    : results.conditions;

  return (
    <>
      <NextSeo title={`Search results for "${searchQuery || ''}" | Health Info`} />

      <div className="bg-white min-h-screen">
        {/* Search Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
          <div className="container mx-auto px-4 max-w-4xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search health information..."
                className="w-full px-4 py-2.5 pr-12 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded font-medium transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Results Header */}
          {searchQuery && !loading && totalResults > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <strong>1 - {Math.min(10, totalResults)}</strong> of {totalResults} results for "<strong>{searchQuery}</strong>"
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-4 border-b-2 border-gray-200 mb-6 overflow-x-auto pb-1">
                {['all','articles','conditions','drugs','news','homeopathy','ayurveda','yoga','videos','social'].map((tab) => {
                  const count = results[tab]?.length || (tab==='all' ? totalResults : 0);
                  if(count === 0 && tab!=='all') return null;
                  const label = tab==='all' ? 'All' : tab==='social' ? 'Social Media' : tab.charAt(0).toUpperCase() + tab.slice(1);
                  return (
                    <button
                      key={tab}
                      onClick={() => { setActiveFilter(tab); setShowOverview(true); }}
                      className={`pb-3 px-2 font-medium transition-all relative ${
                        activeFilter === tab ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Overview Section */}
              {activeFilter === 'all' && showOverview && results.conditions.length > 0 && (
                <div className="mb-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {results.conditions[0]?.title || results.conditions[0]?.name}: An Overview
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        {results.conditions[0]?.summary || results.conditions[0]?.subtitle ||
                          `Learn about ${searchQuery}, including its causes, symptoms, diagnosis, and treatment options. Find comprehensive health information to help you understand and manage this condition.`}
                      </p>
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>REFERENCES:</strong>
                      </div>
                      <button
                        onClick={() => setShowOverview(false)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-600 hover:border-blue-800 px-4 py-1.5 rounded transition-colors"
                      >
                        Show More ▼
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading, Error, No Query */}
          {loading && (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!searchQuery && !loading && (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Search</h3>
              <p className="text-gray-600">Enter a search term to find health information</p>
            </div>
          )}

          {/* Results Sections */}
          {!loading && searchQuery && totalResults > 0 && (
            <div className="space-y-8">
              {[
                { key:'articles', title:'Article' },
                { key:'conditions', title:'Health Conditions', list: conditionList },
                { key:'drugs', title:'Drugs & Medications' },
                { key:'wellness', title:'Wellness Topics' },
                { key:'news', title:'Health News' },
                { key:'homeopathy', title:'Homeopathy' },
                { key:'ayurveda', title:'Ayurveda' },
                { key:'yoga', title:'Yoga & Exercise' },
                { key:'videos', title:'Videos' },
                { key:'social', title:'Social Media Posts' }
              ].map(section => {
                const items = section.list || results[section.key];
                if(!items || items.length===0) return null;
                return (
                  <div key={section.key}>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 pb-2 border-b">{section.title}</h3>
                    <div className="space-y-4">
                      {items.slice(0, expandedSections[section.key] || 5).map(item => (
                        <Link key={item.id} href={getResultUrl(item, section.key)} className="block hover:bg-gray-50 p-4 -mx-4 rounded transition-colors">
                          <h4 className="text-blue-600 hover:text-blue-800 font-bold text-lg mb-2">{item.title || item.name}</h4>
                          {item.summary && <p className="text-gray-700 text-sm leading-relaxed">{item.summary}</p>}
                          {section.key==='drugs' && item.generic_name && <p className="text-gray-600 text-xs mt-1"><strong>Generic:</strong> {item.generic_name}</p>}
                        </Link>
                      ))}
                      {items.length > (expandedSections[section.key] || 5) && (
                        <button onClick={() => showMore(section.key)} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-600 hover:border-blue-800 px-4 py-1.5 rounded transition-colors">
                          Show More ▼
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!loading && searchQuery && totalResults === 0 && (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">We couldn't find any results for "<strong>{searchQuery}</strong>"</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/conditions" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors">Browse Conditions</Link>
                <Link href="/drugs-supplements" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors">Browse Drugs</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
