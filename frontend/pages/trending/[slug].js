import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import Image from 'next/image';

// Oracle CMS URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';

// Helper to get proxied image URL
const getProxiedImageUrl = (url) => {
  if (!url) return null;

  // Handle Oracle CMS URL
  if (url.includes('161.118.167.107')) {
    return url.replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/');
  }
  
  // Handle localhost patterns
  if (url.includes('0.0.0.0:8001') || url.includes('127.0.0.1:8001') || url.includes('localhost:8001')) {
    return url.replace(/https?:\/\/[^\/]+\/media\//, '/cms-media/');
  }
  
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  
  return url;
};

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

export default function TrendingDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendingData, setTrendingData] = useState(null);
  const [activeTab, setActiveTab] = useState('articles');
  const [tabContent, setTabContent] = useState({
    articles: [],
    news: [],
    disease: [],
    lifestyle: []
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 3;

  // Fetch trending data on mount
  useEffect(() => {
    if (!slug) return;

    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        console.log(`📡 Fetching trending data for: ${slug} from Oracle CMS`);
        
        const response = await fetch(`${CMS_API_URL}/api/trending/${slug}/`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('This trending topic could not be found.');
          } else {
            setError(`Unable to load trending content (Error ${response.status}).`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Check if API returned a redirect instruction
        if (data.redirect && data.content_type && data.content_slug) {
          router.replace(`/${data.content_type}/${data.content_slug}`);
          return;
        }

        setTrendingData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error checking trending item:', err);
        setError('Unable to load this trending topic.');
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, [slug, router]);

  // Fetch content for each tab
  useEffect(() => {
    const fetchTabContent = async () => {
      try {
        console.log('📡 Fetching tab content from Oracle CMS');
        
        const [articlesRes, newsRes, conditionsRes, wellnessRes] = await Promise.all([
          fetch(`${CMS_API_URL}/api/articles/latest/?limit=6&lang=en`),
          fetch(`${CMS_API_URL}/api/news/latest/?limit=6&lang=en`),
          fetch(`${CMS_API_URL}/api/conditions/latest/?limit=6&lang=en`),
          fetch(`${CMS_API_URL}/api/wellness/topics/?limit=6&lang=en`)
        ]);
        
        const articlesData = await articlesRes.json();
        const newsData = await newsRes.json();
        const conditionsData = await conditionsRes.json();
        const wellnessData = await wellnessRes.json();
        
        // Handle different response formats
        const processResponse = (data) => {
          if (Array.isArray(data)) return data;
          if (data.results) return data.results;
          if (data.items) return data.items;
          return [];
        };
        
        setTabContent({
          articles: processResponse(articlesData),
          news: processResponse(newsData),
          disease: processResponse(conditionsData),
          lifestyle: processResponse(wellnessData)
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

  const nextSlide = () => {
    const currentContent = tabContent[activeTab] || [];
    const totalSlides = Math.ceil(currentContent.length / itemsPerSlide);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    const currentContent = tabContent[activeTab] || [];
    const totalSlides = Math.ceil(currentContent.length / itemsPerSlide);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

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
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
          ))}
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
        title={trendingData?.title ? `${trendingData.title} - Trending Topics` : "Trending Health Topics"}
        description={trendingData?.description || "Explore trending health and wellness content"}
        openGraph={{
          title: trendingData?.title || "Trending Health Topics",
          description: trendingData?.description || "Explore trending health and wellness content",
        }}
      />

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-red-600 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/trending" className="hover:text-red-600 transition-colors">
              Trending
            </Link>
            {trendingData?.title && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-700 font-medium">{trendingData.title}</span>
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
                                key={item.id}
                                href={getContentLink(item, activeTab)}
                                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                              >
                                {itemImage && (
                                  <div className="relative h-48 w-full overflow-hidden">
                                    <img
                                      src={itemImage}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=800&q=75';
                                      }}
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
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-red-600 text-gray-700 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10"
                      aria-label="Previous slide"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-red-600 text-gray-700 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10"
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
        </div>
      </div>
    </>
  );
}