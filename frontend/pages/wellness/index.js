import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { NextSeo } from 'next-seo';
import FeaturedArticle from '../../components/FeaturedArticle';
import { fetchWellnessTopics } from '../../utils/api';

// Oracle CMS URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";

/* =========================================================
   ✅ HELPER FUNCTION FOR MULTIPLE ENDPOINT ATTEMPTS
========================================================= */
const tryFetchFromMultipleEndpoints = async (endpoints = [], config = {}) => {
  for (let url of endpoints) {
    try {
      console.log(`🔍 Trying endpoint: ${url}`);
      const res = await axios.get(url, config);
      if (res?.data) {
        console.log(`✅ Success from: ${url}`);
        return { data: res.data, usedUrl: url };
      }
    } catch (err) {
      console.log(`❌ Failed: ${url}`);
    }
  }
  return { data: null, usedUrl: null };
};

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

export default function WellnessIndex({ initialTopics = [] }) {
  const [topics, setTopics] = useState(initialTopics);
  const [loading, setLoading] = useState(!initialTopics.length);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have topics from getStaticProps, don't fetch again
    if (initialTopics.length > 0) {
      setTopics(initialTopics);
      setLoading(false);
      return;
    }

    const loadTopics = async () => {
      try {
        setLoading(true);
        
        // Try multiple endpoints
        const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";
        
        const endpoints = [
          `${baseUrl}/api/wellness/topics/`,
          `${baseUrl}/api/wellness/topics`,
          `${baseUrl}/api/wellness/`,
          `${baseUrl}/api/wellness/latest/`,
          `${baseUrl}/api/v2/pages/?type=wellness.WellnessPage&fields=title,slug,image,summary`,
        ];

        let topicsData = [];
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint);
            if (response.ok) {
              const data = await response.json();
              
              // Handle different response formats
              if (Array.isArray(data)) {
                topicsData = data;
                console.log(`✅ Found ${data.length} topics at: ${endpoint}`);
                break;
              } else if (data.results) {
                topicsData = data.results;
                console.log(`✅ Found ${data.results.length} topics at: ${endpoint}`);
                break;
              } else if (data.items) {
                topicsData = data.items;
                console.log(`✅ Found ${data.items.length} topics at: ${endpoint}`);
                break;
              }
            }
          } catch (err) {
            console.log(`❌ Endpoint failed: ${endpoint}`);
          }
        }

        console.log('Wellness topics loaded:', topicsData);
        setTopics(topicsData);
      } catch (err) {
        console.error('Error loading wellness topics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, [initialTopics]);

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
        <div className="text-center max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error Loading Content</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Well-Being - Wellness Topics & Healthy Living Tips | Niinfomed"
        description="Resources for healthy living, fitness, nutrition, mental health, stress management, and overall wellness."
        openGraph={{
          title: 'Well-Being - Wellness Topics & Healthy Living Tips | Niinfomed',
          description: 'Resources for healthy living, fitness, nutrition, mental health, stress management, and overall wellness.',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&h=630',
              width: 1200,
              height: 630,
              alt: 'Wellness Topics',
            },
          ],
        }}
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
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No wellness topics available</h2>
            <p className="text-gray-600 mb-6">Check back soon for new wellness content.</p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
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
                  summary: topic.summary || topic.introduction || topic.subtitle || 'Learn more about this wellness topic',
                  image: getProxiedImageUrl(topic.image || topic.thumbnail),
                  category: { name: 'Wellness', slug: 'wellness' },
                  published_date: topic.published_date || topic.first_published_at || topic.created_at,
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

// ✅ STATIC GENERATION WITH MULTIPLE ENDPOINTS
export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";
    
    const endpoints = [
      `${baseUrl}/api/wellness/topics/`,
      `${baseUrl}/api/wellness/topics`,
      `${baseUrl}/api/wellness/`,
      `${baseUrl}/api/wellness/latest/`,
      `${baseUrl}/api/v2/pages/?type=wellness.WellnessPage&fields=title,slug,image,summary`,
    ];

    console.log("🔍 Fetching wellness topics from Oracle CMS...");
    
    let topics = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, { 
          timeout: 10000,
          params: { limit: 50, lang: "en" }
        });
        
        const data = response.data;
        
        if (Array.isArray(data)) {
          topics = data;
          break;
        } else if (data.results) {
          topics = data.results;
          break;
        } else if (data.items) {
          topics = data.items;
          break;
        }
      } catch (err) {
        console.log(`❌ Endpoint failed: ${endpoint}`);
      }
    }

    console.log(`✅ Found ${topics.length} wellness topics`);
    
    return {
      props: {
        initialTopics: topics,
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
