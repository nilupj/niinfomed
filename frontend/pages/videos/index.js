// pages/videos/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import ImageWithFallback from '../../components/ImageWithFallback';
import { 
  fetchVideos, 
  getProxiedImageUrl,
  formatDateDisplay 
} from '../../utils/api';

const DEFAULT_LANG = 'en';

// Format duration helper
const formatDuration = (seconds) => {
  if (!seconds) return null;
  
  // If already formatted (e.g., "5:30"), return as is
  if (typeof seconds === 'string' && seconds.includes(':')) {
    return seconds;
  }
  
  // Convert seconds to MM:SS format
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format view count
const formatViewCount = (views) => {
  if (!views && views !== 0) return null;
  
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};

export default function VideosIndex({ videos: initialVideos = [], error: initialError }) {
  const [videos, setVideos] = useState(initialVideos);
  const [loading, setLoading] = useState(!initialVideos.length);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    // If we already have videos from getStaticProps, don't fetch again
    if (initialVideos.length > 0) {
      setVideos(initialVideos);
      setLoading(false);
      return;
    }

    const fetchVideosData = async () => {
      try {
        setLoading(true);
        setError(null);

        const videosData = await fetchVideos(20, DEFAULT_LANG);
        
        setVideos(videosData || []);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideosData();
  }, [initialVideos]);

  /* =======================
     Loading State
  ======================= */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-52 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =======================
     Error State
  ======================= */
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl mx-auto">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            {error}
          </h1>
          <Link href="/" className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  /* =======================
     Page UI
  ======================= */
  return (
    <>
      <NextSeo
        title="Health Videos | Medical & Wellness Education - Niinfomed"
        description="Watch educational health videos on wellness, fitness, nutrition, diseases, and preventive care."
        openGraph={{
          title: 'Health Videos | Medical & Wellness Education - Niinfomed',
          description: 'Watch educational health videos on wellness, fitness, nutrition, diseases, and preventive care.',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=1200&h=630',
              width: 1200,
              height: 630,
              alt: 'Health Videos',
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Videos</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Watch educational health videos on wellness, fitness, nutrition, diseases, and preventive care.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {videos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No videos available</h2>
            <p className="text-gray-600 mb-6">Check back soon for new health videos.</p>
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
              <h2 className="text-2xl font-bold">All Videos</h2>
              <p className="text-gray-600">{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const imageUrl = getProxiedImageUrl(video.thumbnail || video.image);
                const videoDuration = formatDuration(video.duration);
                const viewCount = formatViewCount(video.views);
                
                return (
                  <Link
                    key={video.id || video.slug}
                    href={`/videos/${video.slug}`}
                    className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={imageUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallbackSrc="https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=800&h=500"
                        width={400}
                        height={225}
                      />
                      
                      {/* Duration Badge */}
                      {videoDuration && (
                        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded font-medium">
                          {videoDuration}
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {video.category && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                          {video.category.name}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {video.title}
                      </h2>

                      {video.subtitle && (
                        <p className="text-sm text-blue-600 mb-2 line-clamp-1">{video.subtitle}</p>
                      )}

                      {video.summary && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                          {video.summary}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm mt-2">
                        {video.published_at && (
                          <span className="text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(video.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                        
                        {viewCount && (
                          <span className="text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {viewCount} views
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Newsletter Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated with New Videos</h3>
            <p className="mb-6 text-blue-100">Get notified when we publish new health and wellness videos.</p>
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
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
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

/* =========================================================
   ✅ STATIC GENERATION
========================================================= */
export async function getStaticProps() {
  try {
    console.log("🔍 Fetching videos data from Oracle CMS...");
    
    const videos = await fetchVideos(20, DEFAULT_LANG);

    console.log(`✅ Found ${videos?.length || 0} videos`);
    
    return {
      props: {
        videos: videos || [],
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return {
      props: {
        videos: [],
        error: 'Failed to load videos. Please try again later.',
      },
      revalidate: 60,
    };
  }
}