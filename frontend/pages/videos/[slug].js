// pages/videos/[slug].js
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import {
  fetchVideoBySlug,
  fetchVideos,
  getProxiedImageUrl,
  getSafeCMSUrl,
  parseDateSafe,
  formatDateDisplay,
  getTimeAgo,
  tryEndpoints
} from '../../utils/api';

const DEFAULT_LANG = 'en';

/* =========================================================
   ✅ Date Functions
========================================================= */

const createFallbackDates = () => {
  const now = new Date();
  const publishedDate = new Date(now);
  publishedDate.setDate(now.getDate() - 7);
  const updatedDate = new Date(now);
  updatedDate.setDate(now.getDate() - 1);

  return {
    published: publishedDate,
    updated: updatedDate,
    isFallback: true
  };
};

const extractDatesFromVideo = (video) => {
  if (!video) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      isFallback: true
    };
  }

  const dateFieldGroups = {
    published: [
      'published_at', 'publish_date', 'first_published_at', 
      'created_at', 'date_published', 'date', 'upload_date'
    ],
    updated: [
      'updated_at', 'updated_date', 'last_published_at', 
      'modified_at', 'modified_date', 'last_updated'
    ]
  };

  const findDateFromFields = (fields) => {
    for (const field of fields) {
      if (video[field]) {
        const date = parseDateSafe(video[field]);
        if (date) return date;
      }
    }
    return null;
  };

  const publishedDate = findDateFromFields(dateFieldGroups.published);
  const updatedDate = findDateFromFields(dateFieldGroups.updated);

  if (!publishedDate && !updatedDate) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      isFallback: true
    };
  }

  const finalPublishedDate = publishedDate || updatedDate;
  const finalUpdatedDate = updatedDate || publishedDate;

  return {
    publishedDate: finalPublishedDate,
    updatedDate: finalUpdatedDate,
    isFallback: false
  };
};

/* =========================================================
   ✅ DateDisplay Component
========================================================= */

