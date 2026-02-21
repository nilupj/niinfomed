import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FeaturedArticle from '../components/FeaturedArticle';
import ArticleCard from '../components/ArticleCard';
import DiscoverImage from '../components/DiscoverImage';
import { 
  fetchTopStories, 
  fetchHealthTopics, 
  fetchLatestNews, 
  fetchWellnessTopics, 
  fetchLatestConditions, 
  fetchHomeopathyTopics, 
  fetchAyurvedaTopics, 
  fetchYogaTopics, 
  fetchVideos, 
  fetchSocialPosts, 
  getImageUrl // Using the existing getImageUrl function
} from '../utils/api';

/* =========================================================
   ✅ PERFORMANCE OPTIMIZATIONS
========================================================= */

// ✅ Optimized fetch with cache
const cachedFetches = new Map();
const CACHE_DURATION = 300000; // 5 minutes

const fetchWithCache = async (key, fetchFn) => {
  const now = Date.now();
  const cached = cachedFetches.get(key);
  
  if (cached && (now - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cachedFetches.set(key, { data, timestamp: now });
  return data;
};

// ✅ Simple image optimization function
const getOptimizedImageUrl = (url) => {
  if (!url) return null;
  
  // If URL already has http/https, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path, use the existing getImageUrl function
  return getImageUrl(url);
};

// ✅ Optimized Video Section Component
const VideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        // ✅ Use cached fetch
        const data = await fetchWithCache('videos', () => 
          fetchVideos(6)
        );
        setVideos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ Defer non-critical loading
    setTimeout(fetchVideoData, 100);
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '5:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Health Videos</h2>
          <p className="text-sm text-neutral-600">Expert insights and wellness tips</p>
        </div>
        <Link href="/videos" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
          View All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-neutral-200"></div>
              <div className="p-5">
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Link key={video.id} href={`/videos/${video.slug}`} className="group">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={getOptimizedImageUrl(video.thumbnail) || getOptimizedImageUrl(video.image) || 'https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=800&h=500'}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded font-medium">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                  {video.category && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {video.category.name}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-neutral-800 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-3">
                    {video.summary || video.description || 'Watch this informative health video.'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-600">No health videos available at the moment.</p>
        </div>
      )}
    </section>
  );
};

// ✅ Optimized Social Media Section Component
const SocialMediaSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        // ✅ Use cached fetch
        const data = await fetchWithCache('social_posts', () => 
          fetchSocialPosts(6)
        );
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching social posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ Defer non-critical loading
    setTimeout(fetchSocialData, 100);
  }, []);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">From Our Community</h2>
          <p className="text-sm text-neutral-600">Join the conversation</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-neutral-200"></div>
              <div className="p-4">
                <div className="h-3 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <div key={post.id || index} className="group">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={getOptimizedImageUrl(post.image) || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&h=400'}
                    alt={post.caption || 'Social media post'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                    quality={75}
                  />
                  {post.platform && (
                    <span className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {post.platform}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm text-neutral-700 mb-3 line-clamp-2">{post.caption || 'Check out our latest post!'}</p>
                  <div className="flex items-center text-neutral-500 text-sm">
                    <svg className="w-5 h-5 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>{post.likes || '0'} likes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-600">No community posts available at the moment.</p>
        </div>
      )}
    </section>
  );
};

/* =========================================================
   ✅ OPTIMIZED SECTION COMPONENTS
========================================================= */

