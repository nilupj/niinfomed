
import Link from 'next/link';
import Image from 'next/image';

export default function QuizCard({ quiz }) {
  const { title, slug, image, description } = quiz;
  
  return (
    <Link href={`/quizzes/${slug}`} className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/9] w-full">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover rounded-t-lg"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-200 rounded-t-lg flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-neutral-600 text-sm line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}
