
import Link from 'next/link';
export const runtime = "edge";
const AuthorCard = ({ author, label = 'Written by', isReviewer = false, authorType = 'author' }) => {
  if (!author) return null;

  // Use author's slug if available, otherwise create from name
  const authorSlug = author.slug || author.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'staff';
  const useReviewerPath = isReviewer || authorType === 'reviewer';
  const linkPath = useReviewerPath ? `/reviewers/${authorSlug}` : `/authors/${authorSlug}`;

  return (
    <div className={`rounded-lg p-4 border ${isReviewer ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start gap-4">
        {author.image && (
          <Link href={linkPath}>
            <img
              src={author.image}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Link>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            {label}
            {isReviewer && (
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </p>
          <Link 
            href={linkPath}
            className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors"
          >
            {author.name}
            {author.credentials && (
              <span className="text-sm text-gray-600 ml-2">{author.credentials}</span>
            )}
          </Link>
          {author.bio && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{author.bio}</p>
          )}
          <Link 
            href={linkPath}
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            {isReviewer ? 'View all reviewed content →' : 'View all content →'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;
