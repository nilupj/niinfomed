// lib/api.js
import axios from 'axios';

// API URL configuration - use environment variable with fallback to Oracle CMS
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
const DEFAULT_LANG = 'en';

// Helper to get base URL without double protocol
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    let url = CMS_API_URL;
    url = url.replace(/\/$/, '');
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`; // Default to HTTPS
  }
  return '';
};

const baseUrl = getBaseUrl();

// API configuration for Wagtail CMS
const api = axios.create({
  baseURL: typeof window === 'undefined' ? `${baseUrl}/api` : '/cms-api',
  timeout: 30000,
  paramsSerializer: {
    encode: (param) => encodeURIComponent(param)
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('❌ API Response Error:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
      
      // Handle specific status codes
      if (error.response.status === 404) {
        return Promise.reject(new Error('Resource not found'));
      } else if (error.response.status === 401) {
        return Promise.reject(new Error('Unauthorized access'));
      } else if (error.response.status === 403) {
        return Promise.reject(new Error('Forbidden access'));
      } else if (error.response.status === 500) {
        return Promise.reject(new Error('Internal server error'));
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ API No Response:', error.config?.url);
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('❌ API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   ✅ IMAGE HELPER FUNCTIONS - EXPORTED FOR USE IN COMPONENTS
========================================================= */

export const getProxiedImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Handle Oracle CMS URL (both IP and domain)
  if (imageUrl.includes('161.118.167.107') || imageUrl.includes('api.niinfomed.com')) {
    return imageUrl.replace(/https?:\/\/[^/]+\/media\//, '/cms-media/');
  }

  // Handle localhost patterns
  if (imageUrl.includes('0.0.0.0:8001/media/') || 
      imageUrl.includes('127.0.0.1:8001/media/') || 
      imageUrl.includes('localhost:8001/media/')) {
    return imageUrl.replace(/https?:\/\/[^/]+\/media\//, '/cms-media/');
  }

  // If already HTTPS URL (like Unsplash), return as is
  if (imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // For HTTP URLs from other sources, keep as is
  if (imageUrl.startsWith('http://')) {
    return imageUrl;
  }

  // For relative URLs starting with /media/, proxy through cms-media
  if (imageUrl.startsWith('/media/')) {
    return `/cms-media${imageUrl.replace('/media/', '/')}`;
  }

  // If already using cms-media, clean up any double paths
  if (imageUrl.startsWith('/cms-media/')) {
    return imageUrl.replace('/cms-media/media/', '/cms-media/');
  }

  return imageUrl;
};

// Keep the old function name for backward compatibility
export const getImageUrl = getProxiedImageUrl;

// Helper to fetch with multiple endpoint attempts
const tryEndpoints = async (endpoints, params = {}) => {
  let lastError = null;
  
  for (const endpoint of endpoints) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
      }
      
      const response = await api.get(endpoint, { params });
      
      if (response.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Success: ${endpoint}`);
        }
        return response;
      }
    } catch (error) {
      lastError = error;
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Failed: ${endpoint} - ${error.message}`);
      }
      // Continue to next endpoint
    }
  }
  
  throw lastError || new Error('All endpoints failed');
};

// Helper to handle different response formats
const handleResponse = (data) => {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data;
  } else if (data?.results) {
    return data.results;
  } else if (data?.items) {
    return data.items;
  } else if (data?.data) {
    return data.data;
  } else if (data?.meta && data?.items) {
    return data.items;
  }
  
  return data || [];
};

// Helper to get total count from response
const getTotalCount = (data) => {
  if (!data) return 0;
  
  if (data.meta?.total_count) return data.meta.total_count;
  if (data.count) return data.count;
  if (Array.isArray(data)) return data.length;
  if (data.results) return data.results.length;
  if (data.items) return data.items.length;
  
  return 0;
};

/* =========================================================
   ✅ HEALTH CHECK API
========================================================= */

export const checkHealth = async () => {
  try {
    const response = await api.get('/health/');
    return {
      status: 'healthy',
      data: response.data
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/* =========================================================
   ✅ LAMININ API FUNCTIONS
========================================================= */

export const fetchLamininCitations = async (params = {}) => {
  try {
    const { lang = DEFAULT_LANG, limit = 20, offset = 0, article_id, isoform_id } = params;
    
    const queryParams = {
      lang,
      limit,
      offset,
      ...(article_id && { related_articles: article_id }),
      ...(isoform_id && { isoforms: isoform_id })
    };

    const response = await api.get('/laminincitations/', { params: queryParams });
    
    const data = response.data;
    const items = handleResponse(data);
    
    return {
      items,
      total: data.meta?.total_count || data.count || items.length,
      offset: data.meta?.offset || offset,
      limit: data.meta?.limit || limit
    };
  } catch (error) {
    console.error('Error fetching laminin citations:', error);
    return { items: [], total: 0, offset: 0, limit: params.limit || 20 };
  }
};

export const fetchLamininCitationBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const response = await api.get(`/laminincitations/${slug}/`, {
      params: { lang }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching laminin citation ${slug}:`, error);
    throw error;
  }
};

