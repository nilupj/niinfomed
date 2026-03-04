import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { NextSeo } from 'next-seo';
import Layout from '../../components/Layout';

// Oracle CMS URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';

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

const getProxiedImageUrl = (url) => {
  if (!url) return null;

  // Already proxied
  if (url.startsWith('/cms-media/')) {
    return url;
  }

  // Oracle CMS
  if (url.includes('161.118.167.107')) {
    return url.replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/');
  }

  // Localhost patterns
  if (url.includes('0.0.0.0:8001') || url.includes('127.0.0.1:8001') || url.includes('localhost:8001')) {
    return url.replace(/https?:\/\/[^\/]+\/media\//, '/cms-media/');
  }
  
  // Relative media URLs
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  
  // Full URLs (Unsplash, etc.)
  if (url.startsWith('http')) {
    return url;
  }
  
  return url;
};

const ImageWithFallback = ({ src, alt, className, width, height, priority = false }) => {
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
      alt={alt || 'Trending image'}
      className={className}
      width={width}
      height={height}
      onError={() => setError(true)}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
};

export default function TrendingIndex() {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 6;

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching trending from Oracle CMS');
        
        const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';
        
        // Try multiple endpoints
        const endpoints = [
          `${baseUrl}/api/trending/`,
          `${baseUrl}/api/trending`,
          `${baseUrl}/api/trending/list/`,
          `${baseUrl}/trending/`,
        ];
        
        let items = [];
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Trying: ${endpoint}`);
            const response = await fetch(endpoint, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              console.log(`✅ Success from: ${endpoint}`);
              
              // Handle different response formats
              if (Array.isArray(data)) {
                items = data;
                break;
              } else if (data.results) {
                items = data.results;
                break;
              } else if (data.items) {
                items = data.items;
                break;
              } else if (data.data) {
                items = data.data;
                break;
              }
            }
          } catch (err) {
            console.log(`❌ Failed: ${endpoint}`);
          }
        }
        
        setTrendingItems(items);
        setError(null);
      } catch (error) {
        console.error('❌ Error fetching trending items:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Filter by category
  const filteredItems = selectedCategory
    ? trendingItems.filter(item => item.category?.slug === selectedCategory)
    : trendingItems;

  // Get unique categories
  const categories = [...new Map(
    trendingItems
      .filter(item => item.category)
      .map(item => [item.category.slug, item.category])
  ).values()];

  const totalSlides = Math.ceil(filteredItems.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Reset slider when category changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCategory]);

  // Auto-play slider
  useEffect(() => {
    if (totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides, currentSlide]);

  const getItemLink = (item) => {
    // Check for redirect
    if (item.redirect) {
      return `/${item.content_type}/${item.content_slug}`;
    }
    
    // Use content_type and content_slug if available
    if (item.content_type && item.content_slug) {
      return `/${item.content_type}/${item.content_slug}`;
    }
    
    // Linked content
    if (item.linked_article) {
      return `/articles/${item.linked_article.slug}`;
    }
    if (item.linked_news) {
      return `/news/${item.linked_news.slug}`;
    }
    if (item.linked_condition) {
      return `/conditions/${item.linked_condition.slug}`;
    }
    
    // Category-based fallback
    if (item.category?.slug === 'lifestyle' || item.category?.slug === 'wellness') {
      return `/wellness/${item.slug}`;
    }
    
    // Default
    return `/trending/${item.slug}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      news: 'bg-blue-100 text-blue-800',
      disease: 'bg-red-100 text-red-800',
      article: 'bg-green-100 text-green-800',
      lifestyle: 'bg-purple-100 text-purple-800',
      wellness: 'bg-teal-100 text-teal-800',
    };
    return colors[category?.slug] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Trending</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <NextSeo
        title="Trending Health Topics - Niinfomed"
        description="Stay updated with the latest trending health news, conditions, and wellness topics"
        openGraph={{
          title: 'Trending Health Topics - Niinfomed',
          description: 'Discover what\'s trending in health and wellness',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&h=630',
              width: 1200,
              height: 630,
              alt: 'Trending Health Topics',
            },
          ],
        }}
      />
      
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">🔥 Trending Now</h1>
              {trendingItems.length > 0 && (
                <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1.5 rounded-full">
                  {trendingItems.length} items
                </span>
              )}
            </div>
            <p className="text-lg text-gray-600">
              Discover what's trending in health and wellness right now
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    !selectedCategory
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  All Trending
                </button>
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === category.slug
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No items message */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-lg text-gray-500">No trending items found in this category</p>
            </div>
          )}

          {/* Trending Items Slider */}
          {filteredItems.length > 0 && (
            <div className="relative">
              <div className="overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems
                          .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                          .map((item) => (
                            <Link
                              key={item.id}
                              href={getItemLink(item)}
                              className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                              {/* Image Container */}
                              <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                                {item.image ? (
                                  <ImageWithFallback
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    width={400}
                                    height={300}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                                    <svg className="w-16 h-16 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                  </div>
                                )}
                                
                                {/* Trending Badge */}
                                {item.trending_score > 50 && (
                                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    🔥 Hot
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-5">
                                {/* Category Tag */}
                                {item.category && (
                                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full mb-3 font-medium ${getCategoryColor(item.category)}`}>
                                    {item.category.name}
                                  </span>
                                )}

                                {/* Title */}
                                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                  {item.title}
                                </h2>

                                {/* Summary */}
                                {item.summary && (
                                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {item.summary}
                                  </p>
                                )}

                                {/* Meta Info */}
                                <div className="flex items-center justify-between text-sm">
                                  {item.trending_score && (
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      <span>{item.trending_score}</span>
                                    </div>
                                  )}
                                  
                                  {item.view_count > 0 && (
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      <span>{item.view_count.toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
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
                <div className="flex justify-center items-center gap-2 mt-8">
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
          )}
        </div>
      </div>
    </Layout>
  );
}

/* =========================================================
   ✅ STATIC GENERATION WITH MULTIPLE ENDPOINTS
========================================================= */
export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';
    
    const endpoints = [
      `${baseUrl}/api/trending/`,
      `${baseUrl}/api/trending`,
      `${baseUrl}/api/trending/list/`,
      `${baseUrl}/trending/`,
    ];

    console.log("🔍 Fetching trending data from Oracle CMS...");
    
    let trendingItems = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, { timeout: 10000 });
        const data = response.data;
        
        if (Array.isArray(data)) {
          trendingItems = data;
          break;
        } else if (data.results) {
          trendingItems = data.results;
          break;
        } else if (data.items) {
          trendingItems = data.items;
          break;
        } else if (data.data) {
          trendingItems = data.data;
          break;
        }
      } catch (err) {
        console.log(`❌ Endpoint failed: ${endpoint}`);
      }
    }

    console.log(`✅ Found ${trendingItems.length} trending items`);
    
    return {
      props: {
        trendingItems,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching trending data:', error);
    return {
      props: {
        trendingItems: [],
      },
      revalidate: 60,
    };
  }
}
