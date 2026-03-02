import Link from 'next/link';
export const runtime = "edge";
// Helper to get proxied image URL
const getProxiedImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://0.0.0.0:8001') || url.startsWith('http://127.0.0.1:8001')) {
    return url.replace(/http:\/\/(0\.0\.0\.0|127\.0\.0\.1):8001/, '/cms-media').replace('/cms-media/media/', '/cms-media/');
  }
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  return url;
};

export default function FeaturedArticle({ article, href }) {
  const {
    title,
    slug,
    image,
    summary,
    published_date,
    author,
    content_type
  } = article;

  const formattedDate = published_date ? new Date(published_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  // Determine the correct link based on content type or use provided href
  const getLink = () => {
    if (href) return href;
    if (content_type === 'news') return `/news/${slug}`;
    if (content_type === 'conditions') return `/conditions/${slug}`;
    if (content_type === 'wellness') return `/wellness/${slug}`;
    return `/articles/${slug}`;
  };

  const linkHref = getLink();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] w-full md:h-full">
        {image ? (
          <img
            src={getProxiedImageUrl(image)}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-neutral-800 hover:text-primary transition-colors">
          <Link href={linkHref}>
            {title}
          </Link>
        </h2>
        {author && (
          <div className="mb-2 text-neutral-600 text-sm">
            By {author.name}{author.credentials ? `, ${author.credentials}` : ''}
          </div>
        )}
        {formattedDate && (
          <div className="mb-3 text-neutral-500 text-xs">
            {formattedDate}
          </div>
        )}
        <p className="text-neutral-600 mb-4 line-clamp-3">
          {summary}
        </p>
        <Link 
          href={linkHref}
          className="inline-flex items-center text-primary font-medium hover:text-primary-dark"
        >
          Read more
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}