import axios from 'axios';

// API URL configuration - use environment variable with fallback to Oracle CMS
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';
const DEFAULT_LANG = 'en';

// Helper to get base URL without double protocol
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    let url = CMS_API_URL;
    url = url.replace(/\/$/, '');
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://${url}`;
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
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Response Error:', error.response.status, error.config?.url);
    } else if (error.request) {
      console.error('❌ API No Response:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// Helper function to construct full image URLs and handle mixed content
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Handle Oracle CMS URL
  if (imageUrl.includes('161.118.167.107')) {
    return imageUrl.replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/');
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

// Helper to fetch with multiple endpoint attempts
const tryEndpoints = async (endpoints, params = {}) => {
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying endpoint: ${endpoint}`);
      const response = await api.get(endpoint, { params });
      if (response.data) {
        console.log(`✅ Success: ${endpoint}`);
        return response;
      }
    } catch (error) {
      console.log(`❌ Failed: ${endpoint}`);
      // Continue to next endpoint
    }
  }
  throw new Error('All endpoints failed');
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
    
    const data = response.data;
    return data.items || data.results || data || [];
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
    
    const data = response.data;
    return data.items || data.results || data || [];
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
    
    const data = response.data;
    const items = data.items || data.results || data || [];
    
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
    
    const data = response.data;
    const items = data.items || data.results || data || [];
    return items[0] || null;
  } catch (error) {
    console.error('Error fetching featured laminin citation:', error);
    return null;
  }
};

export const fetchLamininFamily = async (lang = DEFAULT_LANG) => {
  try {
    const [isoforms, keyCitations] = await Promise.all([
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
   ✅ ARTICLES API
========================================================= */

export const fetchTopStories = async (limit = 10) => {
  try {
    const response = await api.get('/articles/top-stories', {
      params: { lang: DEFAULT_LANG, limit }
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

/* =========================================================
   ✅ NEWS API
========================================================= */

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

export const fetchNewsBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const response = await api.get(`/news/${slug}`, {
      params: { lang }
    });
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

export const fetchNewsPaths = async () => {
  try {
    const response = await api.get('/news/paths');
    return response.data;
  } catch (error) {
    console.error('Error fetching news paths:', error);
    return [];
  }
};

// ✅ NEW: Fetch all news for conditions page
export const fetchNews = async (params = {}) => {
  try {
    const { limit = 10, lang = DEFAULT_LANG } = params;
    const response = await api.get('/news/latest', {
      params: { limit, lang }
    });
    return response.data || [];
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
   ✅ CONDITIONS API - FIXED WITH MULTIPLE ENDPOINTS
========================================================= */

export const fetchLatestConditions = async (limit = 20) => {
  try {
    const endpoints = [
      '/conditions/latest/',
      '/conditions/',
      '/conditions/latest'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    } else if (response.data.items) {
      return response.data.items;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching latest conditions:', error);
    return [];
  }
};

export const fetchConditionsIndex = async () => {
  try {
    console.log('🔍 Fetching conditions index from Oracle CMS');
    
    const endpoints = [
      '/conditions/',
      '/conditions',
      '/conditions/index/',
      '/conditions/latest/',
      '/v2/pages/?type=conditions.ConditionPage&fields=title,slug,id'
    ];
    
    const response = await tryEndpoints(endpoints, { limit: 100, lang: DEFAULT_LANG });
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    } else if (response.data.items) {
      return response.data.items;
    } else if (response.data.conditions) {
      return response.data.conditions;
    } else if (response.data.id || response.data.slug) {
      return [response.data];
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching conditions index:', error);
    return [];
  }
};

export const fetchConditionBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    console.log(`🔍 Fetching condition: ${slug}`);
    
    const endpoints = [
      `/conditions/${slug}/`,
      `/conditions/${slug}`,
      `/conditions/detail/${slug}/`,
      `/v2/pages/?slug=${slug}&type=conditions.ConditionPage`,
    ];
    
    // If slug contains an ID at the end (format: name-123)
    const parts = String(slug).split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      endpoints.unshift(`/conditions/by_id/${lastPart}/`);
      endpoints.unshift(`/v2/pages/${lastPart}/`);
    }
    
    const response = await tryEndpoints(endpoints, { lang });
    
    // Handle different response formats
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0];
    }
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching condition ${slug}:`, error);
    throw error;
  }
};

export const fetchCondition = fetchConditionBySlug;

export const fetchConditionPaths = async () => {
  try {
    console.log('🔍 Fetching condition paths');
    
    const endpoints = [
      '/conditions/paths',
      '/conditions/paths/',
      '/conditions/',
      '/v2/pages/?type=conditions.ConditionPage&fields=slug,title,id',
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, { params: { limit: 100 } });
        
        if (response.data) {
          // Handle different response formats
          if (Array.isArray(response.data)) {
            // If it's an array of strings (slugs)
            if (response.data.every(item => typeof item === 'string')) {
              return response.data;
            }
            // If it's an array of objects with slugs
            return response.data.map(item => {
              if (item.slug) return item.slug;
              if (item.title) {
                const slug = item.title.toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-');
                return item.id ? `${slug}-${item.id}` : slug;
              }
              return null;
            }).filter(Boolean);
          } else if (response.data.results) {
            return response.data.results.map(item => item.slug).filter(Boolean);
          } else if (response.data.items) {
            return response.data.items.map(item => item.slug).filter(Boolean);
          } else if (response.data.paths) {
            return response.data.paths;
          }
        }
      } catch (err) {
        // Continue to next endpoint
      }
    }
    
    // Fallback: fetch all conditions and generate slugs
    const conditions = await fetchConditionsIndex();
    return conditions.map(c => {
      const title = c.title || c.name;
      const id = c.id;
      if (title && id) {
        const slug = title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        return `${slug}-${id}`;
      }
      return c.slug;
    }).filter(Boolean);
    
  } catch (error) {
    console.error('Error fetching condition paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ DRUGS API
========================================================= */

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
    const endpoints = [
      '/drugs/',
      '/drugs',
      '/drugs/index/'
    ];
    
    const response = await tryEndpoints(endpoints, { lang: DEFAULT_LANG, limit: 100 });
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    } else if (response.data.items) {
      return response.data.items;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return [];
  }
};

