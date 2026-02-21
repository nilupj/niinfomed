import axios from 'axios';

// API URL configuration - use server URL for SSR, proxy for client
const API_URL = typeof window === 'undefined' 
  ? (process.env.NEXT_PUBLIC_CMS_API_URL || 'http://0.0.0.0:8001')
  : '';
const DEFAULT_LANG = 'en';

// API configuration for Wagtail CMS
const api = axios.create({
  baseURL: typeof window === 'undefined' ? 'http://0.0.0.0:8001/api' : '/cms-api',
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
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

// Helper function to construct full image URLs and handle mixed content
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Convert CMS URLs to relative paths (handles mixed content issues)
  // The /cms-media/ path is proxied through Next.js to the CMS
  if (imageUrl.includes('0.0.0.0:8001/media/') || imageUrl.includes('localhost:8001/media/')) {
    return imageUrl.replace(/https?:\/\/[^/]+\/media\//, '/cms-media/');
  }

  // If already HTTPS URL (like Unsplash), return as is
  if (imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // For HTTP URLs from other sources, keep as is (may have mixed content issues)
  if (imageUrl.startsWith('http://')) {
    return imageUrl;
  }

  // For relative URLs starting with /media/, proxy through cms-media
  if (imageUrl.startsWith('/media/')) {
    return `/cms-media${imageUrl.slice(6)}`;
  }

  // Otherwise, construct full URL
  return `/cms-media/${imageUrl}`;
};

/* =========================================================
   ✅ LAMININ API FUNCTIONS - NEW
   Complete integration with Wagtail Laminin models
========================================================= */

/**
 * Fetch laminin citations with optional filtering
 * Supports bilingual content via lang parameter
 */
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
    
    // Handle Wagtail API v2 pagination format
    const data = response.data;
    const items = data.items || data.results || data || [];
    
    return {
      items,
      total: data.meta?.total_count || data.count || items.length,
      offset: data.meta?.offset || offset,
      limit: data.meta?.limit || limit
    };
  } catch (error) {
    console.error('Error fetching laminin citations:', error);
    return { items: [], total: 0, offset: 0, limit };
  }
};

/**
 * Fetch a single laminin citation by slug or ID
 * Bilingual: pass lang='hi' for Hindi content
 */
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

/**
 * Fetch laminin citations for a specific article
 * Used in ArticleDetail page to display related laminin content
 */
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
    
    // Handle both array and {items: []} response formats
    const data = response.data;
    return data.items || data.results || data || [];
  } catch (error) {
    console.error('Error fetching laminin citations for article:', error);
    return [];
  }
};

/**
 * Fetch laminin isoforms with optional filtering
 */
export const fetchLamininIsoforms = async (params = {}) => {
  try {
    const { lang = DEFAULT_LANG, limit = 50, citation_id } = params;
    
    const queryParams = {
      lang,
      limit,
      ...(citation_id && { citations: citation_id })
    };

    const response = await api.get('/lamininisoforms/', { params: queryParams });
    
    const data = response.data;
    return data.items || data.results || data || [];
  } catch (error) {
    console.error('Error fetching laminin isoforms:', error);
    return [];
  }
};

/**
 * Fetch a single laminin isoform by ID or slug
 */
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

/**
 * Fetch all laminin citation paths for static generation
 */