const DateDisplay = ({
  publishedDate,
  updatedDate,
  isFallback = false,
  compact = false,
  className = ""
}) => {
  if (compact) {
    return (
      <div 
        className={`flex flex-wrap items-center gap-2 text-sm text-gray-600 ${className}`}
        aria-label="Publication dates"
      >
        <svg 
          className="w-4 h-4 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>

        <span className="font-medium">Published:</span>
        <time 
          dateTime={publishedDate?.toISOString() || ''}
          className="whitespace-nowrap"
        >
          {formatDateDisplay(publishedDate)}
        </time>

        {isFallback && (
          <span 
            className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
            aria-label="Estimated date"
          >
            Estimated
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Video timeline">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Published Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Publication information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Published</h4>
              <p className="text-xs text-gray-500">When this video was published</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={publishedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(publishedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(publishedDate)}
            </span>
          </div>
        </div>

        {/* Updated Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Update information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg 
                className="w-5 h-5 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Last Updated</h4>
              <p className="text-xs text-gray-500">Last modification date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={updatedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(updatedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(updatedDate)}
            </span>
          </div>
        </div>
      </div>

      {isFallback && (
        <div 
          className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
          role="alert"
          aria-label="Estimated dates notice"
        >
          <div className="flex items-start gap-3">
            <svg 
              className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-yellow-800 mb-1">Estimated Date</h5>
              <p className="text-sm text-yellow-700">
                This video was recently added to our database. The date shown is estimated.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   ✅ Helper Functions
========================================================= */

// Format video URL for embedding
const getEmbedUrl = (url) => {
  if (!url) return null;
  
  // YouTube
  if (url.includes('youtube.com/watch')) {
    try {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
      console.error('Error parsing YouTube URL:', e);
    }
  }
  // YouTube Shorts
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  // YouTube embed
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  // Vimeo embed
  if (url.includes('player.vimeo.com')) {
    return url;
  }
  // Already an embed URL or direct video file
  return url;
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

/* =========================================================
   ✅ Skeleton Loader Component
========================================================= */
const SkeletonLoader = () => (
  <div className="container mx-auto px-4 py-8 max-w-6xl animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
    
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-video w-full bg-gray-200"></div>
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex gap-4 mb-6">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-24 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */
export default function VideoPage({ video: initialVideo, relatedVideos: initialRelated, error }) {
  const router = useRouter();
  const { slug } = router.query;

  const [video, setVideo] = useState(initialVideo);
  const [relatedVideos, setRelatedVideos] = useState(initialRelated || []);
  const [loading, setLoading] = useState(!initialVideo);
  const [loadError, setLoadError] = useState(error);

  const { publishedDate, updatedDate, isFallback } = useMemo(
    () => extractDatesFromVideo(video),
    [video]
  );

  useEffect(() => {
    if (!slug || initialVideo) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const videoData = await fetchVideoBySlug(slug, DEFAULT_LANG);
        
        if (!videoData) {
          throw new Error('Video not found');
        }
        
        setVideo(videoData);

        // Fetch related videos
        const videosList = await fetchVideos(6, DEFAULT_LANG);
        setRelatedVideos(videosList.filter(v => v.slug !== slug).slice(0, 3));
        
      } catch (err) {
        console.error('Error fetching video:', err);
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, initialVideo]);

  if (router.isFallback || loading) {
    return <SkeletonLoader />;
  }

  if (loadError || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg">
          <svg 
            className="w-16 h-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-bold text-red-600 mb-3">
            {loadError || 'Video not found'}
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

  const embedUrl = video.video_url ? getEmbedUrl(video.video_url) : null;
  const thumbnailUrl = getProxiedImageUrl(video.thumbnail || video.image);
  const viewCount = formatViewCount(video.views);

  // SEO
  const pageTitle = `${video.title} | Health Videos - Niinfomed`;
  const pageDescription = video.summary || video.subtitle || `Watch ${video.title} on Niinfomed`;
  const pageUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `https://niinfomed.com/videos/${slug}`;

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://player.vimeo.com" />
        
        {/* Schema.org markup for Video */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              "name": video.title,
              "description": pageDescription,
              "thumbnailUrl": thumbnailUrl,
              "uploadDate": publishedDate?.toISOString() || new Date().toISOString(),
              "duration": video.duration,
              "contentUrl": video.video_url,
              "embedUrl": embedUrl,
              "interactionCount": video.views ? `${video.views}` : undefined
            })
          }}
        />
      </Head>

      <NextSeo
        title={pageTitle}
        description={pageDescription}
        canonical={pageUrl}
        openGraph={{
          title: video.title,
          description: pageDescription,
          url: pageUrl,
          images: thumbnailUrl ? [
            { 
              url: thumbnailUrl, 
              width: 1280, 
              height: 720,
              alt: video.title 
            }
          ] : [],
          siteName: "Niinfomed",
          type: "video.other",
          videos: embedUrl ? [
            {
              url: embedUrl,
              secureUrl: embedUrl.startsWith('https') ? embedUrl : null,
              type: "text/html",
              width: 1280,
              height: 720
            }
          ] : undefined
        }}
        twitter={{
          handle: '@niinfomed',
          site: '@niinfomed',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'article:published_time',
            content: publishedDate?.toISOString() || '',
          },
          {
            name: 'article:modified_time',
            content: updatedDate?.toISOString() || '',
          },
        ]}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/videos" className="hover:text-blue-600 transition-colors">
            Videos
          </Link>
          <span aria-hidden="true">/</span>
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
                    loading="lazy"
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
                  
                  <DateDisplay
                    publishedDate={publishedDate}
                    updatedDate={updatedDate}
                    isFallback={isFallback}
                    compact={true}
                  />

                  {viewCount && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{viewCount} views</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {video.description && (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: video.description }}
                  />
                )}

                {/* Timeline Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <DateDisplay
                    publishedDate={publishedDate}
                    updatedDate={updatedDate}
                    isFallback={isFallback}
                  />
                </div>

                {/* Transcript (if available) */}
                {video.transcript && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Transcript</h2>
                    <div 
                      className="prose prose-lg max-w-none text-gray-700"
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
                        key={v.id || v.slug} 
                        href={`/videos/${v.slug}`}
                        className="block group"
                        prefetch={false}
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {vThumbnail ? (
                              <img
                                src={vThumbnail}
                                alt={v.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                width={96}
                                height={64}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/images/video-placeholder.jpg';
                                }}
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
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {v.duration}
                              </p>
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
    </>
  );
}

//
// 🔥 STATIC GENERATION WITH MULTIPLE ENDPOINTS
//
export async function getStaticPaths() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    
    const response = await fetch(`${baseUrl}/api/videos/`);
    const data = await response.json();
    
    const videos = data.results || data.items || data;
    
    const paths = videos
      .filter(v => v && v.slug && typeof v.slug === 'string')
      .map(v => ({
        params: { slug: v.slug },
      }));

    console.log(`✅ Generated ${paths.length} video paths`);
    return { 
      paths, 
      fallback: 'blocking' 
    };
    
  } catch (error) {
    console.error('❌ Error in getStaticPaths:', error.message);
    return { 
      paths: [], 
      fallback: 'blocking' 
    };
  }
}

export async function getStaticProps({ params }) {
  if (!params?.slug) {
    return { notFound: true };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
    const slug = params.slug;
    
    console.log(`📡 Fetching video: ${slug} from Oracle CMS`);

    const [video, videosList] = await Promise.allSettled([
      fetchVideoBySlug(slug, DEFAULT_LANG),
      fetchVideos(6, DEFAULT_LANG)
    ]);

    if (video.status === 'rejected' || !video.value) {
      console.warn(`Video not found for slug: ${slug}`);
      return { 
        notFound: true, 
        revalidate: 60 
      };
    }

    const relatedVideos = videosList.status === 'fulfilled'
      ? videosList.value.filter(v => v.slug !== slug).slice(0, 3)
      : [];

    return {
      props: {
        video: video.value,
        relatedVideos,
      },
      revalidate: 3600, // Revalidate every hour
    };
    
  } catch (error) {
    console.error(`❌ Error fetching video ${params.slug}:`, error.message);
    
    return { 
      props: {
        error: 'Failed to load video. Please try again later.',
        video: null,
        relatedVideos: []
      },
      revalidate: 60 // Try again in 60 seconds
    };
  }
}
