
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import FeaturedArticle from '../../components/FeaturedArticle';
import { fetchWellnessTopics } from '../../utils/api';

export default function WellnessIndex() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await fetchWellnessTopics(50);
        console.log('Wellness topics loaded:', data);
        setTopics(data);
      } catch (err) {
        console.error('Error loading wellness topics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Content</h1>
          <p className="text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Well-Being - Wellness Topics & Healthy Living Tips"
        description="Resources for healthy living, fitness, nutrition, mental health, stress management, and overall wellness."
      />

      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Well-Being</h1>
          <p className="text-lg text-neutral-600 max-w-3xl">
            Resources for healthy living, fitness, nutrition, mental health, stress management, and overall wellness.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-neutral-600">No articles found in this category.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">All Topics</h2>
              <p className="text-neutral-600">{topics.length} articles</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <FeaturedArticle
                  key={topic.id}
                  article={{
                    id: topic.id,
                    title: topic.title,
                    slug: topic.slug,
                    summary: topic.summary || topic.introduction || 'Learn more about this wellness topic',
                    image: topic.image,
                    category: { name: 'Wellness', slug: 'wellness' },
                    published_date: topic.published_date,
                  }}
                  href={`/wellness/${topic.slug}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Wellness Tools Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Wellness Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools#bmi" className="flex items-center gap-2 text-primary hover:underline">
                  <span>📊</span> BMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools#calorie" className="flex items-center gap-2 text-primary hover:underline">
                  <span>🔥</span> Calorie Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools#water" className="flex items-center gap-2 text-primary hover:underline">
                  <span>💧</span> Water Intake Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools#stress" className="flex items-center gap-2 text-primary hover:underline">
                  <span>🧘</span> Stress Assessment
                </Link>
              </li>
              <li>
                <Link href="/tools#sleep" className="flex items-center gap-2 text-primary hover:underline">
                  <span>😴</span> Sleep Calculator
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Healthy Living Tips</h3>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-neutral-700">
                <strong>Stay Physically Active</strong>
                <p className="text-sm text-neutral-600 ml-6">Aim for at least 150 minutes of moderate activity or 75 minutes of vigorous activity each week.</p>
              </li>
              <li className="text-neutral-700">
                <strong>Eat a Balanced Diet</strong>
                <p className="text-sm text-neutral-600 ml-6">Focus on fruits, vegetables, whole grains, lean proteins, and healthy fats.</p>
              </li>
              <li className="text-neutral-700">
                <strong>Get Enough Sleep</strong>
                <p className="text-sm text-neutral-600 ml-6">Adults should aim for 7-9 hours of quality sleep each night.</p>
              </li>
              <li className="text-neutral-700">
                <strong>Manage Stress</strong>
                <p className="text-sm text-neutral-600 ml-6">Practice stress-reduction techniques like mindfulness, meditation, or deep breathing.</p>
              </li>
              <li className="text-neutral-700">
                <strong>Stay Hydrated</strong>
                <p className="text-sm text-neutral-600 ml-6">Drink enough water throughout the day. The recommended amount varies by individual needs.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