export const fetchLamininCitationsForArticle = async (articleId, lang = DEFAULT_LANG) => {
  if (!articleId) return [];
  
  try {
    const response = await api.get('/laminincitations/', {
      params: {
        related_articles: articleId,
        lang,
        limit: 20
      }
    });
    
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching laminin citations for article:', error);
    return [];
  }
};

export const fetchLamininIsoforms = async (params = {}) => {
  try {
    const { lang = DEFAULT_LANG, limit = 50, citation_id } = params;
    
    const queryParams = {
      lang,
      limit,
      ...(citation_id && { citations: citation_id })
    };

    const response = await api.get('/lamininisoforms/', { params: queryParams });
    
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching laminin isoforms:', error);
    return [];
  }
};

export const fetchLamininIsoform = async (id, lang = DEFAULT_LANG) => {
  if (!id) return null;
  
  try {
    const response = await api.get(`/lamininisoforms/${id}/`, {
      params: { lang }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching laminin isoform:', error);
    return null;
  }
};

export const fetchLamininCitationPaths = async () => {
  try {
    const response = await api.get('/laminincitations/', {
      params: {
        fields: 'slug',
        limit: 100
      }
    });
    
    const items = handleResponse(response.data);
    return items.map(item => item.slug || item.meta?.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching laminin citation paths:', error);
    return [];
  }
};

export const fetchFeaturedLamininCitation = async (lang = DEFAULT_LANG) => {
  try {
    const response = await api.get('/laminincitations/', {
      params: {
        featured: true,
        lang,
        limit: 1
      }
    });
    
    const items = handleResponse(response.data);
    return items[0] || null;
  } catch (error) {
    console.error('Error fetching featured laminin citation:', error);
    return null;
  }
};

export const fetchLamininFamily = async (lang = DEFAULT_LANG) => {
  try {
    const [isoforms, citationsResponse] = await Promise.all([
      fetchLamininIsoforms({ lang, limit: 50 }),
      fetchLamininCitations({ lang, limit: 5 })
    ]);

    const grouped = {
      embryogenesis: isoforms.filter(i => 
        i.function?.toLowerCase().includes('embryo') || 
        i.name?.includes('111')
      ),
      woundRepair: isoforms.filter(i => 
        i.function?.toLowerCase().includes('wound') || 
        i.name?.includes('332')
      ),
      adultTissues: isoforms.filter(i => 
        i.function?.toLowerCase().includes('adult') || 
        i.name?.includes('511')
      ),
      all: isoforms,
      citations: citationsResponse.items || []
    };

    return grouped;
  } catch (error) {
    console.error('Error fetching laminin family:', error);
    return {
      embryogenesis: [],
      woundRepair: [],
      adultTissues: [],
      all: [],
      citations: []
    };
  }
};

/* =========================================================
   ✅ ARTICLES API
========================================================= */

export const fetchTopStories = async (limit = 10) => {
  try {
    const endpoints = [
      '/articles/top-stories/',
      '/articles/top-stories',
      '/articles/featured/'
    ];
    
    const response = await tryEndpoints(endpoints, { lang: DEFAULT_LANG, limit });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching top stories:', error);
    return [];
  }
};

export const fetchArticleBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const endpoints = [
      `/articles/${slug}/`,
      `/articles/${slug}`,
      `/articles/detail/${slug}/`
    ];
    
    const response = await tryEndpoints(endpoints, { lang });
    return response.data;
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    throw error;
  }
};

export const fetchArticle = fetchArticleBySlug;

export const fetchArticlePaths = async () => {
  try {
    const endpoints = [
      '/articles/paths/',
      '/articles/paths',
      '/articles/'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, { params: { limit: 100 } });
        
        if (response.data) {
          const items = handleResponse(response.data);
          return items.map(item => item.slug || item).filter(Boolean);
        }
      } catch (err) {
        // Continue to next endpoint
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching article paths:', error);
    return [];
  }
};

export const fetchRelatedArticles = async (slug, limit = 3) => {
  try {
    const endpoints = [
      `/articles/${slug}/related/`,
      `/articles/${slug}/related`,
      `/articles/related/${slug}/`
    ];
    
    const response = await tryEndpoints(endpoints, { limit });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
};

export const fetchHealthTopics = async () => {
  try {
    const endpoints = [
      '/articles/health-topics/',
      '/articles/health-topics',
      '/health-topics/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit: 50 });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching health topics:', error);
    return [];
  }
};

/* =========================================================
   ✅ NEWS API
========================================================= */

export const fetchLatestNews = async (limit = 10) => {
  try {
    const endpoints = [
      '/news/latest/',
      '/news/latest',
      '/news/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};

export const fetchNewsBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const endpoints = [
      `/news/${slug}/`,
      `/news/${slug}`,
      `/news/detail/${slug}/`
    ];
    
    const response = await tryEndpoints(endpoints, { lang });
    return response.data;
  } catch (error) {
    console.error(`Error fetching news ${slug}:`, error);
    throw error;
  }
};

export const fetchRelatedNews = async (slug, limit = 3) => {
  try {
    const endpoints = [
      `/news/${slug}/related/`,
      `/news/${slug}/related`,
      `/news/related/${slug}/`
    ];
    
    const response = await tryEndpoints(endpoints, { limit });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching related news:', error);
    return [];
  }
};

export const fetchNewsPaths = async () => {
  try {
    const endpoints = [
      '/news/paths/',
      '/news/paths',
      '/news/'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, { params: { limit: 100 } });
        
        if (response.data) {
          const items = handleResponse(response.data);
          return items.map(item => item.slug || item).filter(Boolean);
        }
      } catch (err) {
        // Continue to next endpoint
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching news paths:', error);
    return [];
  }
};

export const fetchNews = async (params = {}) => {
  try {
    const { limit = 10, lang = DEFAULT_LANG } = params;
    return await fetchLatestNews(limit);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

/* =========================================================
   ✅ WELLNESS API
========================================================= */

export const fetchWellnessTopics = async (limit = 50) => {
  try {
    const endpoints = [
      '/wellness/topics/',
      '/wellness/topics',
      '/wellness/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching wellness topics:', error);
    return [];
  }
};

export const fetchWellBeingArticles = async () => {
  try {
    const topics = await fetchWellnessTopics(50);
    return {
      featured: topics.slice(0, 3),
      articles: topics
    };
  } catch (error) {
    console.error('Error fetching well-being articles:', error);
    return {
      featured: [],
      articles: []
    };
  }
};

export const fetchWellnessPaths = async () => {
  try {
    const topics = await fetchWellnessTopics(100);
    return topics.map(t => t.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching wellness paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ CONDITIONS API
========================================================= */

export const fetchLatestConditions = async (limit = 20) => {
  try {
    const endpoints = [
      '/conditions/latest/',
      '/conditions/',
      '/conditions'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching latest conditions:', error);
    return [];
  }
};

export const fetchConditionsIndex = async () => {
  try {
    const endpoints = [
      '/conditions/',
      '/conditions/index/',
      '/conditions/latest/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit: 100, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching conditions index:', error);
    return [];
  }
};

export const fetchConditionBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const endpoints = [
      `/conditions/${slug}/`,
      `/conditions/${slug}`,
      `/conditions/detail/${slug}/`
    ];
    
    // If slug contains an ID at the end (format: name-123)
    const parts = String(slug).split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      endpoints.unshift(`/conditions/by_id/${lastPart}/`);
    }
    
    const response = await tryEndpoints(endpoints, { lang });
    return response.data;
  } catch (error) {
    console.error(`Error fetching condition ${slug}:`, error);
    throw error;
  }
};

export const fetchCondition = fetchConditionBySlug;

export const fetchConditionPaths = async () => {
  try {
    const conditions = await fetchConditionsIndex();
    
    return conditions.map(c => {
      // Try to get slug directly
      if (c.slug) return c.slug;
      
      // Generate slug from title with ID
      if (c.title && c.id) {
        const slug = c.title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        return `${slug}-${c.id}`;
      }
      
      return null;
    }).filter(Boolean);
    
  } catch (error) {
    console.error('Error fetching condition paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ DRUGS API
========================================================= */

export const fetchDrugBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const endpoints = [
      `/drugs/${slug}/`,
      `/drugs/${slug}`,
      `/drugs/detail/${slug}/`
    ];
    
    const response = await tryEndpoints(endpoints, { lang });
    return response.data;
  } catch (error) {
    console.error(`Error fetching drug ${slug}:`, error);
    throw error;
  }
};

export const fetchDrugDetails = fetchDrugBySlug;

export const getDrugs = async (limit = 100) => {
  try {
    const endpoints = [
      '/drugs/',
      '/drugs'
    ];
    
    const response = await tryEndpoints(endpoints, { lang: DEFAULT_LANG, limit });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return [];
  }
};

export const fetchDrugsIndex = async () => {
  return getDrugs(100);
};

export const fetchDrugPaths = async () => {
  try {
    const drugs = await getDrugs(100);
    return drugs.map(d => d.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching drug paths:', error);
    return [];
  }
};

export const fetchDrugs = async (params = {}) => {
  try {
    const { limit = 20 } = params;
    return await getDrugs(limit);
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return [];
  }
};

/* =========================================================
   ✅ HOMEOPATHY API
========================================================= */

export const fetchHomeopathyTopics = async (limit = 20) => {
  try {
    const endpoints = [
      '/homeopathy/topics/',
      '/homeopathy/topics',
      '/homeopathy/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching homeopathy topics:', error);
    return [];
  }
};

export const fetchHomeopathyPaths = async () => {
  try {
    const topics = await fetchHomeopathyTopics(100);
    return topics.map(t => t.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching homeopathy paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ AYURVEDA API
========================================================= */

export const fetchAyurvedaTopics = async (limit = 20) => {
  try {
    const endpoints = [
      '/ayurveda/topics/',
      '/ayurveda/topics',
      '/ayurveda/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching ayurveda topics:', error);
    return [];
  }
};

export const fetchAyurvedaPaths = async () => {
  try {
    const topics = await fetchAyurvedaTopics(100);
    return topics.map(t => t.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching ayurveda paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ YOGA API
========================================================= */

export const fetchYogaTopics = async (limit = 20) => {
  try {
    const endpoints = [
      '/yoga/topics/',
      '/yoga/topics',
      '/yoga/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching yoga topics:', error);
    return [];
  }
};

export const fetchYogaPaths = async () => {
  try {
    const topics = await fetchYogaTopics(100);
    return topics.map(t => t.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching yoga paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ VIDEOS API
========================================================= */

export const fetchVideos = async (limit = 20) => {
  try {
    const endpoints = [
      '/videos/',
      '/videos/latest/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const fetchVideoPaths = async () => {
  try {
    const videos = await fetchVideos(100);
    return videos.map(v => v.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching video paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ SOCIAL POSTS API
========================================================= */

export const fetchSocialPosts = async (limit = 20) => {
  try {
    const endpoints = [
      '/social/posts/',
      '/social/posts',
      '/social/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return [];
  }
};

/* =========================================================
   ✅ REMEDIES API
========================================================= */

export const fetchRemedyArticles = async (params = {}) => {
  try {
    const { lang = DEFAULT_LANG, limit = 20 } = params;
    const endpoints = [
      '/remedies/',
      '/remedies'
    ];
    
    const response = await tryEndpoints(endpoints, { lang, limit });
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching remedy articles:', error);
    return [];
  }
};

export const fetchRemedyBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const endpoints = [
      `/remedies/${slug}/`,
      `/remedies/${slug}`
    ];
    
    const response = await tryEndpoints(endpoints, { lang });
    return response.data;
  } catch (error) {
    console.error(`Error fetching remedy ${slug}:`, error);
    throw error;
  }
};

export const fetchRemedyPaths = async () => {
  try {
    const remedies = await fetchRemedyArticles({ limit: 100 });
    return remedies.map(r => r.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching remedy paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ REVIEWERS API
========================================================= */

export const fetchReviewers = async () => {
  try {
    const endpoints = [
      '/reviewers/',
      '/reviewers'
    ];
    
    const response = await tryEndpoints(endpoints);
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching reviewers:', error);
    return [];
  }
};

export const fetchReviewerPaths = async () => {
  try {
    const reviewers = await fetchReviewers();
    return reviewers.map(r => r.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching reviewer paths:', error);
    return [];
  }
};

export const fetchReviewerBySlug = async (slug) => {
  try {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    const endpoints = [
      `/reviewers/${cleanSlug}/`,
      `/reviewers/${cleanSlug}`
    ];
    
    const response = await tryEndpoints(endpoints);
    return response.data;
  } catch (error) {
    console.error('Reviewer fetch error:', error);
    throw error;
  }
};

/* =========================================================
   ✅ AUTHORS API
========================================================= */

export const fetchAuthors = async () => {
  try {
    const endpoints = [
      '/authors/',
      '/authors'
    ];
    
    const response = await tryEndpoints(endpoints);
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
};

export const fetchAuthorPaths = async () => {
  try {
    const authors = await fetchAuthors();
    return authors.map(a => a.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching author paths:', error);
    return [];
  }
};

export const getAuthorDetail = async (slug) => {
  try {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    const endpoints = [
      `/authors/${cleanSlug}/`,
      `/authors/${cleanSlug}`
    ];
    
    const response = await tryEndpoints(endpoints);
    return response.data;
  } catch (error) {
    console.error('Author fetch error:', error);
    throw error;
  }
};

/* =========================================================
   ✅ TRENDING API
========================================================= */

export const fetchTrending = async () => {
  try {
    const endpoints = [
      '/trending/',
      '/trending'
    ];
    
    const response = await tryEndpoints(endpoints);
    return handleResponse(response.data);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const fetchTrendingBySlug = async (slug) => {
  try {
    const endpoints = [
      `/trending/${slug}/`,
      `/trending/${slug}`
    ];
    
    const response = await tryEndpoints(endpoints);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trending ${slug}:`, error);
    throw error;
  }
};

/* =========================================================
   ✅ SEARCH API
========================================================= */

export const searchContent = async (query, filters = {}) => {
  if (!query || query.length < 2) {
    return {
      articles: [],
      conditions: [],
      drugs: [],
      news: [],
      wellness: [],
      ayurveda: [],
      homeopathy: [],
      yoga: [],
      videos: [],
      lamininCitations: [],
      lamininIsoforms: []
    };
  }
  
  try {
    const response = await api.get('/search/', {
      params: {
        q: query,
        type: filters.type || '',
        lang: DEFAULT_LANG,
        limit: filters.limit || 10,
        include_laminin: true
      }
    });

    const data = response.data;

    return {
      articles: handleResponse(data.articles),
      conditions: handleResponse(data.conditions),
      drugs: handleResponse(data.drugs),
      news: handleResponse(data.news),
      wellness: handleResponse(data.wellness),
      ayurveda: handleResponse(data.ayurveda),
      homeopathy: handleResponse(data.homeopathy),
      yoga: handleResponse(data.yoga),
      videos: handleResponse(data.videos),
      lamininCitations: handleResponse(data.laminin_citations || data.lamininCitations),
      lamininIsoforms: handleResponse(data.laminin_isoforms || data.lamininIsoforms)
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      articles: [],
      conditions: [],
      drugs: [],
      news: [],
      wellness: [],
      ayurveda: [],
      homeopathy: [],
      yoga: [],
      videos: [],
      lamininCitations: [],
      lamininIsoforms: []
    };
  }
};

/* =========================================================
   ✅ PAGES API
========================================================= */

export const fetchPageBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const endpoints = [
      `/pages/${slug}/`,
      `/pages/${slug}`,
      `/pages/detail/${slug}/`
    ];
    
    const response = await tryEndpoints(endpoints, { lang });
    return response.data;
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    throw error;
  }
};

export const fetchPagePaths = async () => {
  try {
    const endpoints = [
      '/pages/paths/',
      '/pages/paths',
      '/pages/'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, { params: { limit: 100 } });
        
        if (response.data) {
          const items = handleResponse(response.data);
          return items.map(item => item.slug || item).filter(Boolean);
        }
      } catch (err) {
        // Continue to next endpoint
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching page paths:', error);
    return [];
  }
};

export default api;
