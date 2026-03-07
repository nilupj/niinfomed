// utils/api.js - UPDATED FOR WAGTAIL API
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
    return `https://${url}`;
  }
  return '';
};

const baseUrl = getBaseUrl();

// ✅ FIXED: API configuration for Wagtail CMS - Use correct API endpoints
const api = axios.create({
  baseURL: typeof window === 'undefined' ? `${baseUrl}` : '',
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
      console.error('❌ API Response Error:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
      
      // Handle specific status codes
      if (error.response.status === 404) {
        return Promise.resolve({ data: { items: [] } });
      } else if (error.response.status === 401) {
        return Promise.reject(new Error('Unauthorized access'));
      } else if (error.response.status === 403) {
        return Promise.reject(new Error('Forbidden access'));
      } else if (error.response.status === 500) {
        console.error('❌ CMS Internal Server Error');
        return Promise.resolve({ data: { items: [] } });
      }
    } else if (error.request) {
      console.error('❌ API No Response:', error.config?.url);
      return Promise.reject(new Error('No response from server'));
    } else {
      console.error('❌ API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   ✅ HELPER FUNCTIONS FOR WAGTAIL API
========================================================= */

// ✅ Helper to build Wagtail API URL
const buildWagtailApiUrl = (type, fields = '', limit = 20, slug = null) => {
  let url = `/api/pages/?type=${type}&limit=${limit}`;
  
  if (fields) {
    url += `&fields=${fields}`;
  }
  
  if (slug) {
    url += `&slug=${slug}`;
  }
  
  return url;
};

// ✅ Transform Wagtail page to article format
const transformArticle = (item) => {
  if (!item) return null;
  
  return {
    id: item.id,
    title: item.title,
    slug: item.meta?.slug || item.slug,
    subtitle: item.subtitle || '',
    summary: item.summary || '',
    body: item.body || '',
    image: item.image?.meta?.download_url || 
           (item.image?.meta?.original?.url ? `${CMS_API_URL}${item.image.meta.original.url}` : null) ||
           (item.image?.url ? `${CMS_API_URL}${item.image.url}` : null),
    publish_date: item.first_published_at,
    updated_date: item.last_published_at || item.first_published_at,
    content_type: 'articles',
    author: item.author ? {
      name: item.author.name,
      credentials: item.author.credentials,
      bio: item.author.bio,
      image: item.author.image?.meta?.download_url
    } : null,
    category: item.category ? {
      name: item.category.name,
      slug: item.category.slug
    } : null
  };
};

// ✅ Transform Wagtail page to condition format
const transformCondition = (item) => {
  if (!item) return null;
  
  return {
    id: item.id,
    title: item.title,
    slug: item.meta?.slug || item.slug,
    subtitle: item.subtitle || '',
    summary: item.summary || '',
    symptoms: item.symptoms || '',
    causes: item.causes || '',
    treatment: item.treatment || '',
    prevention: item.prevention || '',
    body: item.body || '',
    image: item.image?.meta?.download_url || 
           (item.image?.meta?.original?.url ? `${CMS_API_URL}${item.image.meta.original.url}` : null) ||
           (item.image?.url ? `${CMS_API_URL}${item.image.url}` : null),
    publish_date: item.first_published_at,
    updated_date: item.last_published_at || item.first_published_at,
    content_type: 'conditions'
  };
};

// ✅ Transform Wagtail page to news format
const transformNews = (item) => {
  if (!item) return null;
  
  return {
    id: item.id,
    title: item.title,
    slug: item.meta?.slug || item.slug,
    subtitle: item.subtitle || '',
    summary: item.summary || '',
    body: item.body || '',
    image: item.image?.meta?.download_url || 
           (item.image?.meta?.original?.url ? `${CMS_API_URL}${item.image.meta.original.url}` : null) ||
           (item.image?.url ? `${CMS_API_URL}${item.image.url}` : null),
    publish_date: item.first_published_at,
    updated_date: item.last_published_at || item.first_published_at,
    content_type: 'news',
    category: item.category ? {
      name: item.category.name,
      slug: item.category.slug
    } : null
  };
};

/* =========================================================
   ✅ IMAGE HELPER FUNCTIONS
========================================================= */

export const getProxiedImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If it's already a full URL
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's from Wagtail media
  if (imageUrl.startsWith('/media/') || imageUrl.startsWith('/original_images/')) {
    return `${CMS_API_URL}${imageUrl}`;
  }

  // If it's a relative path
  if (imageUrl.startsWith('/')) {
    return `${CMS_API_URL}${imageUrl}`;
  }

  return imageUrl;
};

export const getImageUrl = getProxiedImageUrl;

// Helper to fetch with multiple endpoint attempts
export const tryEndpoints = async (endpoints, params = {}) => {
  let lastError = null;
  
  for (const endpoint of endpoints) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
      }
      
      const fullUrl = endpoint.startsWith('http') ? endpoint : `${CMS_API_URL}${endpoint}`;
      const response = await axios.get(fullUrl, { 
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
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
    }
  }
  
  return { data: { items: [] } };
};

// Helper to handle different response formats
export const handleResponse = (data) => {
  if (!data) return [];
  
  if (data.items) {
    return data.items;
  } else if (data.results) {
    return data.results;
  } else if (Array.isArray(data)) {
    return data;
  } else if (data.data) {
    return data.data;
  }
  
  return [];
};

// Helper to get total count from response
export const getTotalCount = (data) => {
  if (!data) return 0;
  
  if (data.meta?.total_count) return data.meta.total_count;
  if (data.count) return data.count;
  if (Array.isArray(data)) return data.length;
  if (data.items) return data.items.length;
  if (data.results) return data.results.length;
  
  return 0;
};

/* =========================================================
   ✅ DATE HELPER FUNCTIONS
========================================================= */

export const parseDateSafe = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : null;
  } catch {
    return null;
  }
};

