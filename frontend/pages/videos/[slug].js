import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import axios from 'axios';

const CMS_API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:8001';

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

        const videoRes = await fetch(`${CMS_API_URL}/videos/${slug}/?lang=en`);
        if (!videoRes.ok) throw new Error('Video not found');
        const videoData = await videoRes.json();
        setVideo(videoData);

        const relatedRes = await fetch(`${CMS_API_URL}/videos/?limit=6&lang=en`);
        const relatedData = await relatedRes.json();

        setRelatedVideos(
          relatedData.results
            ? relatedData.results.filter(v => v.slug !== slug)
            : relatedData.filter(v => v.slug !== slug)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, initialVideo]);

  if (router.isFallback || loading) {
    return <div className="p-10 text-center">Loading…</div>;
  }

  if (error || !video) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold text-red-600">
          {error || 'Video not found'}
        </h1>
        <Link href="/videos" className="text-blue-600 underline">
          Back to videos
        </Link>
      </div>
    );
  }

  return (
    <Layout>
      <NextSeo
        title={`${video.title} | Health Video`}
        description={video.summary || video.subtitle || ''}
      />

      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/">Home</Link> / <Link href="/videos">Videos</Link> / {video.title}
        </nav>

        <article className="bg-white p-6 rounded shadow">
          <h1 className="text-3xl font-bold mb-3">{video.title}</h1>

          {video.subtitle && (
            <p className="text-gray-600 mb-4">{video.subtitle}</p>
          )}

          {video.video_url && (
            <div className="aspect-video mb-6">
              <iframe
                src={
                  video.video_url.includes('youtube')
                    ? video.video_url
                        .replace('watch?v=', 'embed/')
                        .replace('youtu.be/', 'youtube.com/embed/')
                    : video.video_url
                }
                className="w-full h-full rounded"
                allowFullScreen
              />
            </div>
          )}

          {video.description && (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: video.description }}
            />
          )}
        </article>

        {relatedVideos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Videos</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedVideos.slice(0, 3).map(v => (
                <Link key={v.id} href={`/videos/${v.slug}`}>
                  <div className="bg-white shadow rounded overflow-hidden hover:shadow-lg">
                    <img
                      src={v.image || '/placeholder.jpg'}
                      alt={v.title}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2">{v.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

//
// 🔥 STATIC GENERATION
//
export async function getStaticPaths() {
  try {
    const res = await axios.get(`${CMS_API_URL}/video-paths/`);
    const paths = res.data.map(slug => ({
      params: { slug },
    }));

    return { paths, fallback: 'blocking' };
  } catch (e) {
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const [videoRes, relatedRes] = await Promise.all([
      axios.get(`${CMS_API_URL}/videos/${params.slug}/`),
      axios.get(`${CMS_API_URL}/videos/?limit=6`)
    ]);

    const related =
      relatedRes.data.results || relatedRes.data;

    return {
      props: {
        video: videoRes.data,
        relatedVideos: related.filter(v => v.slug !== params.slug),
      },
      revalidate: 3600,
    };
  } catch (e) {
    return { notFound: true, revalidate: 60 };
  }
}
