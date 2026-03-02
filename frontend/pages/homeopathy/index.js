import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import { fetchHomeopathyTopics } from '../../utils/api';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&h=500';

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

export default function HomeopathyIndex({ initialTopics = [] }) {
  const [topics, setTopics] = useState(initialTopics);
  const [loading, setLoading] = useState(!initialTopics.length);

  useEffect(() => {
    if (!initialTopics.length) fetchTopics();
  }, [initialTopics]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await fetchHomeopathyTopics(50);
      setTopics(data || []);
    } catch (err) {
      console.error('Homeopathy fetch error:', err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Homeopathic Remedies - Natural Healing"
        description="Explore homeopathic remedies and natural healing solutions"
      />

      <div className="container-custom py-8">
        <h1 className="text-4xl font-bold mb-4">
          Homeopathic Remedies
        </h1>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-neutral-200 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/homeopathy/${topic.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">

                  {/* IMAGE FIXED */}
                  <div className="relative h-48 w-full">
                    <img
                      src={getProxiedImageUrl(topic.image)}
                      alt={topic.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-green-600">
                      {topic.title}
                    </h3>

                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {topic.summary || 'Learn more about this remedy'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const topics = await fetchHomeopathyTopics(50);
    return {
      props: { initialTopics: topics || [] },
      revalidate: 3600,
    };
  } catch {
    return {
      props: { initialTopics: [] },
      revalidate: 60,
    };
  }
}