export const formatDateDisplay = (date) => {
  if (!date) return 'Date not available';
  try {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

export const getTimeAgo = (date) => {
  if (!date) return '';
  try {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  } catch {
    return '';
  }
};

/* =========================================================
   ✅ URL & LINK HELPER FUNCTIONS
========================================================= */

export const getSafeCMSUrl = () => {
  return process.env.NEXT_PUBLIC_CMS_API_URL || 'https://api.niinfomed.com';
};

export const slugify = (text) =>
  (text || '')
    .toLowerCase()
    .trim()
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const extractHeadings = (html) => {
  if (!html) return [];
  const matches = [...html.matchAll(/<h([2-3])[^>]*>(.*?)<\/h\1>/gi)];
  return matches.map((m) => ({
    level: Number(m[1]),
    text: m[2].replace(/<\/?[^>]+(>|$)/g, '').trim(),
    id: slugify(m[2].replace(/<\/?[^>]+(>|$)/g, '').trim())
  }));
};

export const addHeadingIds = (html, headings) => {
  if (!html || !headings?.length) return html;

  let updated = html;
  headings.forEach((h) => {
    if (!h.id) return;
    
    updated = updated.replace(
      new RegExp(`<h${h.level}([^>]*)>${h.text}</h${h.level}>`, 'i'),
      `<h${h.level}$1 id="${h.id}">${h.text}</h${h.level}>`
    );
  });

  return updated;
};

/* =========================================================
   ✅ MEDIA URL FIX FUNCTIONS
========================================================= */

export const fixMediaUrls = (html = '', imageMap = {}) => {
  if (!html) return '';
  
  let processed = html;
  
  // Replace embed images
  processed = processed.replace(
    /<embed\s+[^>]*embedtype="image"[^>]*id="(\d+)"[^>]*\/?>/gi,
    (match, id) => {
      const imgUrl = imageMap?.[id] || null;
      if (!imgUrl) {
        return `<div class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 my-4">
          Image not found (ID: ${id})
        </div>`;
      }
      return `
        <img
          src="${imgUrl}"
          alt="Content Image"
          class="max-w-full w-full h-auto rounded-xl shadow my-4"
          loading="lazy"
          width="800"
          height="450"
        />
      `;
    }
  );
  
  processed = processed.replace(/src="\/media\//g, 'src="/cms-media/');
  processed = processed.replace(/src='\/media\//g, "src='/cms-media/");
  processed = processed.replace(/srcset="\/media\//g, 'srcset="/cms-media/');
  processed = processed.replace(/srcset='\/media\//g, "srcset='/cms-media/");
  
  processed = processed.replace(/\/cms-media\/media\//g, '/cms-media/');
  
  return processed;
};

/* =========================================================
   ✅ WAGTAIL LINK FIX FUNCTIONS
========================================================= */

export const extractEmbedImageIds = (html = '') => {
  if (!html) return [];
  const matches = [...html.matchAll(/embedtype="image"[^>]*id="(\d+)"/g)];
  return matches.map((m) => m[1]);
};

export const fetchWagtailImageUrl = async (id, safeBaseUrl) => {
  try {
    const res = await fetch(`${safeBaseUrl}/api/images/${id}/`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.meta?.download_url || data?.url || null;
  } catch {
    return null;
  }
};

const extractInternalPageLinkIds = (html = '') => {
  if (!html) return [];
  const matches = [...html.matchAll(/<a[^>]*linktype="page"[^>]*id="(\d+)"[^>]*>/g)];
  return matches.map((m) => m[1]);
};

const fetchWagtailPageById = async (id, safeBaseUrl) => {
  try {
    const res = await fetch(`${safeBaseUrl}/api/pages/${id}/`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const buildFrontendUrlFromWagtailPage = (pageData) => {
  if (!pageData) return '#';
  
  const type = (pageData?.meta?.type || '').toLowerCase();
  const slug = pageData?.meta?.slug || pageData?.slug;

  if (!slug) return '#';

  if (type.includes('yoga')) return `/yoga-exercise/${slug}`;
  if (type.includes('wellness')) return `/wellness/${slug}`;
  if (type.includes('ayurveda')) return `/ayurveda/${slug}`;
  if (type.includes('news')) return `/news/${slug}`;
  if (type.includes('article')) return `/articles/${slug}`;
  if (type.includes('condition')) return `/conditions/${slug}`;
  if (type.includes('drug')) return `/drugs/${slug}`;
  if (type.includes('homeopathy')) return `/homeopathy/${slug}`;

  return `/${slug}`;
};

export const fixWagtailInternalLinks = async (html = '', safeBaseUrl = '') => {
  if (!html) return '';

  let updated = html;

  try {
    const ids = extractInternalPageLinkIds(updated);

    for (const id of ids) {
      const pageData = await fetchWagtailPageById(id, safeBaseUrl);
      const url = pageData ? buildFrontendUrlFromWagtailPage(pageData) : '#';

      updated = updated.replace(
        new RegExp(`<a([^>]*?)linktype="page"([^>]*?)id="${id}"([^>]*?)>`, 'g'),
        `<a$1$2href="${url}"$3>`
      );
    }

    updated = updated.replace(
      /<a([^>]*?)linktype="document"([^>]*?)id="(\d+)"([^>]*?)>/g,
      `<a$1$2href="${CMS_API_URL}/documents/$3/" target="_blank" rel="noopener noreferrer"$4>`
    );

    updated = updated.replace(/linktype="[^"]*"/g, '');
    updated = updated.replace(/\s?id="\d+"/g, '');

    updated = updated.replace(
      /<a([^>]*?)href="(https?:\/\/[^"]+)"([^>]*?)>/g,
      `<a$1href="$2"$3 target="_blank" rel="noopener noreferrer">`
    );
  } catch (error) {
    console.error('Error fixing internal links:', error);
  }

  return updated;
};

export const replaceEmbedImages = async (html = '', safeBaseUrl = '') => {
  try {
    if (!html) return '';

    let updatedHtml = html;
    const ids = extractEmbedImageIds(updatedHtml);

    if (!ids.length) return updatedHtml;

    for (const id of ids) {
      const imgUrl = await fetchWagtailImageUrl(id, safeBaseUrl);

      if (!imgUrl) {
        updatedHtml = updatedHtml.replace(
          new RegExp(
            `<embed\\s+[^>]*embedtype="image"[^>]*id="${id}"[^>]*\\/?>`,
            'g'
          ),
          ''
        );
        continue;
      }

      const proxiedUrl = getProxiedImageUrl(imgUrl);

      updatedHtml = updatedHtml.replace(
        new RegExp(
          `<embed\\s+[^>]*embedtype="image"[^>]*id="${id}"[^>]*\\/?>`,
          'g'
        ),
        `<img src="${proxiedUrl}" alt="Content Image" class="max-w-full h-auto rounded-xl" loading="lazy" width="800" height="450" />`
      );
    }

    return updatedHtml;
  } catch (err) {
    console.error('replaceEmbedImages error:', err);
    return html;
  }
};

/* =========================================================
   ✅ MOCK DATA FOR DEVELOPMENT
========================================================= */

const mockArticles = [
  {
    id: 1,
    title: 'Understanding Heart Health',
    slug: 'understanding-heart-health',
    summary: 'Learn about the key factors that contribute to heart health and how to maintain a healthy cardiovascular system.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&h=500',
    category: { name: 'Cardiology', slug: 'cardiology' }
  },
  {
    id: 2,
    title: 'Nutrition for Optimal Health',
    slug: 'nutrition-for-optimal-health',
    summary: 'Discover the essential nutrients your body needs and how to incorporate them into your daily diet.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&h=500',
    category: { name: 'Nutrition', slug: 'nutrition' }
  },
  {
    id: 3,
    title: 'Mental Wellness Strategies',
    slug: 'mental-wellness-strategies',
    summary: 'Practical tips and techniques for maintaining good mental health and emotional well-being.',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&h=500',
    category: { name: 'Mental Health', slug: 'mental-health' }
  }
];

const mockNews = [
  {
    id: 1,
    title: 'New Study Reveals Benefits of Mediterranean Diet',
    slug: 'mediterranean-diet-study',
    summary: 'Recent research shows that following a Mediterranean diet can reduce the risk of heart disease by up to 25%.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=500',
    category: { name: 'Nutrition News', slug: 'nutrition-news' }
  },
  {
    id: 2,
    title: 'FDA Approves New Treatment for Diabetes',
    slug: 'fda-approves-diabetes-treatment',
    summary: 'The FDA has approved a new medication that shows promising results for type 2 diabetes management.',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&h=500',
    category: { name: 'Medical News', slug: 'medical-news' }
  }
];

const mockConditions = [
  {
    id: 1,
    title: 'Type 2 Diabetes',
    slug: 'type-2-diabetes',
    summary: 'Learn about the causes, symptoms, and management of type 2 diabetes.',
    image: 'https://images.unsplash.com/photo-1571772994411-912c1e807fbf?auto=format&fit=crop&w=800&h=500',
    category: { name: 'Endocrine Disorders', slug: 'endocrine' }
  },
  {
    id: 2,
    title: 'Hypertension',
    slug: 'hypertension',
    summary: 'Understanding high blood pressure and how to manage it effectively.',
    image: 'https://images.unsplash.com/photo-1581595219315-a187dbe9e8d6?auto=format&fit=crop&w=800&h=500',
    category: { name: 'Cardiovascular', slug: 'cardiovascular' }
  }
];

/* =========================================================
   ✅ ARTICLES API - UPDATED FOR WAGTAIL
========================================================= */

export const fetchTopStories = async (limit = 10) => {
  try {
    const url = buildWagtailApiUrl('articles.ArticlePage', 'title,subtitle,summary,slug,image,first_published_at', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      return items.map(transformArticle);
    }
    
    if (process.env.NODE_ENV === 'development') {
      return mockArticles.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching top stories:', error);
    if (process.env.NODE_ENV === 'development') {
      return mockArticles.slice(0, limit);
    }
    return [];
  }
};

export const fetchArticlesLatest = async (limit = 20) => {
  return fetchTopStories(limit);
};

export const fetchArticleBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('articles.ArticlePage', 'title,subtitle,summary,body,slug,image,first_published_at,last_published_at,author,category', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      return transformArticle(items[0]);
    }
    
    if (process.env.NODE_ENV === 'development') {
      return mockArticles.find(a => a.slug === slug) || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    if (process.env.NODE_ENV === 'development') {
      return mockArticles.find(a => a.slug === slug) || null;
    }
    return null;
  }
};

export const fetchArticle = fetchArticleBySlug;

export const fetchArticlePaths = async () => {
  try {
    const url = buildWagtailApiUrl('articles.ArticlePage', 'slug', 100);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => item.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching article paths:', error);
    if (process.env.NODE_ENV === 'development') {
      return mockArticles.map(a => a.slug);
    }
    return [];
  }
};

export const fetchRelatedArticles = async (slug, limit = 3) => {
  try {
    // First get current article to get category
    const currentArticle = await fetchArticleBySlug(slug);
    
    if (!currentArticle) return [];
    
    // Fetch other articles
    const url = buildWagtailApiUrl('articles.ArticlePage', 'title,summary,slug,image,first_published_at', 10);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    // Filter out current article and limit
    const related = items
      .filter(item => item.slug !== slug)
      .slice(0, limit)
      .map(transformArticle);
    
    return related;
  } catch (error) {
    console.error('Error fetching related articles:', error);
    if (process.env.NODE_ENV === 'development') {
      return mockArticles.filter(a => a.slug !== slug).slice(0, limit);
    }
    return [];
  }
};

export const fetchHealthTopics = async (limit = 12) => {
  return fetchTopStories(limit);
};

/* =========================================================
   ✅ NEWS API - UPDATED FOR WAGTAIL
========================================================= */

export const fetchLatestNews = async (limit = 10) => {
  try {
    const url = buildWagtailApiUrl('news.NewsPage', 'title,subtitle,summary,slug,image,first_published_at,category', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      return items.map(transformNews);
    }
    
    if (process.env.NODE_ENV === 'development') {
      return mockNews.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching latest news:', error);
    if (process.env.NODE_ENV === 'development') {
      return mockNews.slice(0, limit);
    }
    return [];
  }
};

export const fetchNewsBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('news.NewsPage', 'title,subtitle,summary,body,slug,image,first_published_at,last_published_at,category', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      return transformNews(items[0]);
    }
    
    if (process.env.NODE_ENV === 'development') {
      return mockNews.find(n => n.slug === slug) || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching news ${slug}:`, error);
    if (process.env.NODE_ENV === 'development') {
      return mockNews.find(n => n.slug === slug) || null;
    }
    return null;
  }
};

export const fetchRelatedNews = async (slug, limit = 3) => {
  try {
    const url = buildWagtailApiUrl('news.NewsPage', 'title,summary,slug,image,first_published_at', 10);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    const related = items
      .filter(item => item.slug !== slug)
      .slice(0, limit)
      .map(transformNews);
    
    return related;
  } catch (error) {
    console.error('Error fetching related news:', error);
    if (process.env.NODE_ENV === 'development') {
      return mockNews.filter(n => n.slug !== slug).slice(0, limit);
    }
    return [];
  }
};

export const fetchNewsPaths = async () => {
  try {
    const url = buildWagtailApiUrl('news.NewsPage', 'slug', 100);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => item.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching news paths:', error);
    if (process.env.NODE_ENV === 'development') {
      return mockNews.map(n => n.slug);
    }
    return [];
  }
};

/* =========================================================
   ✅ CONDITIONS API - UPDATED FOR WAGTAIL
========================================================= */

export const fetchLatestConditions = async (limit = 20) => {
  try {
    const url = buildWagtailApiUrl('conditions.ConditionPage', 'title,subtitle,summary,slug,image,first_published_at', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      return items.map(transformCondition);
    }
    
    if (process.env.NODE_ENV === 'development') {
      return mockConditions.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching latest conditions:', error);
    if (process.env.NODE_ENV === 'development') {
      return mockConditions.slice(0, limit);
    }
    return [];
  }
};

export const fetchConditionsIndex = async () => {
  return fetchLatestConditions(100);
};

export const fetchConditionBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('conditions.ConditionPage', 'title,subtitle,summary,symptoms,causes,treatment,prevention,body,slug,image,first_published_at,last_published_at', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      return transformCondition(items[0]);
    }
    
    if (process.env.NODE_ENV === 'development') {
      return mockConditions.find(c => c.slug === slug) || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching condition ${slug}:`, error);
    if (process.env.NODE_ENV === 'development') {
      return mockConditions.find(c => c.slug === slug) || null;
    }
    return null;
  }
};

export const fetchCondition = fetchConditionBySlug;

export const fetchConditionPaths = async () => {
  try {
    const url = buildWagtailApiUrl('conditions.ConditionPage', 'slug', 100);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => item.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching condition paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ WELLNESS API
========================================================= */

export const fetchWellnessTopics = async (limit = 50) => {
  try {
    const url = buildWagtailApiUrl('wellness.WellnessPage', 'title,summary,slug,image,first_published_at', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      image: item.image?.meta?.download_url || null,
      publish_date: item.first_published_at,
      content_type: 'wellness'
    }));
  } catch (error) {
    console.error('Error fetching wellness topics:', error);
    return [];
  }
};

export const fetchWellnessTopic = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('wellness.WellnessPage', 'title,summary,body,slug,image,first_published_at,last_published_at', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      const item = items[0];
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary || '',
        body: item.body || '',
        image: item.image?.meta?.download_url || null,
        publish_date: item.first_published_at,
        updated_date: item.last_published_at || item.first_published_at,
        content_type: 'wellness'
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching wellness topic ${slug}:`, error);
    return null;
  }
};

/* =========================================================
   ✅ DRUGS API
========================================================= */

export const fetchDrugs = async (limit = 100) => {
  try {
    const url = buildWagtailApiUrl('drugs.DrugPage', 'title,summary,slug,image,first_published_at', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      image: item.image?.meta?.download_url || null,
      content_type: 'drugs'
    }));
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return [];
  }
};

export const fetchDrugBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('drugs.DrugPage', 'title,summary,body,slug,image,first_published_at,last_published_at', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      const item = items[0];
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary || '',
        body: item.body || '',
        image: item.image?.meta?.download_url || null,
        publish_date: item.first_published_at,
        updated_date: item.last_published_at || item.first_published_at,
        content_type: 'drugs'
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching drug ${slug}:`, error);
    return null;
  }
};

export const fetchDrugPaths = async () => {
  try {
    const url = buildWagtailApiUrl('drugs.DrugPage', 'slug', 100);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => item.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching drug paths:', error);
    return [];
  }
};

/* =========================================================
   ✅ HOMEOPATHY API
========================================================= */

export const fetchHomeopathyTopics = async (limit = 20) => {
  try {
    const url = buildWagtailApiUrl('homeopathy.HomeopathyPage', 'title,summary,slug,image,first_published_at', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      image: item.image?.meta?.download_url || null,
      content_type: 'homeopathy'
    }));
  } catch (error) {
    console.error('Error fetching homeopathy topics:', error);
    return [];
  }
};

export const fetchHomeopathyTopic = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('homeopathy.HomeopathyPage', 'title,summary,body,slug,image,first_published_at,last_published_at', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      const item = items[0];
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary || '',
        body: item.body || '',
        image: item.image?.meta?.download_url || null,
        publish_date: item.first_published_at,
        updated_date: item.last_published_at || item.first_published_at,
        content_type: 'homeopathy'
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching homeopathy topic ${slug}:`, error);
    return null;
  }
};

/* =========================================================
   ✅ AYURVEDA API
========================================================= */

export const fetchAyurvedaTopics = async (limit = 20) => {
  try {
    const url = buildWagtailApiUrl('ayurveda.AyurvedaPage', 'title,summary,slug,image,first_published_at', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      image: item.image?.meta?.download_url || null,
      content_type: 'ayurveda'
    }));
  } catch (error) {
    console.error('Error fetching ayurveda topics:', error);
    return [];
  }
};

export const fetchAyurvedaTopic = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('ayurveda.AyurvedaPage', 'title,summary,body,slug,image,first_published_at,last_published_at', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      const item = items[0];
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary || '',
        body: item.body || '',
        image: item.image?.meta?.download_url || null,
        publish_date: item.first_published_at,
        updated_date: item.last_published_at || item.first_published_at,
        content_type: 'ayurveda'
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ayurveda topic ${slug}:`, error);
    return null;
  }
};

/* =========================================================
   ✅ YOGA API
========================================================= */

export const fetchYogaTopics = async (limit = 20) => {
  try {
    const url = buildWagtailApiUrl('yoga.YogaPage', 'title,summary,slug,image,first_published_at', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      image: item.image?.meta?.download_url || null,
      content_type: 'yoga'
    }));
  } catch (error) {
    console.error('Error fetching yoga topics:', error);
    return [];
  }
};