export const fetchLamininCitationPaths = async () => {
  try {
    const response = await api.get('/laminincitations/', {
      params: {
        fields: 'slug',
        limit: 100
      }
    });
    
    const data = response.data;
    const items = data.items || data.results || data || [];
    
    return items.map(item => item.slug || item.meta?.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching laminin citation paths:', error);
    return [];
  }
};

/**
 * Fetch featured laminin citation for homepage/index pages
 */
export const fetchFeaturedLamininCitation = async (lang = DEFAULT_LANG) => {
  try {
    const response = await api.get('/laminincitations/', {
      params: {
        featured: true,
        lang,
        limit: 1
      }
    });
    
    const data = response.data;
    const items = data.items || data.results || data || [];
    return items[0] || null;
  } catch (error) {
    console.error('Error fetching featured laminin citation:', error);
    return null;
  }
};

/**
 * Fetch laminin family overview / aggregated data
 */
export const fetchLamininFamily = async (lang = DEFAULT_LANG) => {
  try {
    // Fetch all isoforms and key citations in parallel
    const [isoforms, keyCitations] = await Promise.all([
      fetchLamininIsoforms({ lang, limit: 50 }),
      fetchLamininCitations({ lang, limit: 5 })
    ]);

    // Group isoforms by function/type
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
      citations: keyCitations
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
   ✅ EXISTING API FUNCTIONS (preserved)
========================================================= */

// Articles
export const fetchTopStories = async (limit = 10) => {
  try {
    const response = await api.get('/articles/top-stories', {
      params: { lang: DEFAULT_LANG }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top stories:', error);
    return [];
  }
};

export const fetchArticleBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const response = await api.get(`/articles/${slug}`, {
      params: { lang }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    throw error;
  }
};

export const fetchArticle = fetchArticleBySlug;

export const fetchArticlePaths = async () => {
  try {
    const response = await api.get('/articles/paths');
    return response.data;
  } catch (error) {
    console.error('Error fetching article paths:', error);
    return [];
  }
};

export const fetchRelatedArticles = async (slug, limit = 3) => {
  try {
    const response = await api.get(`/articles/${slug}/related`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
};

export const fetchHealthTopics = async () => {
  try {
    const response = await api.get('/articles/health-topics');
    return response.data;
  } catch (error) {
    console.error('Error fetching health topics:', error);
    return [];
  }
};

// News
export const fetchLatestNews = async (limit = 10) => {
  try {
    const response = await api.get('/news/latest', {
      params: { limit, lang: DEFAULT_LANG }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};

export const fetchNewsBySlug = async (slug) => {
  try {
    const response = await api.get(`/news/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news ${slug}:`, error);
    throw error;
  }
};

export const fetchRelatedNews = async (slug, limit = 3) => {
  try {
    const response = await api.get(`/news/${slug}/related`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching related news:', error);
    return [];
  }
};

// Wellness
export const fetchWellnessTopics = async (limit = 50) => {
  try {
    const response = await api.get('/wellness/topics', {
      params: { limit, lang: DEFAULT_LANG }
    });
    return response.data || [];
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

// Conditions
export const fetchLatestConditions = async (limit = 20) => {
  try {
    const response = await api.get('/conditions/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conditions:', error);
    return [];
  }
};

export const fetchConditionsIndex = async () => {
  try {
    const response = await api.get('/conditions');
    return response.data;
  } catch (error) {
    console.error('Error fetching conditions index:', error);
    return [];
  }
};

export const fetchConditionBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const response = await api.get(`/conditions/${slug}`, {
      params: { lang }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching condition ${slug}:`, error);
    throw error;
  }
};

export const fetchCondition = fetchConditionBySlug;

export const fetchConditionPaths = async () => {
  try {
    const response = await api.get('/conditions/paths');
    return response.data;
  } catch (error) {
    console.error('Error fetching condition paths:', error);
    return [];
  }
};

// Drugs
export const fetchDrugBySlug = async (slug) => {
  try {
    const response = await api.get(`/drugs/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching drug ${slug}:`, error);
    throw error;
  }
};

export const fetchDrugDetails = fetchDrugBySlug;

export const getDrugs = async () => {
  try {
    const response = await fetch(`${API_URL}/api/drugs/?lang=${DEFAULT_LANG}`);
    if (!response.ok) {
      throw new Error('Failed to fetch drugs');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Error fetching drugs:', error);
    throw error;
  }
};

export const fetchDrugsIndex = async () => {
  try {
    const response = await fetch(`${API_URL}/api/drugs/?lang=${DEFAULT_LANG}`);
    if (!response.ok) {
      throw new Error('Failed to fetch drugs index');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Error fetching drugs index:', error);
    return [];
  }
};

// Homeopathy
export const fetchHomeopathyTopics = async (limit = 20) => {
  try {
    const response = await api.get('/homeopathy/topics/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching homeopathy topics:', error);
    return [];
  }
};

// Ayurveda
export const fetchAyurvedaTopics = async (limit = 20) => {
  try {
    const response = await api.get('/ayurveda/topics/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ayurveda topics:', error);
    return [];
  }
};

// Yoga
export const fetchYogaTopics = async (limit = 20) => {
  try {
    const response = await api.get('/yoga/topics/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching yoga topics:', error);
    return [];
  }
};

// Videos
export const fetchVideos = async (limit = 20) => {
  try {
    const response = await api.get('/videos/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    console.log('API RESPONSE:', response.data);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

// Social Posts
export const fetchSocialPosts = async (limit = 20) => {
  try {
    const response = await api.get('/social/posts/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return [];
  }
};

// Search - Enhanced with Laminin support
export const searchContent = async (query, filters = {}) => {
  try {
    const response = await api.get('/search', {
      params: {
        q: query,
        type: filters.type || '',
        lang: DEFAULT_LANG,
        include_laminin: true // Include laminin citations in search
      }
    });

    const data = response.data;

    return {
      articles: data.articles || [],
      conditions: data.conditions || [],
      drugs: data.drugs || [],
      news: data.news || [],
      wellness: data.wellness || [],
      ayurveda: data.ayurveda || [],
      homeopathy: data.homeopathy || [],
      yoga: data.yoga || [],
      videos: data.videos || [],
      
      // ✅ NEW: Laminin search results
      lamininCitations: data.laminin_citations || data.lamininCitations || [],
      lamininIsoforms: data.laminin_isoforms || data.lamininIsoforms || []
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

export const getAuthorDetail = async (slug) => {
  try {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    const response = await api.get(`/authors/${cleanSlug}/`);
    return response.data;
  } catch (error) {
    console.error('Author fetch error:', error);
    throw error;
  }
};

export default api;