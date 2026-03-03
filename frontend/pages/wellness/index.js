import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import FeaturedArticle from '../../components/FeaturedArticle';
import { fetchWellnessTopics } from '../../utils/api';

// Oracle CMS URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";

/* =========================================================
   ✅ IMAGE HELPER FUNCTIONS
========================================================= */

/**
 * Get proxied image URL for Oracle CMS
 */
const getProxiedImageUrl = (url) => {
  if (!url) return null;

  // Agar already proxied hai toh wahi return karo
  if (url.startsWith('/cms-media/')) {
    return url;
  }

  // Oracle CMS URL handle karo
  if (url.includes('161.118.167.107')) {
    return url.replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/');
  }

  // Localhost patterns handle karo
  if (url.includes('0.0.0.0:8001') || url.includes('127.0.0.1:8001') || url.includes('localhost:8001')) {
    return url.replace(/https?:\/\/[^\/]+\/media\//, '/cms-media/');
  }
  
  // Relative media URLs handle karo
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  
  // Full URLs (Unsplash, etc.) as they are
  if (url.startsWith('http')) {
    return url;
  }
  
  return url;
};

/**
 * Image component with fallback for errors
 */
const ImageWithFallback = ({ src, alt, className, width, height, priority = false, ...props }) => {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(getProxiedImageUrl(src));

  useEffect(() => {
    setImageSrc(getProxiedImageUrl(src));
    setError(false);
  }, [src]);

  if (error || !imageSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height }}>
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt || "Wellness image"}
      className={className}
      width={width}
      height={height}
      onError={() => setError(true)}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...props}
    />
  );
};

export default function WellnessIndex() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await fetchWellnessTopics(50);
        console.log('Wellness topics loaded:', data);
        setTopics(data);
      } catch (err) {
        console.error('Error loading wellness topics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Content</h1>
          <p className="text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Well-Being - Wellness Topics & Healthy Living Tips"
        description="Resources for healthy living, fitness, nutrition, mental health, stress management, and overall wellness."
      />

      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Well-Being</h1>
          <p className="text-lg text-neutral-600 max-w-3xl">
            Resources for healthy living, fitness, nutrition, mental health, stress management, and overall wellness.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-neutral-600">No articles found in this category.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">All Topics</h2>
              <p className="text-neutral-600">{topics.length} articles</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => {
                // Prepare article data for FeaturedArticle component
                const articleData = {
                  id: topic.id,
                  title: topic.title,
                  slug: topic.slug,
                  summary: topic.summary || topic.introduction || 'Learn more about this wellness topic',
                  image: getProxiedImageUrl(topic.image),
                  category: { name: 'Wellness', slug: 'wellness' },
                  published_date: topic.published_date,
                };

                return (
                  <FeaturedArticle
                    key={topic.id}
                    article={articleData}
                    href={`/wellness/${topic.slug}`}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Wellness Tools Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Wellness Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools#bmi" className="flex items-center gap-2 text-primary hover:underline">
                  <span>📊</span> BMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools#calorie" className="flex items-center gap-2 text-primary hover:underline">
                  <span>🔥</span> Calorie Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools#water" className="flex items-center gap-2 text-primary hover:underline">
                  <span>💧</span> Water Intake Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools#stress" className="flex items-center gap-2 text-primary hover:underline">
                  <span>🧘</span> Stress Assessment
                </Link>
              </li>
              <li>
                <Link href="/tools#sleep" className="flex items-center gap-2 text-primary hover:underline">
                  <span>😴</span> Sleep Calculator
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Healthy Living Tips</h3>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-neutral-700">
                <strong>Stay Physically Active</strong>
                <p className="text-sm text-neutral-600 ml-6">Aim for at least 150 minutes of moderate activity or 75 minutes of vigorous activity each week.</p>
              </li>
              <li className="text-neutral-700">
                <strong>Eat a Balanced Diet</strong>
                <p className="text-sm text-neutral-600 ml-6">Focus on fruits, vegetables, whole grains, lean proteins, and healthy fats.</p>
              </li>
              <li className="text-neutral-700">
                <strong>Get Enough Sleep</strong>
                <p className="text-sm text-neutral-600 ml-6">Adults should aim for 7-9 hours of quality sleep each night.</p>
              </li>
              <li className="text-neutral-700">
                <strong>Manage Stress</strong>
                <p className="text-sm text-neutral-600 ml-6">Practice stress-reduction techniques like mindfulness, meditation, or deep breathing.</p>
              </li>
              <li className="text-neutral-700">
                <strong>Stay Hydrated</strong>
                <p className="text-sm text-neutral-600 ml-6">Drink enough water throughout the day. The recommended amount varies by individual needs.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}

// Optional: Add getStaticProps for server-side rendering
export async function getStaticProps() {
  try {
    const topics = await fetchWellnessTopics(50);
    
    return {
      props: {
        initialTopics: topics || [],
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        initialTopics: [],
      },
      revalidate: 60,
    };
  }
}