export const fetchYogaTopic = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('yoga.YogaPage', 'title,summary,body,slug,image,first_published_at,last_published_at', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      const item = items[0];
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary || '',
        body: item.body || '',
        image: item.image?.meta?.download_url || null,
        publish_date: item.first_published_at,
        updated_date: item.last_published_at || item.first_published_at,
        content_type: 'yoga'
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching yoga topic ${slug}:`, error);
    return null;
  }
};

/* =========================================================
   ✅ VIDEOS API
========================================================= */

export const fetchVideos = async (limit = 20, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('videos.VideoPage', 'title,summary,slug,image,first_published_at', limit);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    return items.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      thumbnail: item.image?.meta?.download_url || null,
      content_type: 'videos'
    }));
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const fetchVideoBySlug = async (slug, lang = DEFAULT_LANG) => {
  try {
    const url = buildWagtailApiUrl('videos.VideoPage', 'title,summary,body,slug,image,first_published_at,last_published_at', 1, slug);
    const response = await api.get(url);
    const items = response.data?.items || [];
    
    if (items.length > 0) {
      const item = items[0];
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary || '',
        body: item.body || '',
        thumbnail: item.image?.meta?.download_url || null,
        publish_date: item.first_published_at,
        updated_date: item.last_published_at || item.first_published_at,
        content_type: 'videos'
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching video ${slug}:`, error);
    return null;
  }
};

