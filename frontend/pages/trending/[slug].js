// pages/trending/[slug].js
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import ImageWithFallback from '../../components/ImageWithFallback';
import { 
  fetchTrendingBySlug,
  fetchTopStories,
  fetchLatestNews,
  fetchLatestConditions,
  fetchWellnessTopics,
  getProxiedImageUrl,
  formatDateDisplay,
  tryEndpoints
} from '../../utils/api';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '';
  }
};

export default function TrendingDetail({ trendingData: initialData = null, error: initialError = null }) {
  const router = useRouter();
  const { slug } = router.query;
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(initialError);
  const [trendingData, setTrendingData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('articles');
  const [tabContent, setTabContent] = useState({
    articles: [],
    news: [],
    disease: [],
    lifestyle: []
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 3;

  // Fetch trending data on mount if not provided
  useEffect(() => {
    if (!slug || initialData) return;

    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        console.log(`📡 Fetching trending data for: ${slug} from Oracle CMS`);
        
        const data = await fetchTrendingBySlug(slug);

        if (!data) {
          setError('This trending topic could not be found.');
          return;
        }

        // Check if API returned a redirect instruction
        if (data.redirect && data.content_type && data.content_slug) {
          router.replace(`/${data.content_type}/${data.content_slug}`);
          return;
        }

        setTrendingData(data);
        setError(null);
      } catch (err) {
        console.error('Error checking trending item:', err);
        setError('Unable to load this trending topic.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, [slug, initialData, router]);

  // Fetch content for each tab
  useEffect(() => {
    const fetchTabContent = async () => {
      try {
        console.log('📡 Fetching tab content from Oracle CMS');
        
        const [articlesData, newsData, conditionsData, wellnessData] = await Promise.allSettled([
          fetchTopStories(6),
          fetchLatestNews(6),
          fetchLatestConditions(6),
          fetchWellnessTopics(6)
        ]);

        setTabContent({
          articles: articlesData.status === 'fulfilled' ? articlesData.value || [] : [],
          news: newsData.status === 'fulfilled' ? newsData.value || [] : [],
          disease: conditionsData.status === 'fulfilled' ? conditionsData.value || [] : [],
          lifestyle: wellnessData.status === 'fulfilled' ? wellnessData.value || [] : []
        });
      } catch (err) {
        console.error('Error fetching tab content:', err);
      }
    };

    fetchTabContent();
  }, []);

  // Reset slide when tab changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeTab]);

  // Auto-play slider
  useEffect(() => {
    const currentContent = tabContent[activeTab] || [];
    const totalSlides = Math.ceil(currentContent.length / itemsPerSlide);
    
    if (totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, tabContent]);

  const nextSlide = useCallback(() => {
    const currentContent = tabContent[activeTab] || [];
    const totalSlides = Math.ceil(currentContent.length / itemsPerSlide);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [activeTab, tabContent]);

  const prevSlide = useCallback(() => {
    const currentContent = tabContent[activeTab] || [];
    const totalSlides = Math.ceil(currentContent.length / itemsPerSlide);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [activeTab, tabContent]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const getContentLink = (item, type) => {
    if (!item || !item.slug) return '#';
    
    if (type === 'articles') return `/articles/${item.slug}`;
    if (type === 'news') return `/news/${item.slug}`;
    if (type === 'disease') return `/conditions/${item.slug}`;
    if (type === 'lifestyle') return `/wellness/${item.slug}`;
    return '#';
  };

  const getItemImage = (item) => {
    if (!item) return null;
    
    const imageUrl = item.image || item.thumbnail || item.feed_image;
    return getProxiedImageUrl(imageUrl);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Content Unavailable</h1>
            <p className="text-lg text-gray-600 mb-8">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/trending"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                View All Trending
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = tabContent[activeTab] || [];
  const totalSlides = Math.ceil(currentContent.length / itemsPerSlide);

  return (
    <>
      <NextSeo
        title={trendingData?.title ? `${trendingData.title} - Trending Topics | Niinfomed` : "Trending Health Topics | Niinfomed"}
        description={trendingData?.description || "Explore trending health and wellness content"}
        openGraph={{
          title: trendingData?.title || "Trending Health Topics",
          description: trendingData?.description || "Explore trending health and wellness content",
          images: trendingData?.image ? [
            {
              url: getProxiedImageUrl(trendingData.image),
              width: 1200,
              height: 630,
              alt: trendingData.title,
            }
          ] : [
            {
              url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&h=630',
              width: 1200,
              height: 630,
              alt: 'Trending Topics',
            }
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

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-red-600 transition-colors">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href="/trending" className="hover:text-red-600 transition-colors">
              Trending
            </Link>
            {trendingData?.title && (
              <>
                <span className="mx-2" aria-hidden="true">/</span>
                <span className="text-gray-700 font-medium" aria-current="page">{trendingData.title}</span>
              </>
            )}
          </nav>

          {/* Trending Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {trendingData?.title || 'TRENDING TOPICS'}
            </h1>
            {trendingData?.description && (
              <p className="text-lg text-gray-600">{trendingData.description}</p>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
              {[
                { key: 'articles', label: 'Articles' },
                { key: 'news', label: 'News' },
                { key: 'disease', label: 'Disease' },
                { key: 'lifestyle', label: 'Lifestyle' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label={`Show ${tab.label} content`}
                  aria-current={activeTab === tab.key ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content with Slider */}
          <div className="relative">
            {currentContent.length > 0 ? (
              <div className="py-6">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {currentContent.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((item) => {
                            const itemImage = getItemImage(item);
                            
                            return (
                              <Link
                                key={item.id || item.slug}
                                href={getContentLink(item, activeTab)}
                                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                              >
                                {itemImage && (
                                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                                    <ImageWithFallback
                                      src={itemImage}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      fallbackSrc="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=800&h=500"
                                      width={400}
                                      height={240}
                                    />
                                  </div>
                                )}
                                <div className="p-4">
                                  {item.category && (
                                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2">
                                      {typeof item.category === 'string' ? item.category : item.category.name}
                                    </span>
                                  )}
                                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                    {item.title}
                                  </h3>
                                  {item.publish_date && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      {formatDate(item.publish_date)}
                                    </p>
                                  )}
                                  <p className="text-gray-600 text-sm line-clamp-3">
                                    {item.summary || item.subtitle || item.excerpt || ''}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {totalSlides > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-red-600 text-gray-700 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={currentSlide === 0}
                      aria-label="Previous slide"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-red-600 text-gray-700 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={currentSlide === totalSlides - 1}
                      aria-label="Next slide"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dot Indicators */}
                {totalSlides > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentSlide === index 
                            ? 'bg-red-600 w-8' 
                            : 'bg-gray-300 w-2 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No content available in this category yet.
              </div>
            )}
          </div>

          {/* Trending Tags Section */}
          {trendingData?.tags && trendingData.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold mb-4">Related Topics</h2>
              <div className="flex flex-wrap gap-2">
                {trendingData.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Section */}
          <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-2">Stay Updated with Trending Topics</h3>
              <p className="mb-6 text-red-100">Get the latest trending health content delivered to your inbox.</p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  required
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ✅ STATIC GENERATION
========================================================= */

export async function getStaticPaths() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    
    const response = await fetch(`${baseUrl}/api/trending/`);
    const data = await response.json();
    
    const items = data.results || data.items || data;
    
    const paths = items
      .filter(item => item?.slug && typeof item.slug === 'string')
      .map((item) => ({
        params: { slug: item.slug },
      }));

    console.log(`✅ Generated ${paths.length} static paths for trending`);
    
    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching trending paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  if (!params?.slug) {
    return { notFound: true };
  }

  try {
    const slug = params.slug;
    
    console.log(`📡 Fetching trending detail for: ${slug} from Oracle CMS`);

    const trendingData = await fetchTrendingBySlug(slug);

    if (!trendingData) {
      console.warn(`Trending item not found for slug: ${slug}`);
      return { notFound: true, revalidate: 60 };
    }

    return {
      props: {
        trendingData,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error(`Error fetching trending ${params.slug}:`, error);
    return { 
      props: {
        trendingData: null,
        error: 'Failed to load trending content. Please try again later.'
      },
      revalidate: 60 
    };
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 2ee6acc (update)
