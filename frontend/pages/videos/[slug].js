import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import axios from 'axios';

const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';
const DEFAULT_LANG = 'en';

// Helper to get proxied image URL
const getProxiedImageUrl = (url) => {
  if (!url) return null;

  if (url.includes('161.118.167.107')) {
    return url.replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/');
  }
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  return url;
};

// Layout component
const Layout = ({ children }) => <>{children}</>;

export default function VideoPage({ video: initialVideo, relatedVideos: initialRelated }) {
  const router = useRouter();
  const { slug } = router.query;

  const [video, setVideo] = useState(initialVideo);
  const [relatedVideos, setRelatedVideos] = useState(initialRelated || []);
  const [loading, setLoading] = useState(!initialVideo);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug || initialVideo) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch video details
        const videoRes = await fetch(
          `${CMS_API_URL}/api/videos/${slug}/?lang=${DEFAULT_LANG}`
        );
        
        if (!videoRes.ok) {
          if (videoRes.status === 404) {
            throw new Error('Video not found');
          }
          throw new Error(`Failed to fetch video: ${videoRes.status}`);
        }
        
        const videoData = await videoRes.json();
        setVideo(videoData);

        // Fetch related videos (excluding current)
        const relatedRes = await fetch(
          `${CMS_API_URL}/api/videos/?limit=6&lang=${DEFAULT_LANG}`
        );
        
        const relatedData = await relatedRes.json();
        
        // Handle different response formats
        let relatedList = [];
        if (Array.isArray(relatedData)) {
          relatedList = relatedData;
        } else if (relatedData.results) {
          relatedList = relatedData.results;
        } else if (relatedData.items) {
          relatedList = relatedData.items;
        }

        setRelatedVideos(relatedList.filter(v => v.slug !== slug).slice(0, 3));
        
      } catch (err) {
        console.error('Error fetching video:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, initialVideo]);

  if (router.isFallback || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg">
          <h1 className="text-xl font-bold text-red-600 mb-3">
            {error || 'Video not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The video you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/videos" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Videos
          </Link>
        </div>
      </div>
    );
  }

  // Format video URL for embedding
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // YouTube Shorts
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    // Already an embed URL
    return url;
  };

  const embedUrl = video.video_url ? getEmbedUrl(video.video_url) : null;
  const thumbnailUrl = getProxiedImageUrl(video.thumbnail || video.image);

  return (
    <Layout>
      <NextSeo
        title={`${video.title} | Health Videos - Niinfomed`}
        description={video.summary || video.subtitle || `Watch ${video.title} on Niinfomed`}
        openGraph={{
          title: video.title,
          description: video.summary || video.subtitle || '',
          images: thumbnailUrl ? [{ url: thumbnailUrl }] : [],
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/videos" className="hover:text-blue-600 transition-colors">
            Videos
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{video.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Video Player */}
              {embedUrl && (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Video Info */}
              <div className="p-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {video.title}
                </h1>

                {video.subtitle && (
                  <p className="text-lg text-gray-600 mb-4">{video.subtitle}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                  {video.duration && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{video.duration}</span>
                    </div>
                  )}
                  
                  {video.published_at && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time dateTime={video.published_at}>
                        {new Date(video.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  )}

                  {video.views && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{video.views.toLocaleString()} views</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {video.description && (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: video.description }}
                  />
                )}

                {/* Transcript (if available) */}
                {video.transcript && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Transcript</h2>
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: video.transcript }}
                    />
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Related Videos</h2>
                <div className="space-y-4">
                  {relatedVideos.map(v => {
                    const vThumbnail = getProxiedImageUrl(v.thumbnail || v.image);
                    
                    return (
                      <Link 
                        key={v.id} 
                        href={`/videos/${v.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {vThumbnail ? (
                              <img
                                src={vThumbnail}
                                alt={v.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                              {v.title}
                            </h3>
                            {v.duration && (
                              <p className="text-xs text-gray-500 mt-1">{v.duration}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href="/videos"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse All Videos
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

//
// 🔥 STATIC GENERATION
//
export async function getStaticPaths() {
  try {
    console.log('🔍 Fetching video paths from:', `${CMS_API_URL}/api/videos/`);
    
    // Fetch all videos to get slugs
    const res = await axios.get(`${CMS_API_URL}/api/videos/`, {
      params: { limit: 100, lang: DEFAULT_LANG },
      timeout: 10000
    });

    // Handle different response formats
    let videos = [];
    if (Array.isArray(res.data)) {
      videos = res.data;
    } else if (res.data.results) {
      videos = res.data.results;
    } else if (res.data.items) {
      videos = res.data.items;
    }

    const paths = videos
      .filter(v => v.slug)
      .map(v => ({
        params: { slug: v.slug },
      }));

    console.log(`✅ Found ${paths.length} video paths`);
    return { paths, fallback: 'blocking' };
    
  } catch (error) {
    console.error('❌ Error in getStaticPaths:', error.message);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    console.log(`📡 Fetching video: ${params.slug} from Oracle CMS`);
    
    // Fetch video details
    const videoRes = await axios.get(
      `${CMS_API_URL}/api/videos/${params.slug}/`,
      { 
        params: { lang: DEFAULT_LANG },
        timeout: 10000
      }
    );

    // Fetch related videos
    const relatedRes = await axios.get(
      `${CMS_API_URL}/api/videos/`,
      { 
        params: { limit: 6, lang: DEFAULT_LANG },
        timeout: 10000
      }
    );

    // Handle related videos response format
    let relatedList = [];
    if (Array.isArray(relatedRes.data)) {
      relatedList = relatedRes.data;
    } else if (relatedRes.data.results) {
      relatedList = relatedRes.data.results;
    } else if (relatedRes.data.items) {
      relatedList = relatedRes.data.items;
    }

    const relatedVideos = relatedList
      .filter(v => v.slug !== params.slug)
      .slice(0, 3);

    return {
      props: {
        video: videoRes.data,
        relatedVideos,
      },
      revalidate: 3600, // Revalidate every hour
    };
    
  } catch (error) {
    console.error(`❌ Error fetching video ${params.slug}:`, error.message);
    
    // Check if it's a 404
    if (error.response?.status === 404) {
      return { notFound: true };
    }
    
    return { 
      notFound: true,
      revalidate: 60 // Try again in 60 seconds
    };
  }
}