/* =========================================================
   ✅ SOCIAL POSTS API
========================================================= */

export const fetchSocialPosts = async (limit = 20) => {
  // This might need custom implementation
  return [];
};

/* =========================================================
   ✅ TRENDING API
========================================================= */

export const fetchTrending = async () => {
  try {
    // Get latest from all content types
    const [articles, conditions, news] = await Promise.all([
      fetchTopStories(5),
      fetchLatestConditions(5),
      fetchLatestNews(5)
    ]);
    
    return [...articles, ...conditions, ...news].sort((a, b) => {
      return new Date(b.publish_date) - new Date(a.publish_date);
    }).slice(0, 10);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const fetchTrendingBySlug = async (slug) => {
  return fetchArticleBySlug(slug) || fetchConditionBySlug(slug) || fetchNewsBySlug(slug);
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
      social: []
    };
  }
  
  try {
    // This would need a custom search endpoint
    const results = {
      articles: await fetchTopStories(5),
      conditions: await fetchLatestConditions(5),
      news: await fetchLatestNews(5),
      wellness: await fetchWellnessTopics(5),
      drugs: await fetchDrugs(5),
      ayurveda: await fetchAyurvedaTopics(5),
      homeopathy: await fetchHomeopathyTopics(5),
      yoga: await fetchYogaTopics(5),
      videos: await fetchVideos(5),
      social: []
    };
    
    // Filter based on query (simple client-side filtering)
    const filtered = {};
    for (const [key, items] of Object.entries(results)) {
      filtered[key] = items.filter(item => 
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.summary?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return filtered;
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
      social: []
    };
  }
};

/* =========================================================
   ✅ AUTHORS API
========================================================= */

export const fetchAuthors = async () => {
  try {
    // This would need a custom endpoint
    return [];
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
};

export const fetchAuthorBySlug = async (slug) => {
  try {
    return null;
  } catch (error) {
    console.error(`Error fetching author ${slug}:`, error);
    return null;
  }
};

/* =========================================================
   ✅ HEALTH CHECK API
========================================================= */

export const checkHealth = async () => {
  try {
    const response = await api.get('/api/pages/?limit=1');
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
   ✅ EXPORT ALL FUNCTIONS
========================================================= */

export {
  api,
  CMS_API_URL,
  DEFAULT_LANG,
  mockArticles,
  mockNews,
  mockConditions
};

export default api;