import { useState, useEffect } from 'react';
import Link from 'next/link';
import SEO from '../../components/SEO';
import { fetchRemedyArticles } from '../../utils/api';
export default function RemediesIndex() {
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRemedies();
  }, [filter]);

  const loadRemedies = async () => {
    try {
      setLoading(true);
      console.log('Loading remedies with filter:', filter);
      const data = await fetchRemedyArticles(filter);
      console.log('Loaded remedies:', data?.length || 0);
      setRemedies(data || []);
    } catch (error) {
      console.error('Error loading remedies:', error);
      setRemedies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Natural Remedies & Alternative Medicine | Holistic Health"
        description="Explore natural healing with homeopathic, ayurvedic, herbal, and natural remedies. Learn about traditional medicine approaches for various health conditions."
      />

      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            Natural Remedies & Alternative Medicine
          </h1>
          <p className="text-lg text-neutral-600">
            Discover natural remedies and traditional medicine approaches for holistic health and wellness.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-neutral-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                filter === 'all' ? 'bg-primary text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              All Remedies
            </button>
            <button
              onClick={() => setFilter('homeopathic')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                filter === 'homeopathic' ? 'bg-primary text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Homeopathy
            </button>
            <button
              onClick={() => setFilter('ayurvedic')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                filter === 'ayurvedic' ? 'bg-primary text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Ayurveda
            </button>
            <button
              onClick={() => setFilter('herbal')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                filter === 'herbal' ? 'bg-primary text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Herbal Remedies
            </button>
            <button
              onClick={() => setFilter('natural')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                filter === 'natural' ? 'bg-primary text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Natural Healing
            </button>
          </div>
        </div>

        {/* Remedies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-neutral-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : remedies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remedies.map((remedy) => (
              <div key={remedy.id || remedy.slug} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={remedy.image || 'https://images.unsplash.com/photo-1599858238598-c26c35ad4d73?auto=format&fit=crop&w=800&h=500'}
                    alt={remedy.title}
                    className="w-full h-full object-cover"
                  />
                  {remedy.remedy_type && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {remedy.remedy_type.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-neutral-800">{remedy.title}</h3>
                  {remedy.subtitle && (
                    <p className="text-sm text-neutral-500 mb-2">{remedy.subtitle}</p>
                  )}
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {remedy.summary || remedy.also_known_as || 'Learn about this natural remedy and its traditional uses.'}
                  </p>
                  <Link
                    href={`/remedies/${remedy.slug}`}
                    className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-neutral-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No remedies found</h3>
            <p className="text-neutral-500">No remedies found for this category.</p>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">About Natural Medicine</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-neutral-800">Homeopathy</h3>
              <p className="text-sm text-neutral-600">
                A holistic system of medicine based on the principle of "like cures like" using highly diluted substances.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-neutral-800">Ayurveda</h3>
              <p className="text-sm text-neutral-600">
                Ancient Indian medicine focusing on balance of mind, body, and spirit using herbs, diet, and lifestyle practices.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-neutral-800">Herbal Medicine</h3>
              <p className="text-sm text-neutral-600">
                Traditional plant-based remedies used for centuries to support health and treat various conditions naturally.
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              <strong>Important:</strong> Always consult with a qualified healthcare provider before starting any new treatment or remedy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}