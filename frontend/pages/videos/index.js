import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

/**
 * CMS API URL resolution strategy:
 * 1. Use NEXT_PUBLIC_CMS_API_URL if defined
 * 2. Otherwise dynamically use the current hostname (LAN / mobile safe)
 *    e.g. http://192.168.31.238:8001
 */
const CMS_API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL ||
  `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8001`;

export default function VideosIndex() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${CMS_API_URL}/api/videos/?limit=20&lang=en`
        );

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        // Support both paginated & non-paginated responses
        setVideos(Array.isArray(data) ? data : data.results || []);
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
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error}
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  /* =======================
     Page UI
  ======================= */
  return (
    <>
      <NextSeo
        title="Health Videos | Medical & Wellness Education"
        description="Watch educational health videos on wellness, fitness, nutrition, diseases, and preventive care."
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Health Videos</h1>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">
              No videos available yet.
            </p>
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={
                    video.image
                      ? video.image.startsWith('http')
                        ? video.image
                        : `${CMS_API_URL}${video.image}`
                      : '/placeholder.jpg'
                  }
                  alt={video.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />

                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                    {video.title}
                  </h2>

                  {video.summary && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {video.summary}
                    </p>
                  )}

                  {video.duration && (
                    <span className="text-sm text-gray-500">
                      Duration: {video.duration}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
