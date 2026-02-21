
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { NextSeo } from 'next-seo';
import axios from 'axios';

const getProxiedImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://0.0.0.0:8001') || url.startsWith('http://127.0.0.1:8001')) {
    return url.replace(/http:\/\/(0\.0\.0\.0|127\.0\.0\.1):8001/, '/cms-media').replace('/cms-media/media/', '/cms-media/');
  }
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  return url;
};

export default function YogaIndexPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchYogaTopics();
  }, []);

  const fetchYogaTopics = async () => {
    try {
      const response = await fetch('/cms-api/yoga/topics?limit=50&lang=en');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Yoga topics received:', data);
        setTopics(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch yoga topics:', response.status);
        setTopics([]);
      }
    } catch (error) {
      console.error('Error fetching yoga topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = selectedCategory === 'all'
    ? topics
    : topics.filter(topic => topic.difficulty_level?.toLowerCase() === selectedCategory);

  return (
    <Layout>
      <NextSeo
        title="Yoga & Exercise - Niinfomed"
        description="Explore yoga poses, exercise routines, and wellness practices for a healthier lifestyle."
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Yoga & Exercise</h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover yoga poses, exercise routines, and wellness practices to enhance your physical and mental well-being.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'beginner', 'intermediate', 'advanced'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                category === selectedCategory
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-600 hover:text-purple-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : topics.length > 0 ? (
          <div className="mb-4 text-gray-600">
            Showing {filteredTopics.length} of {topics.length} yoga topics
          </div>
        ) : null}
        
        {!loading && filteredTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <Link key={topic.id || topic.slug} href={`/yoga-exercise/${topic.slug}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48">
                    <img 
                      src={getProxiedImageUrl(topic.image) || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&h=500'} 
                      alt={topic.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&h=500';
                      }}
                    />
                  </div>
                  <div className="p-5">
                    {topic.category && (
                      <span className="text-xs font-semibold text-purple-600 mb-2 inline-block">
                        {topic.category.name}
                      </span>
                    )}
                    <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{topic.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {topic.summary || 'Learn more about this yoga practice.'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {topic.difficulty_level && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {topic.difficulty_level}
                        </span>
                      )}
                      {topic.duration && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {topic.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">
              {selectedCategory === 'all' 
                ? 'No yoga topics available at the moment.' 
                : `No ${selectedCategory} level yoga topics found.`}
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                View all topics
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
