import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import axios from 'axios';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&h=500';

const getProxiedImageUrl = (url) => {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith('http://0.0.0.0:8001') || url.startsWith('http://127.0.0.1:8001')) {
    return url.replace(/http:\/\/(0\.0\.0\.0|127\.0\.0\.1):8001/, '/cms-media').replace('/cms-media/media/', '/cms-media/');
  }
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  return url;
};
export default function AyurvedaIndex() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/cms-api/ayurveda/topics?limit=20&lang=en');
        
        if (response.ok) {
          const data = await response.json();
          console.log('Ayurveda topics received:', data);
          setTopics(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch ayurveda topics:', response.status);
          setTopics([]);
        }
      } catch (error) {
        console.error('Error fetching ayurveda topics:', error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return (
    <Layout>
      <SEO
        title="Ayurvedic Wisdom & Remedies"
        description="Explore ancient Ayurvedic wisdom, natural remedies, and holistic health practices."
      />

      <div className="container-custom py-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Ayurvedic Wisdom
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl">
            Discover the ancient science of Ayurveda and learn about natural remedies,
            dosha balance, and holistic approaches to health and wellness.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-neutral-200"></div>
                <div className="p-5">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/ayurveda/${topic.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={getProxiedImageUrl(topic.image)}
                    alt={topic.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="p-5">
                  {topic.category && (
                    <span className="text-xs font-semibold text-amber-600 mb-2 inline-block">
                      {topic.category.name}
                    </span>
                  )}
                  <h3 className="font-bold text-lg mb-2 text-neutral-800 line-clamp-2">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {topic.summary || 'Learn more about this Ayurvedic wisdom.'}
                  </p>
                  <span className="text-primary hover:text-primary-dark font-medium text-sm inline-flex items-center">
                    Learn More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-neutral-600 text-lg">No Ayurveda topics available yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}