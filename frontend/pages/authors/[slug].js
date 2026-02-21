import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function AuthorProfile() {
  const router = useRouter();
  const { slug } = router.query;
  const [author, setAuthor] = useState(null);
  const [authoredContent, setAuthoredContent] = useState({
    articles: [],
    conditions: [],
    news: [],
    ayurveda: [],
    homeopathy: [],
    yoga: [],
    wellness: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchAuthorData = async () => {
      try {
        // Fetch author details from dedicated endpoint
        const authorResponse = await fetch(`/cms-api/authors/${slug}/`);
        if (!authorResponse.ok) {
          setLoading(false);
          return;
        }
        const authorData = await authorResponse.json();
        setAuthor(authorData.author || authorData);

        // The author_detail endpoint already returns articles and reviewed content
        if (authorData.articles) {
          setAuthoredContent({
            articles: authorData.articles.filter(a => a.type === 'article') || [],
            conditions: authorData.articles.filter(a => a.type === 'conditions') || [],
            news: authorData.articles.filter(a => a.type === 'news') || [],
            ayurveda: authorData.articles.filter(a => a.type === 'ayurveda') || [],
            homeopathy: authorData.articles.filter(a => a.type === 'homeopathy') || [],
            yoga: authorData.articles.filter(a => a.type === 'yoga') || [],
            wellness: authorData.articles.filter(a => a.type === 'wellness') || []
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching author data:', error);
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [slug]);

  if (loading) {
    return (
      // Layout wrapper removed
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      // Layout wrapper removed
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Author Not Found</h1>
        <p className="text-gray-600 mb-6">The author you're looking for doesn't exist or may have been removed.</p>
        <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  const totalArticles = Object.values(authoredContent).reduce((acc, arr) => acc + arr.length, 0);

  return (
    // Layout wrapper removed
    <>
      <NextSeo
        title={`${author.name} - Author | Niinfomed`}
        description={`View all articles written by ${author.name}${author.credentials ? ', ' + author.credentials : ''}`}
      />

      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-start gap-6">
              {author.image && (
                <img 
                  src={author.image} 
                  alt={author.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-100"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Author
                  </span>
                </div>
                {author.credentials && (
                  <p className="text-lg text-gray-600 font-medium mb-3">{author.credentials}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold">{totalArticles}</span> Articles Published
                  </div>
                </div>
                {author.bio && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">About the Author</h3>
                    <p className="text-gray-700 leading-relaxed">{author.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Published Content</h2>

        {authoredContent.articles.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-blue-600">📰</span> Articles ({authoredContent.articles.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authoredContent.articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {authoredContent.news.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-green-600">📡</span> Health News ({authoredContent.news.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authoredContent.news.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {authoredContent.wellness.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-pink-600">💖</span> Wellness Topics ({authoredContent.wellness.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authoredContent.wellness.map((topic) => (
                <Link key={topic.id} href={`/wellness/${topic.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{topic.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{topic.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {totalArticles === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No published content available yet.</p>
          </div>
        )}
      </div>
    </>
  );
}