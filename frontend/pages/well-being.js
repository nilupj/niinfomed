
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { fetchWellnessTopics } from '../utils/api';

export default function WellBeing({ topics, categories }) {
  const [activeLetter, setActiveLetter] = useState('all');
  const [groupedTopics, setGroupedTopics] = useState({});

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    // Group topics by first letter
    const grouped = {};
    topics.forEach(topic => {
      const firstLetter = topic.title.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(topic);
    });
    setGroupedTopics(grouped);
  }, [topics]);

  const displayTopics = activeLetter === 'all' 
    ? topics 
    : groupedTopics[activeLetter] || [];

  return (
    <>
      <NextSeo
        title="Wellness & Self-care - Niinfomed"
        description="Explore comprehensive wellness and self-care topics organized alphabetically. Find information on health, fitness, nutrition, mental health, and more."
        canonical="https://Niinfomed.com/well-being"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Wellness & Self-care
            </h1>
            <p className="text-lg text-neutral-600">
              Discover comprehensive resources for healthy living, fitness, nutrition, mental health, and overall wellness
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Alphabet Navigation */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4 sticky top-0 z-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveLetter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeLetter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => setActiveLetter(letter)}
                disabled={!groupedTopics[letter] || groupedTopics[letter].length === 0}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeLetter === letter
                    ? 'bg-primary text-white'
                    : groupedTopics[letter] && groupedTopics[letter].length > 0
                    ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    : 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Topics */}
        {activeLetter === 'all' && topics.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Featured Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topics.slice(0, 6).map((topic) => (
                <Link 
                  key={topic.id} 
                  href={`/wellness/${topic.slug}`}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {topic.image && (
                    <div className="relative h-48">
                      <Image
                        src={topic.image}
                        alt={topic.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {topic.category?.name || 'Wellness'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                      {topic.title}
                    </h3>
                    {topic.summary && (
                      <p className="text-sm text-neutral-600 line-clamp-2">{topic.summary}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Alphabetical Topic List */}
        {activeLetter === 'all' ? (
          <div className="space-y-12">
            {alphabet.map(letter => {
              const letterTopics = groupedTopics[letter] || [];
              if (letterTopics.length === 0) return null;

              return (
                <div key={letter} id={letter}>
                  <div className="flex items-center mb-6">
                    <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold mr-4">
                      {letter}
                    </div>
                    <div className="flex-1 border-b-2 border-neutral-200"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
                    {letterTopics.map(topic => (
                      <Link
                        key={topic.id}
                        href={`/wellness/${topic.slug}`}
                        className="text-neutral-700 hover:text-primary hover:underline transition-colors text-sm"
                      >
                        {topic.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {displayTopics.length > 0 ? (
              <>
                <div className="flex items-center mb-6">
                  <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold mr-4">
                    {activeLetter}
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Topics starting with {activeLetter}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
                  {displayTopics.map(topic => (
                    <Link
                      key={topic.id}
                      href={`/wellness/${topic.slug}`}
                      className="text-neutral-700 hover:text-primary hover:underline transition-colors text-sm"
                    >
                      {topic.title}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-500">No topics found starting with "{activeLetter}"</p>
              </div>
            )}
          </div>
        )}

        {/* Categories Section */}
        {activeLetter === 'all' && (
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(category => (
                <button
                  key={category.slug}
                  onClick={() => {
                    // Filter by category logic can be added here
                    window.location.href = `/wellness?category=${category.slug}`;
                  }}
                  className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl mb-2">
                    {category.slug === 'nutrition' && '🥗'}
                    {category.slug === 'fitness' && '💪'}
                    {category.slug === 'mental-health' && '🧘'}
                    {category.slug === 'sleep' && '😴'}
                  </div>
                  <h3 className="font-semibold text-neutral-900">{category.name}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wellness Tools */}
        {activeLetter === 'all' && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Wellness Tools</h2>
              <ul className="space-y-3">
                <li>
                  <Link href="/tools#bmi" className="flex items-center text-neutral-700 hover:text-primary transition-colors">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <span>BMI Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link href="/tools#calorie" className="flex items-center text-neutral-700 hover:text-primary transition-colors">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <span>Calorie Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link href="/tools#water" className="flex items-center text-neutral-700 hover:text-primary transition-colors">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                      </svg>
                    </div>
                    <span>Water Intake Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link href="/tools#sleep" className="flex items-center text-neutral-700 hover:text-primary transition-colors">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                      </svg>
                    </div>
                    <span>Sleep Calculator</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Healthy Living Tips</h2>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 text-primary font-bold text-lg mr-3">01.</div>
                  <div>
                    <h3 className="font-semibold">Stay Physically Active</h3>
                    <p className="text-sm text-neutral-600">
                      Aim for at least 150 minutes of moderate activity weekly.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 text-primary font-bold text-lg mr-3">02.</div>
                  <div>
                    <h3 className="font-semibold">Eat a Balanced Diet</h3>
                    <p className="text-sm text-neutral-600">
                      Focus on fruits, vegetables, whole grains, and lean proteins.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 text-primary font-bold text-lg mr-3">03.</div>
                  <div>
                    <h3 className="font-semibold">Get Enough Sleep</h3>
                    <p className="text-sm text-neutral-600">
                      Adults should aim for 7-9 hours of quality sleep each night.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 text-primary font-bold text-lg mr-3">04.</div>
                  <div>
                    <h3 className="font-semibold">Manage Stress</h3>
                    <p className="text-sm text-neutral-600">
                      Practice mindfulness, meditation, or relaxation techniques.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const topics = await fetchWellnessTopics(200);

    const categories = [
      { name: 'Nutrition', slug: 'nutrition' },
      { name: 'Fitness', slug: 'fitness' },
      { name: 'Mental Health', slug: 'mental-health' },
      { name: 'Sleep', slug: 'sleep' },
    ];

    return {
      props: {
        topics: topics || [],
        categories,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching well-being data:', error);
    return {
      props: {
        topics: [],
        categories: [],
      },
      revalidate: 60,
    };
  }
}