const HomeopathySection = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // ✅ Use cached fetch
        const data = await fetchWithCache('homeopathy_topics', () => 
          fetchHomeopathyTopics(6)
        );
        setTopics(data || []);
      } catch (error) {
        console.error('Error fetching homeopathy topics:', error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ Defer non-critical loading
    setTimeout(fetchTopics, 100);
  }, []);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Homeopathic Remedies</h2>
          <p className="text-sm text-neutral-600">Natural healing solutions</p>
        </div>
        <Link href="/homeopathy" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
          View All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
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
            <Link key={topic.id} href={`/homeopathy/${topic.slug}`} className="group">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={getOptimizedImageUrl(topic.image) || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&h=500'}
                    alt={topic.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                    quality={75}
                  />
                  {topic.category && (
                    <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {topic.category.name}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-neutral-800 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-3">
                    {topic.summary || topic.subtitle || 'Learn more about this homeopathic remedy.'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-600">No homeopathy topics available at the moment.</p>
        </div>
      )}
    </section>
  );
};

const AyurvedaSection = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // ✅ Use cached fetch
        const data = await fetchWithCache('ayurveda_topics', () => 
          fetchAyurvedaTopics(6)
        );
        setTopics(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching ayurveda topics:', error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ Defer non-critical loading
    setTimeout(fetchTopics, 100);
  }, []);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Ayurvedic Wisdom</h2>
          <p className="text-sm text-neutral-600">Ancient healing for modern wellness</p>
        </div>
        <Link href="/ayurveda" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
          View All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
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
            <Link key={topic.id} href={`/ayurveda/${topic.slug}`} className="group">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={getOptimizedImageUrl(topic.image) || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&h=500'}
                    alt={topic.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                    quality={75}
                  />
                  {topic.category && (
                    <span className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {topic.category.name}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-neutral-800 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-3">
                    {topic.summary || 'Discover ancient Ayurvedic wisdom for holistic health.'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-600">No Ayurveda topics available at the moment.</p>
        </div>
      )}
    </section>
  );
};

const YogaSection = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // ✅ Use cached fetch
        const data = await fetchWithCache('yoga_topics', () => 
          fetchYogaTopics(6)
        );
        setTopics(data || []);
      } catch (error) {
        console.error('Error fetching yoga topics:', error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ Defer non-critical loading
    setTimeout(fetchTopics, 100);
  }, []);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Yoga & Exercise</h2>
          <p className="text-sm text-neutral-600">Strengthen body and mind</p>
        </div>
        <Link href="/yoga-exercise" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
          View All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
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
            <Link key={topic.id} href={`/yoga-exercise/${topic.slug}`} className="group">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={getOptimizedImageUrl(topic.image) || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&h=500'}
                    alt={topic.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                    quality={75}
                  />
                  {topic.category && (
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {topic.category.name}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-neutral-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-3">
                    {topic.summary || 'Learn more about this yoga practice.'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-600">No yoga topics available at the moment.</p>
        </div>
      )}
    </section>
  );
};

/* =========================================================
   ✅ OPTIMIZED HOME COMPONENT
========================================================= */

export default function Home({ initialTopStories, healthTopics: initialHealthTopics, wellnessTopics: initialWellnessTopics }) {
  // ✅ Use memoized initial state
  const [topStories] = useState(initialTopStories || []);
  const [healthTopics] = useState(initialHealthTopics || []);
  const [wellnessTopics] = useState(initialWellnessTopics || []);
  
  // ✅ Lazy states for non-critical content
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [trendingCategory, setTrendingCategory] = useState('news');
  const [trendingContent, setTrendingContent] = useState([]);
  const [homeopathyTopics, setHomeopathyTopics] = useState([]);
  const [ayurvedaTopics, setAyurvedaTopics] = useState([]);
  const [yogaTopics, setYogaTopics] = useState([]);
  const [videos, setVideos] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  // ✅ Slider state with useCallback
  const itemsPerSlide = 3;
  const [currentSlide, setCurrentSlide] = useState(0);
  const trendingContentForSlider = trendingContent;
  const totalSlides = Math.ceil(trendingContentForSlider.length / itemsPerSlide);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((slideIndex) => {
    setCurrentSlide(slideIndex);
  }, []);

  // ✅ Memoized derived data
  const filteredWellnessTopics = useMemo(() => {
    return selectedCategory === 'all'
      ? wellnessTopics
      : wellnessTopics.filter(topic =>
        topic.category?.slug === selectedCategory ||
        topic.category?.name?.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
  }, [selectedCategory, wellnessTopics]);

  const filteredHealthTopics = useMemo(() => {
    return selectedCategory === 'all'
      ? healthTopics
      : healthTopics.filter(topic =>
        topic.category?.slug === selectedCategory ||
        topic.category?.name?.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
  }, [selectedCategory, healthTopics]);

  // ✅ Optimized content loading
  useEffect(() => {
    const loadCriticalContent = async () => {
      try {
        // Load only critical content initially
        const [articlesData, conditionsData] = await Promise.all([
          fetchWithCache('top_articles', () => fetchTopStories(6)),
          fetchWithCache('latest_conditions', () => fetchLatestConditions(6))
        ]);

        setTopArticles(articlesData || []);
        setConditions(conditionsData || []);
      } catch (error) {
        console.error('Error loading critical content:', error);
      }
    };

    loadCriticalContent();
  }, []);

  // ✅ Deferred content loading
  useEffect(() => {
    const loadDeferredContent = async () => {
      setIsLoading(true);
      try {
        // Load non-critical content after critical content
        const [newsData, homeopathyData, ayurvedaData, yogaData, videosData, socialData] = await Promise.all([
          fetchWithCache('latest_news', () => fetchLatestNews(10)),
          fetchWithCache('homeopathy_topics', () => fetchHomeopathyTopics(6)),
          fetchWithCache('ayurveda_topics', () => fetchAyurvedaTopics(6)),
          fetchWithCache('yoga_topics', () => fetchYogaTopics(6)),
          fetchWithCache('videos', () => fetchVideos(6)),
          fetchWithCache('social_posts', () => fetchSocialPosts(6))
        ]);

        setLatestNews(newsData || []);
        setHomeopathyTopics(homeopathyData || []);
        setAyurvedaTopics(ayurvedaData || []);
        setYogaTopics(yogaData || []);
        setVideos(videosData || []);
        setSocialPosts(socialData || []);
        setNews(newsData || []);
      } catch (error) {
        console.error('Error loading deferred content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Use requestIdleCallback for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadDeferredContent();
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(loadDeferredContent, 1000);
    }
  }, []);

  // ✅ Optimized trending data fetch
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        let data = [];

        switch (trendingCategory) {
          case 'news':
            data = await fetchWithCache('trending_news', () => fetchLatestNews(10));
            data = data.map(item => ({ ...item, content_type: 'news' }));
            break;
          case 'disease':
            data = await fetchWithCache('trending_conditions', () => fetchLatestConditions(10));
            data = data.map(item => ({ ...item, content_type: 'conditions' }));
            break;
          case 'article':
            data = await fetchWithCache('trending_articles', () => fetchTopStories(10));
            data = data.map(item => ({ ...item, content_type: 'articles' }));
            break;
          case 'lifestyle':
            data = await fetchWithCache('trending_wellness', () => fetchWellnessTopics(10));
            data = data.map(item => ({ ...item, content_type: 'wellness' }));
            break;
          default:
            data = await fetchWithCache('trending_default', () => fetchLatestNews(10));
            data = data.map(item => ({ ...item, content_type: 'news' }));
        }

        setTrendingContent(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setTrendingContent([]);
      }
    };

    fetchTrendingData();
  }, [trendingCategory]);

  // ✅ Preload critical images
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preload first few images for better LCP
      const preloadImages = () => {
        const imagesToPreload = [
          ...(trendingContent.slice(0, 3).map(item => getOptimizedImageUrl(item.image))),
          ...(conditions.slice(0, 3).map(item => getOptimizedImageUrl(item.image))),
          ...(wellnessTopics.slice(0, 2).map(item => getOptimizedImageUrl(item.image)))
        ].filter(Boolean);

        imagesToPreload.forEach(src => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          link.fetchPriority = 'high';
          document.head.appendChild(link);
        });
      };

      if (trendingContent.length > 0 || conditions.length > 0) {
        preloadImages();
      }
    }
  }, [trendingContent, conditions, wellnessTopics]);

  const QuizCard = ({ quiz }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        className="w-full h-48 object-cover" 
        src={getOptimizedImageUrl(quiz.image)} 
        alt={quiz.title} 
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
        <p className="text-sm text-neutral-500">{quiz.description}</p>
        <Link href={`/quiz/${quiz.slug}`} className="mt-4 inline-block text-primary hover:text-primary-dark font-medium text-sm transition-colors">
          Take Quiz
        </Link>
      </div>
    </div>
  );

  const healthCategories = useMemo(() => [
    { name: 'Heart Health', link: '/conditions/heart-disease', icon: 'heart' },
    { name: 'Diabetes Care', link: '/conditions/diabetes', icon: 'activity' },
    { name: 'Cancer Support', link: '/conditions/cancer', icon: 'thermometer' },
    { name: 'Mental Wellness', link: '/conditions/mental-health', icon: 'brain' },
    { name: 'Skin Health', link: '/conditions/skin-conditions', icon: 'sun' },
    { name: 'Digestive Health', link: '/conditions/digestive-health', icon: 'stomach' },
    { name: "Women's Health", link: '/conditions/womens-health', icon: 'female' },
    { name: "Men's Health", link: '/conditions/mens-health', icon: 'male' },
  ], []);

  return (
    <div className="container-custom py-8">
      {/* TRENDING SECTION */}
      <div className="mb-12">
        <h2 className="section-title">TRENDING</h2>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { name: 'News', slug: 'news' },
            { name: 'Disease', slug: 'disease' },
            { name: 'Article', slug: 'article' },
            { name: 'Lifestyle', slug: 'lifestyle' }
          ].map((category) => (
            <button
              key={category.slug}
              onClick={() => setTrendingCategory(category.slug)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${category.slug === trendingCategory
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary hover:text-primary'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {trendingContent && trendingContent.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trendingContentForSlider.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((article) => (
                        <ArticleCard 
                          key={article.id || article.slug} 
                          article={article} 
                          variant="medical"
                          imageUrl={getOptimizedImageUrl(article.image)}
                        />
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-primary text-neutral-700 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide === 0}
                  aria-label="Previous slide"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-primary text-neutral-700 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                      ? 'bg-primary w-8'
                      : 'bg-neutral-300 w-2 hover:bg-neutral-400'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="animate-pulse">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-neutral-200"></div>
              <div className="mx-auto w-48 h-4 mb-4 rounded bg-neutral-200"></div>
              <div className="mx-auto w-36 h-3 rounded bg-neutral-200"></div>
            </div>
          </div>
        )}
      </div>

      {/* Health & Wellness Topics */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">Health & Wellness Topics</h2>
            <p className="text-sm text-neutral-600">Stay updated with wellness topics</p>
          </div>
          <Link href="/wellness" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {filteredWellnessTopics && filteredWellnessTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWellnessTopics.slice(0, 6).map((topic) => (
              <Link key={topic.id || topic.slug} href={`/wellness/${topic.slug}`} className="group">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={getOptimizedImageUrl(topic.image) || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&h=500'}
                      alt={topic.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                      quality={75}
                    />
                    {topic.category && (
                      <span className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                        {topic.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-neutral-800 line-clamp-2 group-hover:text-primary transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-3">
                      {topic.summary || 'Learn more about this wellness topic and how it can improve your well-being.'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-600">No wellness topics available at the moment.</p>
          </div>
        )}
      </section>

      {/* Medical Services Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Medical Services</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Access comprehensive healthcare services from the comfort of your home
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Video Consultation */}
            <a
              href={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/video-consult` : '/video-consult'}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                  Video Consultation
                </h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Connect with verified doctors through secure video calls. Get instant medical advice 24/7.
                </p>
                <div className="flex items-center text-blue-200 font-semibold group-hover:gap-2 transition-all">
                  <span>Book Now</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Lab Tests */}
            <a
              href={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/lab-tests` : '/lab-tests'}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors">
                  Lab Tests at Home
                </h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Book diagnostic tests with home sample collection. Get reports online within 24-48 hours.
                </p>
                <div className="flex items-center text-green-200 font-semibold group-hover:gap-2 transition-all">
                  <span>Book Test</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Find Doctors */}
            <a
              href={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/find-doctors` : '/find-doctors'}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                  Find Doctors
                </h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Search and book appointments with specialist doctors near you. Read reviews and compare.
                </p>
                <div className="flex items-center text-purple-200 font-semibold group-hover:gap-2 transition-all">
                  <span>Find Doctors</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Find Clinics */}
            <a
              href={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/find-clinics` : '/find-clinics'}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-200 transition-colors">
                  Find Clinics
                </h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Locate verified clinics and hospitals in your area. Check facilities and book appointments.
                </p>
                <div className="flex items-center text-orange-200 font-semibold group-hover:gap-2 transition-all">
                  <span>Find Clinics</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Surgeries */}
            <a
              href={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/surgeries` : '/surgeries'}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-200 transition-colors">
                  Medical Procedures
                </h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Expert surgeons, safe facilities, and insurance support for various medical procedures.
                </p>
                <div className="flex items-center text-red-200 font-semibold group-hover:gap-2 transition-all">
                  <span>Explore Options</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Medicines */}
            <a
              href={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/medicines` : '/medicines'}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-teal-200 transition-colors">
                  Order Medicines
                </h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Order prescription medicines online and get them delivered to your doorstep.
                </p>
                <div className="flex items-center text-teal-200 font-semibold group-hover:gap-2 transition-all">
                  <span>Order Now</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <a
              href={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : '/services'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span>View All Services</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Health Conditions Section */}
      {conditions && conditions.length > 0 && (
        <section className="py-12 bg-blue-50">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Health Conditions</h2>
                <p className="text-neutral-600">Learn about various health conditions</p>
              </div>
              <Link href="/conditions" className="text-primary hover:text-primary-dark font-medium flex items-center gap-2">
                View All
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className={`grid gap-6 ${conditions.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : conditions.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {conditions.slice(0, Math.min(6, Math.max(1, conditions.length))).map((condition) => (
                <FeaturedArticle
                  key={condition.id}
                  article={{
                    id: condition.id,
                    title: condition.title,
                    slug: condition.slug,
                    summary: condition.summary || condition.subtitle || 'Learn more about this health condition',
                    image: getOptimizedImageUrl(condition.image),
                    category: condition.category || { name: 'Conditions', slug: 'conditions' },
                    published_date: condition.published_date,
                  }}
                  href={`/conditions/${condition.slug}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Homeopathic Remedies Section */}
      <HomeopathySection />

      {/* Ayurvedic Wisdom Section */}
      <AyurvedaSection />

      {/* Yoga & Exercise Section */}
      <YogaSection />

      {/* Health Videos Section */}
      <VideoSection />

      {/* From Our Community Section */}
      <SocialMediaSection />

      {/* Latest News Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-1">Latest News</h2>
            <p className="text-sm text-neutral-600">Stay updated with health news</p>
          </div>
          <Link href="/news" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-neutral-200"></div>
                <div className="p-5">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.slice(0, 6).map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`} className="group">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={getOptimizedImageUrl(article.image) || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&h=500'}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                      quality={75}
                    />
                    {article.category && (
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-neutral-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-3 mb-3">
                      {article.summary || article.subtitle || 'Read more about this health news story.'}
                    </p>
                    {article.publish_date && (
                      <p className="text-xs text-neutral-500">
                        {new Date(article.publish_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-600">No news articles available at the moment.</p>
          </div>
        )}
      </section>

      {/* Enhanced Health Categories Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Browse by Category
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Health Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover comprehensive health information across various medical specialties
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthCategories.map((category, index) => (
              <Link key={index} href={category.link}>
                <div
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative p-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 mb-2">
                        {category.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        Comprehensive information and latest updates
                      </p>

                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          50+ Articles
                        </span>
                      </div>

                      <div className="flex items-center justify-center text-primary font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                        <span>Explore Now</span>
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:w-full transition-all duration-500"></div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/conditions">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <span>View All Health Topics</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   ✅ OPTIMIZED getStaticProps
========================================================= */
export async function getStaticProps() {
  try {
    // ✅ Parallel fetching for better performance
    const [topStories, healthTopics, wellnessTopics] = await Promise.allSettled([
      fetchTopStories(12),
      fetchHealthTopics(12),
      fetchWellnessTopics(12)
    ]);

    return {
      props: {
        initialTopStories: topStories.status === 'fulfilled' ? topStories.value || [] : [],
        healthTopics: healthTopics.status === 'fulfilled' ? healthTopics.value || [] : [],
        wellnessTopics: wellnessTopics.status === 'fulfilled' ? wellnessTopics.value || [] : []
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        initialTopStories: [],
        healthTopics: [],
        wellnessTopics: []
      },
      revalidate: 60, // Retry after 1 minute on error
    };
  }
}