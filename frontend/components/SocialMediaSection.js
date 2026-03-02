
import { useState, useEffect } from 'react';
import Link from 'next/link';
export const runtime = "edge";
export default function SocialMediaSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [videoSlideIndex, setVideoSlideIndex] = useState(0);

  const healthVideos = [
    {
      id: 1,
      title: 'The Audacious Entrepreneur',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&h=400',
      episode: 'Episode with Ankur Gigras',
      tag: "Don't Miss"
    },
    {
      id: 2,
      title: 'How to Heal & Adapt',
      thumbnail: 'https://images.unsplash.com/photo-1559757175-7b21671c7e96?auto=format&fit=crop&w=600&h=400',
      episode: 'Medical Insights Series',
      tag: 'Trending'
    },
    {
      id: 3,
      title: 'Spin to Learn',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=400',
      episode: 'Interactive Health Education',
      tag: 'Popular'
    },
    {
      id: 4,
      title: 'Mental Health Awareness',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&h=400',
      episode: 'Expert Discussion',
      tag: 'New'
    },
    {
      id: 5,
      title: 'Nutrition & Wellness',
      thumbnail: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=600&h=400',
      episode: 'Healthy Eating Guide',
      tag: 'Featured'
    }
  ];

  const socialPosts = [
    {
      id: 1,
      platform: 'instagram',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=600',
      caption: '5 Tips for Better Heart Health 💙',
      likes: 1234,
      comments: 45,
      timestamp: '2h ago'
    },
    {
      id: 2,
      platform: 'youtube',
      type: 'video',
      content: 'https://images.unsplash.com/photo-1559757175-7b21671c7e96?auto=format&fit=crop&w=600&h=400',
      caption: 'Understanding Mental Health | Expert Talk',
      views: 5678,
      duration: '5:24',
      timestamp: '5h ago'
    },
    {
      id: 3,
      platform: 'twitter',
      type: 'text',
      caption: 'Did you know? Drinking 8 glasses of water daily can improve your skin health and boost energy levels! 💧 #HealthTips',
      likes: 892,
      retweets: 234,
      timestamp: '1d ago'
    },
    {
      id: 4,
      platform: 'facebook',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=600&h=600',
      caption: 'Nutrition myths debunked! Read our latest article 🥗',
      likes: 2341,
      shares: 156,
      timestamp: '2d ago'
    },
    {
      id: 5,
      platform: 'instagram',
      type: 'video',
      content: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&h=600',
      caption: '10-Minute Morning Yoga Routine ☀️',
      likes: 3456,
      comments: 89,
      duration: '0:58',
      timestamp: '3d ago'
    },
    {
      id: 6,
      platform: 'youtube',
      type: 'video',
      content: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&h=400',
      caption: 'How to Manage Stress | Doctor\'s Advice',
      views: 12340,
      duration: '8:15',
      timestamp: '4d ago'
    }
  ];

  const filteredPosts = activeTab === 'all' 
    ? socialPosts 
    : socialPosts.filter(post => post.platform === activeTab);

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'instagram':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getPlatformColor = (platform) => {
    switch(platform) {
      case 'instagram':
        return 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500';
      case 'youtube':
        return 'bg-red-600';
      case 'twitter':
        return 'bg-blue-400';
      case 'facebook':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const nextVideoSlide = () => {
    setVideoSlideIndex((prev) => 
      prev >= healthVideos.length - 3 ? 0 : prev + 1
    );
  };

  const prevVideoSlide = () => {
    setVideoSlideIndex((prev) => 
      prev <= 0 ? healthVideos.length - 3 : prev - 1
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container-custom">
        {/* Health Videos Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Health Videos</h2>
              <p className="text-gray-600">Expert insights, patient stories, and simplified explanations of complex medical procedures — all in one place.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevVideoSlide}
                className="p-2 rounded-full border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-300"
                aria-label="Previous videos"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextVideoSlide}
                className="p-2 rounded-full border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-300"
                aria-label="Next videos"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <a
                href="/videos"
                className="ml-4 px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors font-medium flex items-center gap-2"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Video Carousel */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${videoSlideIndex * (100 / 3)}%)` }}
            >
              {healthVideos.map((video) => {
                // Extract slug from post_url if it exists
                const getVideoSlug = (url) => {
                  if (!url) return null;
                  // Extract slug from URLs like /videos/slug or domain.com/videos/slug
                  const match = url.match(/\/videos\/([^\/\?]+)/);
                  return match ? match[1] : null;
                };
                
                const slug = getVideoSlug(video.post_url) || video.slug || 'default-video';
                
                return (
                  <a
                    key={video.id}
                    href={`/videos/${slug}`}
                    className="min-w-[calc(33.333%-1rem)] group cursor-pointer block"
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full aspect-video object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        {/* Tag */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {video.tag}
                          </span>
                        </div>
                        
                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>

                        {/* Title and Episode */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-lg mb-1">{video.title}</h3>
                          <p className="text-gray-200 text-sm">{video.episode}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Follow Us on Social Media</h2>
          <p className="text-gray-600">Stay connected and get daily health tips, expert advice, and wellness updates</p>
        </div>

        {/* Platform Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'all'
                ? 'bg-teal-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Posts
          </button>
          {['instagram', 'youtube', 'twitter', 'facebook'].map((platform) => (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === platform
                  ? `${getPlatformColor(platform)} text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {getPlatformIcon(platform)}
              <span className="capitalize">{platform}</span>
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Platform Badge */}
              <div className={`${getPlatformColor(post.platform)} p-3 flex items-center justify-between text-white`}>
                <div className="flex items-center gap-2">
                  {getPlatformIcon(post.platform)}
                  <span className="font-semibold capitalize">{post.platform}</span>
                </div>
                <span className="text-sm opacity-90">{post.timestamp}</span>
              </div>

              {/* Content */}
              {post.type !== 'text' && (
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={post.content}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {post.type === 'video' && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                        {post.duration}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Caption & Metrics */}
              <div className="p-4">
                <p className="text-gray-800 mb-3 line-clamp-2">{post.caption}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {post.likes && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>{post.likes.toLocaleString()}</span>
                    </div>
                  )}
                  {post.comments && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.comments}</span>
                    </div>
                  )}
                  {post.views && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                  )}
                  {post.shares && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>{post.shares}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4 font-medium">Join our growing community</p>
          <div className="flex justify-center gap-4">
            <a href="https://instagram.com/healthinfo" target="_blank" rel="noopener noreferrer"
               className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-110 transition-all duration-300">
              {getPlatformIcon('instagram')}
            </a>
            <a href="https://youtube.com/@healthinfo" target="_blank" rel="noopener noreferrer"
               className="bg-red-600 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-110 transition-all duration-300">
              {getPlatformIcon('youtube')}
            </a>
            <a href="https://twitter.com/healthinfo" target="_blank" rel="noopener noreferrer"
               className="bg-blue-400 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-110 transition-all duration-300">
              {getPlatformIcon('twitter')}
            </a>
            <a href="https://facebook.com/healthinfo" target="_blank" rel="noopener noreferrer"
               className="bg-blue-600 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-110 transition-all duration-300">
              {getPlatformIcon('facebook')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