export const fetchDrugsIndex = async () => {
  return getDrugs();
};

export const fetchDrugPaths = async () => {
  try {
    const drugs = await getDrugs();
    return drugs.map(d => d.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching drug paths:', error);
    return [];
  }
};

// ✅ NEW: Fetch drugs for conditions page
export const fetchDrugs = async (params = {}) => {
  try {
    const { limit = 50, lang = DEFAULT_LANG } = params;
    return await getDrugs();
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
    const response = await api.get('/homeopathy/topics/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    }
    return response.data || [];
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
    const response = await api.get('/ayurveda/topics/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    }
    return response.data || [];
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
    const response = await api.get('/yoga/topics/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    }
    return response.data || [];
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
      '/videos',
      '/videos/latest/'
    ];
    
    const response = await tryEndpoints(endpoints, { limit, lang: DEFAULT_LANG });
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    } else if (response.data.items) {
      return response.data.items;
    }
    return response.data || [];
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
    const response = await api.get('/social/posts/', {
      params: { limit, lang: DEFAULT_LANG }
    });
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return [];
  }
};

/* =========================================================
   ✅ REMEDIES API - NEW
========================================================= */

export const fetchRemedyArticles = async (params = {}) => {
  try {
    const { lang = DEFAULT_LANG, limit = 20 } = params;
    const response = await api.get('/remedies/', { 
      params: { lang, limit } 
    });
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    } else if (response.data.items) {
      return response.data.items;
    }
    return response.data || [];
  } catch (error) {
    console.error('Error fetching remedy articles:', error);
    return [];
  }
};

export const fetchRemedyBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const response = await api.get(`/remedies/${slug}/`, {
      params: { lang }
    });
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
   ✅ REVIEWERS API - NEW
========================================================= */

export const fetchReviewers = async () => {
  try {
    const response = await api.get('/reviewers/');
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    }
    return response.data || [];
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
    const response = await api.get(`/reviewers/${cleanSlug}/`);
    return response.data;
  } catch (error) {
    console.error('Reviewer fetch error:', error);
    throw error;
  }
};

/* =========================================================
   ✅ SEARCH API
========================================================= */

export const searchContent = async (query, filters = {}) => {
  try {
    const response = await api.get('/search', {
      params: {
        q: query,
        type: filters.type || '',
        lang: DEFAULT_LANG,
        include_laminin: true
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

/* =========================================================
   ✅ AUTHORS API
========================================================= */

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

export const fetchAuthors = async () => {
  try {
    const response = await api.get('/authors/');
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    }
    return response.data || [];
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

export default api;