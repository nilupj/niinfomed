import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function ReviewerProfile() {
  const router = useRouter();
  const { slug } = router.query;
  const [reviewer, setReviewer] = useState(null);
  const [reviewedContent, setReviewedContent] = useState({
    articles: [],
    conditions: [],
    news: [],
    wellness: [],
    ayurveda: [],
    homeopathy: [],
    yoga: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    if (!slug) return;

    const fetchReviewerData = async () => {
      try {
        setLoading(true);
        
        // Fetch reviewer details and all their reviewed content
        const response = await fetch(`/cms-api/authors/${slug}`);
        
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        if (data.author) {
          setReviewer(data.author);
        }

        // Organize reviewed content by type
        if (data.reviewed && Array.isArray(data.reviewed)) {
          const organized = {
            articles: data.reviewed.filter(item => item.type === 'article'),
            conditions: data.reviewed.filter(item => item.type === 'conditions'),
            news: data.reviewed.filter(item => item.type === 'news'),
            wellness: data.reviewed.filter(item => item.type === 'wellness'),
            ayurveda: data.reviewed.filter(item => item.type === 'ayurveda'),
            homeopathy: data.reviewed.filter(item => item.type === 'homeopathy'),
            yoga: data.reviewed.filter(item => item.type === 'yoga'),
          };
          setReviewedContent(organized);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviewer data:', error);
        setLoading(false);
      }
    };

    fetchReviewerData();
  }, [slug]);

  if (loading) {
    return (
      // Layout wrapper removed
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!reviewer) {
    return (
      // Layout wrapper removed
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Medical Reviewer Not Found</h1>
        <p className="text-gray-600 mb-6">The medical reviewer you're looking for doesn't exist.</p>
        <Link href="/" className="text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const allContent = Object.values(reviewedContent).flat();
  const totalReviews = allContent.length;
  
  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContent = allContent.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalReviews / itemsPerPage);

  const getContentUrl = (item) => {
    const typeMap = {
      'article': '/articles',
      'conditions': '/conditions',
      'news': '/news',
      'wellness': '/wellness',
      'ayurveda': '/ayurveda',
      'homeopathy': '/homeopathy',
      'yoga': '/yoga-exercise'
    };
    return `${typeMap[item.type] || '/articles'}/${item.slug}`;
  };

  return (
    // Layout wrapper removed
    <>
      <NextSeo
        title={`${reviewer.name} - Medical Reviewer | Niinfomed`}
        description={`View all medically reviewed content by ${reviewer.name}${reviewer.credentials ? ', ' + reviewer.credentials : ''}`}
      />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {reviewer.image && (
                <img 
                  src={reviewer.image} 
                  alt={reviewer.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{reviewer.name}</h1>
                {reviewer.credentials && (
                  <p className="text-lg text-blue-600 font-medium mb-3">{reviewer.credentials}</p>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Medical Reviewer
                  </span>
                </div>

                {reviewer.bio && (
                  <p className="text-gray-700 leading-relaxed mb-4">{reviewer.bio}</p>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold">{totalReviews}</span> Articles Reviewed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Recent Website content from {reviewer.name}</h2>
            <p className="text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalReviews)} of {totalReviews} articles
            </p>
          </div>

          {paginatedContent.length > 0 ? (
            <div className="space-y-4">
              {paginatedContent.map((item, index) => (
                <Link 
                  key={`${item.type}-${item.id}-${index}`}
                  href={getContentUrl(item)}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition p-5 border border-gray-200"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-primary transition">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.summary}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {item.type === 'article' ? 'Health Article' : 
                       item.type === 'conditions' ? 'Health Condition' :
                       item.type === 'news' ? 'Health News' :
                       item.type === 'wellness' ? 'Wellness' :
                       item.type === 'ayurveda' ? 'Ayurveda' :
                       item.type === 'homeopathy' ? 'Homeopathy' :
                       item.type === 'yoga' ? 'Yoga & Exercise' : 'Health Content'}
                    </span>
                    {item.published_date && (
                      <span className="text-xs text-gray-500">
                        {new Date(item.published_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No reviewed content available yet.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          currentPage === page
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}