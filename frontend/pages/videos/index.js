import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { NextSeo } from 'next-seo';

// Oracle CMS URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';
const DEFAULT_LANG = 'en';

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

export default function VideosIndex() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';
        
        // Try multiple endpoints
        const endpoints = [
          `${baseUrl}/api/videos/?limit=20&lang=${DEFAULT_LANG}`,
          `${baseUrl}/api/videos?limit=20&lang=${DEFAULT_LANG}`,
          `${baseUrl}/api/videos/list/?limit=20&lang=${DEFAULT_LANG}`,
          `${baseUrl}/api/videos/latest/?limit=20&lang=${DEFAULT_LANG}`,
          `${baseUrl}/api/v2/pages/?type=videos.VideoPage&limit=20&lang=${DEFAULT_LANG}`,
        ];
        
        let videosData = [];
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Trying: ${endpoint}`);
            const res = await fetch(endpoint);
            
            if (res.ok) {
              const data = await res.json();
              
              // Handle different response formats
              if (Array.isArray(data)) {
                videosData = data;
                console.log(`✅ Found ${data.length} videos at: ${endpoint}`);
                break;
              } else if (data.results) {
                videosData = data.results;
                console.log(`✅ Found ${data.results.length} videos at: ${endpoint}`);
                break;
              } else if (data.items) {
                videosData = data.items;
                console.log(`✅ Found ${data.items.length} videos at: ${endpoint}`);
                break;
              } else if (data.data) {
                videosData = data.data;
                console.log(`✅ Found ${data.data.length} videos at: ${endpoint}`);
                break;
              }
            }
          } catch (err) {
            console.log(`❌ Failed: ${endpoint}`);
          }
        }

        setVideos(videosData);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
        }}
      />

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
              <p className="text-gray-600">{videos.length} videos</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const imageUrl = getProxiedImageUrl(video.image || video.thumbnail);
                
                return (
                  <Link
                    key={video.id}
                    href={`/videos/${video.slug}`}
                    className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=800&q=75';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                          <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {video.title}
                      </h2>

                      {video.subtitle && (
                        <p className="text-sm text-blue-600 mb-2">{video.subtitle}</p>
                      )}

                      {video.summary && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                          {video.summary}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm">
                        {video.published_at && (
                          <span className="text-gray-500">
                            {new Date(video.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                        
                        {video.views > 0 && (
                          <span className="text-gray-500">
                            {video.views.toLocaleString()} views
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
      </div>
    </>
  );
}

/* =========================================================
   ✅ STATIC GENERATION WITH MULTIPLE ENDPOINTS
========================================================= */
export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';
    
    const endpoints = [
      `${baseUrl}/api/videos/`,
      `${baseUrl}/api/videos`,
      `${baseUrl}/api/videos/list/`,
      `${baseUrl}/api/videos/latest/`,
      `${baseUrl}/api/v2/pages/?type=videos.VideoPage`,
    ];

    console.log("🔍 Fetching videos data from Oracle CMS...");
    
    let videos = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, { 
          params: { limit: 20, lang: DEFAULT_LANG },
          timeout: 10000 
        });
        
        const data = response.data;
        
        if (Array.isArray(data)) {
          videos = data;
          break;
        } else if (data.results) {
          videos = data.results;
          break;
        } else if (data.items) {
          videos = data.items;
          break;
        } else if (data.data) {
          videos = data.data;
          break;
        }
      } catch (err) {
        console.log(`❌ Endpoint failed: ${endpoint}`);
      }
    }

    console.log(`✅ Found ${videos.length} videos`);
    
    return {
      props: {
        videos,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return {
      props: {
        videos: [],
      },
      revalidate: 60,
    };
  }
}
