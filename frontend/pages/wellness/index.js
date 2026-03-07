// pages/wellness/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import FeaturedArticle from '../../components/FeaturedArticle';
import ImageWithFallback from '../../components/ImageWithFallback';
import { 
  fetchWellnessTopics, 
  getProxiedImageUrl,
  tryEndpoints 
} from '../../utils/api';

export default function WellnessIndex({ initialTopics = [], error: initialError }) {
  const [topics, setTopics] = useState(initialTopics);
  const [loading, setLoading] = useState(!initialTopics.length);
  const [error, setError] = useState(initialError);

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
        
        const topicsData = await fetchWellnessTopics(50);
        
        console.log('Wellness topics loaded:', topicsData?.length || 0);
        setTopics(topicsData || []);
        setError(null);
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-neutral-200"></div>
                <div className="p-5">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                </div>
              </div>
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
          siteName: 'Niinfomed',
          type: 'website',
        }}
        twitter={{
          handle: '@niinfomed',
          site: '@niinfomed',
          cardType: 'summary_large_image',
        }}
      />

      {/* Hero Section */}
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
              <p className="text-neutral-600">{topics.length} article{topics.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => {
                // Prepare article data for FeaturedArticle component
                const articleData = {
                  id: topic.id || topic.slug,
                  title: topic.title,
                  slug: topic.slug,
                  summary: topic.summary || topic.introduction || topic.subtitle || 'Learn more about this wellness topic',
                  image: getProxiedImageUrl(topic.image || topic.thumbnail),
                  category: topic.category || { name: 'Wellness', slug: 'wellness' },
                  published_date: topic.published_date || topic.first_published_at || topic.created_at,
                };

                return (
                  <FeaturedArticle
                    key={topic.id || topic.slug}
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
                <Link href="/tools#bmi" className="flex items-center gap-2 text-primary hover:underline group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                  <span>BMI Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/tools#calorie" className="flex items-center gap-2 text-primary hover:underline group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
                  <span>Calorie Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/tools#water" className="flex items-center gap-2 text-primary hover:underline group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">💧</span>
                  <span>Water Intake Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/tools#stress" className="flex items-center gap-2 text-primary hover:underline group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🧘</span>
                  <span>Stress Assessment</span>
                </Link>
              </li>
              <li>
                <Link href="/tools#sleep" className="flex items-center gap-2 text-primary hover:underline group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">😴</span>
                  <span>Sleep Calculator</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Healthy Living Tips</h3>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-neutral-700">
                <strong className="text-neutral-900">Stay Physically Active</strong>
                <p className="text-sm text-neutral-600 ml-6 mt-1">Aim for at least 150 minutes of moderate activity or 75 minutes of vigorous activity each week.</p>
              </li>
              <li className="text-neutral-700">
                <strong className="text-neutral-900">Eat a Balanced Diet</strong>
                <p className="text-sm text-neutral-600 ml-6 mt-1">Focus on fruits, vegetables, whole grains, lean proteins, and healthy fats.</p>
              </li>
              <li className="text-neutral-700">
                <strong className="text-neutral-900">Get Enough Sleep</strong>
                <p className="text-sm text-neutral-600 ml-6 mt-1">Adults should aim for 7-9 hours of quality sleep each night.</p>
              </li>
              <li className="text-neutral-700">
                <strong className="text-neutral-900">Manage Stress</strong>
                <p className="text-sm text-neutral-600 ml-6 mt-1">Practice stress-reduction techniques like mindfulness, meditation, or deep breathing.</p>
              </li>
              <li className="text-neutral-700">
                <strong className="text-neutral-900">Stay Hydrated</strong>
                <p className="text-sm text-neutral-600 ml-6 mt-1">Drink enough water throughout the day. The recommended amount varies by individual needs.</p>
              </li>
            </ol>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated with Wellness Tips</h3>
            <p className="mb-6 text-green-100">Get the latest wellness articles and healthy living tips delivered to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// ✅ STATIC GENERATION
export async function getStaticProps() {
  try {
    console.log("🔍 Fetching wellness topics from Oracle CMS...");
    
    const topics = await fetchWellnessTopics(50);

    console.log(`✅ Found ${topics?.length || 0} wellness topics`);
    
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
        error: 'Failed to load wellness topics. Please try again later.',
      },
      revalidate: 60, // Try again in 60 seconds
    };
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 2ee6acc (update)
