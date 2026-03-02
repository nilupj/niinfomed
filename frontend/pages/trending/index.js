
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import Layout from '../../components/Layout';
export default function TrendingIndex() {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 6;

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://0.0.0.0:8001';
        const response = await fetch(`${apiUrl}/api/trending/`);
        const data = await response.json();
        setTrendingItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending items:', error);
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const filteredItems = selectedCategory
    ? trendingItems.filter(item => item.category?.slug === selectedCategory)
    : trendingItems;

  const categories = [...new Set(trendingItems.map(item => item.category).filter(Boolean))];
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
    // Use content_type and content_slug if available (new API format)
    if (item.content_type && item.content_slug) {
      if (item.content_type === 'articles') {
        return `/articles/${item.content_slug}`;
      } else if (item.content_type === 'news') {
        return `/news/${item.content_slug}`;
      } else if (item.content_type === 'conditions') {
        return `/conditions/${item.content_slug}`;
      } else if (item.content_type === 'wellness') {
        return `/wellness/${item.content_slug}`;
      }
    }
    
    // Fallback to linked content (old API format)
    if (item.linked_article) {
      return `/articles/${item.linked_article.slug}`;
    } else if (item.linked_news) {
      return `/news/${item.linked_news.slug}`;
    } else if (item.linked_condition) {
      return `/conditions/${item.linked_condition.slug}`;
    } else if (item.category?.slug === 'lifestyle' || item.category?.slug === 'wellness') {
      return `/wellness/${item.slug}`;
    }
    return `/trending/${item.slug}`;
  };

  return (
    <Layout>
      <NextSeo
        title="Trending Health Topics"
        description="Stay updated with the latest trending health news, conditions, and wellness topics"
      />
      
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">🔥 Trending Now</h1>
            <p className="text-gray-600">Discover what's trending in health and wellness</p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full ${
                    !selectedCategory
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Trending
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-4 py-2 rounded-full ${
                      selectedCategory === category.slug
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((item) => (
                          <Link
                            key={item.id}
                            href={getItemLink(item)}
                            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {item.image && (
                              <img
                                src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_CMS_API_URL || 'http://0.0.0.0:8001'}${item.image}`}
                                alt={item.title}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            <div className="p-4">
                              {item.category && (
                                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2">
                                  🔥 {item.category.name}
                                </span>
                              )}
                              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                              <p className="text-gray-600 text-sm mb-3">{item.summary}</p>
                              {item.trending_score && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <span>Trending Score: {item.trending_score}</span>
                                </div>
                              )}
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
          )}
        </div>
      </div>
    </Layout>
  );
}
