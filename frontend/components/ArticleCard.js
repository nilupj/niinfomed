import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

const ArticleCard = ({ article, variant = 'default' }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const getImageUrl = (article) => {
    if (article.image) {
      let imageUrl = article.image;
      // Proxy CMS media URLs to avoid mixed content issues
      if (imageUrl.startsWith('http://0.0.0.0:8001') || imageUrl.startsWith('http://127.0.0.1:8001')) {
        imageUrl = imageUrl.replace(/http:\/\/(0\.0\.0\.0|127\.0\.0\.1):8001/, '/cms-media').replace('/cms-media/media/', '/cms-media/');
      } else if (imageUrl.startsWith('/media/')) {
        imageUrl = `/cms-media${imageUrl.replace('/media/', '/')}`;
      }
      return imageUrl;
    }
    // Fallback medical-themed image based on category
    const category = article.category?.name?.toLowerCase() || '';
    if (category.includes('fitness') || category.includes('exercise')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80';
    } else if (category.includes('mental') || category.includes('psychology')) {
      return 'https://images.unsplash.com/photo-1559757175-7b21671c7e96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80';
    } else if (category.includes('nutrition') || category.includes('diet')) {
      return 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80';
    }
    // Default medical X-ray themed image
    return 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80';
  };

  const getCategoryColor = (category) => {
    const categoryName = category?.toLowerCase() || '';
    if (categoryName.includes('fitness') || categoryName.includes('exercise')) {
      return 'bg-blue-600';
    } else if (categoryName.includes('mental') || categoryName.includes('psychology')) {
      return 'bg-purple-600';
    } else if (categoryName.includes('nutrition') || categoryName.includes('diet')) {
      return 'bg-green-600';
    }
    return 'bg-indigo-600';
  };

  if (variant === 'medical') {
    // Determine the correct URL based on content type
    const getArticleUrl = () => {
      // Check category first for news
      if (article.category?.slug === 'news' || article.category?.name?.toLowerCase() === 'news') {
        return `/news/${article.slug}`;
      }
      if (article.category?.slug === 'conditions' || article.category?.name === 'Health Conditions') {
        return `/conditions/${article.slug}`;
      }
      if (article.category?.slug === 'wellness' || article.category?.name?.toLowerCase().includes('wellness')) {
        return `/wellness/${article.slug}`;
      }
      // Check if it's a news article by properties
      if (article.publish_date || article.source) {
        return `/news/${article.slug}`;
      }
      // If content_type is available, use it for routing
      if (article.content_type) {
        if (article.content_type === 'news') return `/news/${article.slug}`;
        if (article.content_type === 'conditions') return `/conditions/${article.slug}`;
        if (article.content_type === 'wellness') return `/wellness/${article.slug}`;
      }
      return `/articles/${article.slug}`;
    };

    return (
      <Link href={getArticleUrl()} className="block group">
        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
          <div className="relative h-48">
            <img
              src={getImageUrl(article)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3">
              <span className={`${getCategoryColor(article.category?.name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                {article.category?.name || 'Health'}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-neutral-800 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-neutral-600 text-sm line-clamp-3 mb-3">
              {article.summary || article.subtitle || 'Learn more about this health topic and how it can impact your wellbeing.'}
            </p>
            <div className="text-xs text-neutral-500">
              {formatDate(article.created_at || article.first_published_at || article.published_date)}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  const getArticleUrl = () => {
    // Check category first for news
    if (article.category?.slug === 'news' || article.category?.name?.toLowerCase() === 'news') {
      return `/news/${article.slug}`;
    }
    if (article.category?.slug === 'conditions' || article.category?.name === 'Health Conditions') {
      return `/conditions/${article.slug}`;
    }
    if (article.category?.slug === 'wellness' || article.category?.name?.toLowerCase().includes('wellness')) {
      return `/wellness/${article.slug}`;
    }
    // Check if it's a news article by properties
    if (article.publish_date || article.source) {
      return `/news/${article.slug}`;
    }
    // If content_type is available, use it for routing
    if (article.content_type) {
      if (article.content_type === 'news') return `/news/${article.slug}`;
      if (article.content_type === 'conditions') return `/conditions/${article.slug}`;
      if (article.content_type === 'wellness') return `/wellness/${article.slug}`;
    }
    return `/articles/${article.slug}`;
  };

  return (
    <Link href={getArticleUrl()} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48">
          <img
            src={getImageUrl(article)}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-primary/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                {article.category.name}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-neutral-600 text-sm line-clamp-3 mb-3">
            {article.summary || article.subtitle}
          </p>
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{formatDate(article.created_at || article.first_published_at || article.published_date)}</span>
            {article.author && (
              <span>By {article.author.name}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;