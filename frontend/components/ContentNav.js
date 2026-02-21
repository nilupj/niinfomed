
import Link from 'next/link';

export default function ContentNav({ items = [], activeItem = '' }) {
  return (
    <nav className="border-b border-neutral-200 mb-6 overflow-x-auto">
      <div className="flex space-x-1 pb-1">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={item.href}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
              activeItem === item.slug
                ? 'bg-primary text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
