// components/WebStoriesSection.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
export const runtime = "edge";
const WebStoriesSection = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchWebStories = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await axios.get(`${API_URL}/api/web-stories/`, {
          timeout: 10000,
          params: {
            category: selectedCategory !== 'all' ? selectedCategory : undefined
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setStories(response.data);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(
            response.data
              .filter(story => story.category)
              .map(story => story.category)
          )];
          setCategories(uniqueCategories);
        } else {
          setStories([]);
        }
      } catch (err) {
        console.error('Error fetching web stories:', err);
        setError('Unable to load stories. Please try again later.');
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWebStories();
  }, [selectedCategory]);

  if (error && stories.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">Web Stories</h2>
            <p className="text-sm text-neutral-600">Interactive health stories</p>
          </div>
          <Link href="/web-stories" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-neutral-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Web Stories</h2>
          <p className="text-sm text-neutral-600">Interactive health stories</p>
        </div>
        <Link href="/web-stories" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
          View All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Stories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-neutral-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stories.slice(0, 12).map((story) => (
            <Link
              key={story.id}
              href={`/web-stories/${story.slug}`}
              className="group block"
            >
              <div className="relative h-48 rounded-lg overflow-hidden mb-2 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                {story.thumbnail ? (
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&h=500';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                {story.category && (
                  <span className="absolute top-2 left-2 bg-white/90 text-neutral-700 text-xs font-medium px-2 py-1 rounded">
                    {story.category.name}
                  </span>
                )}
                {/* Play icon overlay for stories */}
                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <strong className="text-sm font-semibold text-neutral-800 line-clamp-2 hover:text-primary transition-colors">
                {story.title}
              </strong>
              {story.published_date && (
                <small className="text-xs text-neutral-500 block mt-1">
                  {new Date(story.published_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </small>
              )}
              {story.summary && (
                <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
                  {story.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-600">No web stories available at the moment.</p>
        </div>
      )}
    </section>
  );
};

export default WebStoriesSection;