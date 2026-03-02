import Link from 'next/link';
export const runtime = "edge";
export default function LamininIsoformBadge({ isoform, formatName, size = 'md' }) {
  if (!isoform) return null;

  const {
    name,
    chain_composition,
    function: isoformFunction,
    slug
  } = isoform;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const displayName = formatName ? formatName(isoform) : 
    (chain_composition ? `${name} (${chain_composition})` : name);

  const BadgeContent = () => (
    <div className={`
      inline-flex items-center gap-2 
      bg-gradient-to-r from-teal-50 to-teal-100 
      text-teal-800 rounded-full 
      border border-teal-300 shadow-sm
      ${sizeClasses[size] || sizeClasses.md}
    `}>
      <span className="text-teal-600">αβγ</span>
      <span className="font-medium">{displayName}</span>
      {isoformFunction && (
        <span className="hidden md:inline text-xs text-teal-600 max-w-xs truncate">
          — {isoformFunction.substring(0, 60)}...
        </span>
      )}
    </div>
  );

  // If slug exists, make it clickable
  if (slug) {
    return (
      <Link href={`/laminin/isoforms/${slug}`} className="inline-block hover:opacity-90 transition-opacity">
        <BadgeContent />
      </Link>
    );
  }

  return <BadgeContent />;
}