import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import SEO from "../../components/SEO";
import CommentSection from "../../components/CommentSection";
import ReferencesSection from "../../components/ReferencesSection";

// Oracle CMS URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";

/* =========================================================
   ✅ HELPER FUNCTION FOR MULTIPLE ENDPOINT ATTEMPTS
========================================================= */
const tryFetchFromMultipleEndpoints = async (endpoints = [], config = {}) => {
  for (let url of endpoints) {
    try {
      console.log(`🔍 Trying endpoint: ${url}`);
      const res = await axios.get(url, config);
      if (res?.data) {
        console.log(`✅ Success from: ${url}`);
        return { data: res.data, usedUrl: url };
      }
    } catch (err) {
      console.log(`❌ Failed: ${url}`);
    }
  }
  return { data: null, usedUrl: null };
};

/* =========================================================
   ✅ IMAGE URL HELPER - UPDATED FOR ORACLE CMS
========================================================= */

/**
 * Get proxied image URL for Oracle CMS
 */
const getProxiedImageUrl = (url) => {
  if (!url) return null;

  // Agar already proxied hai toh wahi return karo
  if (url.startsWith('/cms-media/')) {
    return url;
  }

  // Oracle CMS URL handle karo
  if (url.includes('161.118.167.107')) {
    return url.replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/');
  }

  // Localhost patterns handle karo
  if (url.includes('0.0.0.0:8001') || url.includes('127.0.0.1:8001') || url.includes('localhost:8001')) {
    return url.replace(/https?:\/\/[^\/]+\/media\//, '/cms-media/');
  }
  
  // Relative media URLs handle karo
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  
  // Full URLs (Unsplash, etc.) as they are
  if (url.startsWith('http')) {
    return url;
  }
  
  return url;
};

/**
 * ✅ COMPREHENSIVE WAGTAIL URL TRANSFORMATION (unchanged)
 */
const extractAllHrefUrls = (html = "") => {
  if (!html) return [];
  const matches = [...html.matchAll(/href="([^"]*)"/g)];
  return matches.map(m => m[1]);
};

const transformWagtailUrlToNextRoute = (wagtailUrl = "") => {
  if (!wagtailUrl || wagtailUrl === "#") return "#";
  
  let path = wagtailUrl;
  path = path.replace(/https?:\/\/[^\/]+\//, '/');
  if (!path.startsWith('/')) path = '/' + path;
  
  const directMappings = {
    '/all-homeopathic-pages/': '/homeopathy/',
    '/all-homeopathy/': '/homeopathy/',
    '/all-ayurvedic-pages/': '/ayurveda/',
    '/all-ayurveda/': '/ayurveda/',
    '/all-news-pages/': '/news/',
    '/all-news/': '/news/',
    '/all-wellness-pages/': '/wellness/',
    '/all-wellness/': '/wellness/',
    '/all-conditions-a-z/': '/conditions/',
    '/all-conditions/': '/conditions/',
    '/all-drugs-a-z-pages/': '/drugs/',
    '/all-drugs-pages/': '/drugs/',
    '/all-drugs/': '/drugs/',
    '/all-yoga-pages/': '/yoga-exercise/',
    '/all-yoga/': '/yoga-exercise/',
    '/all-article-pages/': '/articles/',
    '/all-articles/': '/articles/',
  };
  
  for (const [wagtailPattern, nextRoute] of Object.entries(directMappings)) {
    if (path.startsWith(wagtailPattern)) {
      const slug = path.replace(wagtailPattern, '');
      if (slug) {
        const finalRoute = nextRoute.endsWith('/') ? `${nextRoute}${slug}` : `${nextRoute}/${slug}`;
        return finalRoute;
      }
    }
  }
  
  const cleanRoutes = ['/homeopathy/', '/ayurveda/', '/news/', '/wellness/', '/conditions/', '/drugs/', '/articles/', '/yoga-exercise/'];
  for (const route of cleanRoutes) {
    if (path.startsWith(route)) return path;
  }
  
  return "#";
};

const fixWagtailLinks = (html = "") => {
  if (!html) return html;
  let updatedHtml = html;
  
  try {
    const allHrefs = extractAllHrefUrls(updatedHtml);
    const wagtailHrefs = allHrefs.filter(href => 
      href.includes('all-') || href.includes('localhost') || href.includes('127.0.0.1') || href.includes('0.0.0.0')
    );
    
    if (wagtailHrefs.length > 0) {
      wagtailHrefs.forEach(wagtailUrl => {
        const transformedUrl = transformWagtailUrlToNextRoute(wagtailUrl);
        if (transformedUrl !== "#" && transformedUrl !== wagtailUrl) {
          const escapedUrl = wagtailUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`href="${escapedUrl}"`, 'g');
          updatedHtml = updatedHtml.replace(regex, `href="${transformedUrl}"`);
        }
      });
    }
    
    const patternReplacements = [
      { pattern: /href="[^"]*\/all-homeopathic-pages\/([^"]+)"/g, replacement: 'href="/homeopathy/$1"' },
      { pattern: /href="[^"]*\/all-homeopathy\/([^"]+)"/g, replacement: 'href="/homeopathy/$1"' },
      { pattern: /href="[^"]*\/all-ayurvedic-pages\/([^"]+)"/g, replacement: 'href="/ayurveda/$1"' },
      { pattern: /href="[^"]*\/all-ayurveda\/([^"]+)"/g, replacement: 'href="/ayurveda/$1"' },
      { pattern: /href="[^"]*\/all-news-pages\/([^"]+)"/g, replacement: 'href="/news/$1"' },
      { pattern: /href="[^"]*\/all-news\/([^"]+)"/g, replacement: 'href="/news/$1"' },
      { pattern: /href="[^"]*\/all-wellness-pages\/([^"]+)"/g, replacement: 'href="/wellness/$1"' },
      { pattern: /href="[^"]*\/all-wellness\/([^"]+)"/g, replacement: 'href="/wellness/$1"' },
      { pattern: /href="[^"]*\/all-conditions-a-z\/conditions\/condition\/([^"]+)"/g, replacement: 'href="/conditions/$1"' },
      { pattern: /href="[^"]*\/all-conditions\/([^"]+)"/g, replacement: 'href="/conditions/$1"' },
      { pattern: /href="[^"]*\/all-drugs-a-z-pages\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="[^"]*\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="[^"]*\/all-drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="[^"]*\/all-yoga-pages\/([^"]+)"/g, replacement: 'href="/yoga-exercise/$1"' },
      { pattern: /href="[^"]*\/all-yoga\/([^"]+)"/g, replacement: 'href="/yoga-exercise/$1"' },
      { pattern: /href="[^"]*\/all-article-pages\/([^"]+)"/g, replacement: 'href="/articles/$1"' },
      { pattern: /href="[^"]*\/all-articles\/([^"]+)"/g, replacement: 'href="/articles/$1"' },
    ];
    
    patternReplacements.forEach(({ pattern, replacement }) => {
      updatedHtml = updatedHtml.replace(pattern, replacement);
    });
    
    updatedHtml = updatedHtml.replace(/linktype="[^"]*"/g, '');
    updatedHtml = updatedHtml.replace(/\s?parent-id="\d+"/g, '');
    updatedHtml = updatedHtml.replace(/\s?id="\d+"/g, '');
    
    updatedHtml = updatedHtml.replace(
      /<a([^>]*?)href="(https?:\/\/[^"]+)"([^>]*?)>/g,
      `<a$1href="$2"$3 target="_blank" rel="noopener noreferrer">`
    );
    
  } catch (error) {
    console.error("Error fixing Wagtail links:", error);
  }
  
  return updatedHtml;
};

/* =========================================================
   ✅ MEDIA URL FIXER - UPDATED
========================================================= */

const fixMediaUrls = (html = "") => {
  if (!html) return "";

  let processed = html;

  // Replace embed images
  processed = processed.replace(
    /<embed\s+[^>]*embedtype="image"[^>]*id="(\d+)"[^>]*\/?>/g,
    (match, id) => {
      return `<img src="${CMS_API_URL}/api/v2/images/${id}/" alt="CMS Image" class="max-w-full h-auto rounded-lg" loading="lazy" width="800" height="450" />`;
    }
  );

  // Replace media URLs with proxied paths
  processed = processed.replace(/src="\/media\//g, `src="/cms-media/`);
  processed = processed.replace(/src='\/media\//g, `src='/cms-media/`);
  processed = processed.replace(/srcset="\/media\//g, `srcset="/cms-media/`);
  processed = processed.replace(/srcset='\/media\//g, `srcset='/cms-media/`);
  
  // Replace Oracle CMS URLs with proxied paths
  processed = processed.replace(/src="https?:\/\/161\.118\.167\.107\/media\//g, `src="/cms-media/`);
  processed = processed.replace(/src='https?:\/\/161\.118\.167\.107\/media\//g, `src='/cms-media/`);
  
  // Replace url() references
  processed = processed.replace(/url\(\/media\//g, `url(/cms-media/`);
  processed = processed.replace(/url\('\/media\//g, `url('/cms-media/`);
  processed = processed.replace(/url\("\/media\//g, `url("/cms-media/`);
  
  // Clean up double slashes
  processed = processed.replace(/\/cms-media\/media\//g, '/cms-media/');

  return processed;
};

/**
 * ✅ COMPREHENSIVE CONTENT FIXER
 */
const fixContentUrls = (html = "") => {
  if (!html) return "";
  
  // 1. Fix media URLs (images)
  let processed = fixMediaUrls(html);
  
  // 2. Fix Wagtail links
  processed = fixWagtailLinks(processed);
  
  return processed;
};

/* =========================================================
   ✅ Image Component with Fallback
========================================================= */

const ImageWithFallback = ({ src, alt, className, width, height, priority = false, ...props }) => {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(getProxiedImageUrl(src));

  useEffect(() => {
    setImageSrc(getProxiedImageUrl(src));
    setError(false);
  }, [src]);

  if (error || !imageSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height }}>
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt || "Wellness image"}
      className={className}
      width={width}
      height={height}
      onError={() => setError(true)}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...props}
    />
  );
};

/* =========================================================
   ✅ DATE DISPLAY FUNCTIONS (unchanged)
========================================================= */

const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

const getDaysDifference = (date1, date2) => {
  if (!date1 || !date2) return 0;
  const diffTime = Math.abs(date2 - date1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const getDateDisplayConfig = (publishedDate, updatedDate) => {
  const hasPublished = isValidDate(publishedDate);
  const hasUpdated = isValidDate(updatedDate);
  
  const published = hasPublished ? new Date(publishedDate) : null;
  const updated = hasUpdated ? new Date(updatedDate) : null;
  
  if (!hasUpdated && hasPublished) {
    return {
      primaryDate: published,
      primaryLabel: "Published",
      showSecondary: false,
      secondaryDate: null,
      secondaryLabel: "",
      showUpdatedBadge: false,
      daysSinceUpdate: 0,
      isRecent: false,
    };
  }
  
  if (hasPublished && hasUpdated) {
    const daysDiff = getDaysDifference(published, updated);
    const isRecentUpdate = daysDiff > 0 && daysDiff <= 30;
    const isMajorUpdate = daysDiff > 30;
    
    if (isMajorUpdate) {
      return {
        primaryDate: updated,
        primaryLabel: "Updated",
        showSecondary: true,
        secondaryDate: published,
        secondaryLabel: "Originally published",
        showUpdatedBadge: true,
        daysSinceUpdate: daysDiff,
        isRecent: false,
        isMajorUpdate: true,
      };
    }
    
    return {
      primaryDate: published,
      primaryLabel: "Published",
      showSecondary: false,
      secondaryDate: updated,
      secondaryLabel: "Updated",
      showUpdatedBadge: true,
      daysSinceUpdate: daysDiff,
      isRecent: isRecentUpdate,
      isMajorUpdate: false,
    };
  }
  
  if (hasUpdated && !hasPublished) {
    return {
      primaryDate: updated,
      primaryLabel: "Updated",
      showSecondary: false,
      secondaryDate: null,
      secondaryLabel: "",
      showUpdatedBadge: false,
      daysSinceUpdate: 0,
      isRecent: false,
    };
  }
  
  return {
    primaryDate: null,
    primaryLabel: "",
    showSecondary: false,
    secondaryDate: null,
    secondaryLabel: "",
    showUpdatedBadge: false,
    daysSinceUpdate: 0,
    isRecent: false,
  };
};

const formatDisplayDate = (date, includeTime = false) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return "";
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  
  return date.toLocaleDateString('en-US', options);
};

const getTimeAgo = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return "";
  
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return "just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

/* =========================================================
   ✅ DateDisplay Component
========================================================= */

const DateDisplay = ({ publishedDate, updatedDate, compact = false, className = "" }) => {
  const dateConfig = getDateDisplayConfig(publishedDate, updatedDate);
  
  if (!dateConfig.primaryDate) return null;
  
  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <span className="font-medium">{dateConfig.primaryLabel}:</span>
        <time dateTime={dateConfig.primaryDate.toISOString()}>
          {formatDisplayDate(dateConfig.primaryDate)}
        </time>
        
        {dateConfig.showUpdatedBadge && (
          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
            dateConfig.isRecent 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            {dateConfig.isRecent ? 'Recently updated' : 'Updated'}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
          dateConfig.isRecent ? 'bg-green-50' : 'bg-blue-50'
        }`}>
          <span className={`text-lg font-bold ${
            dateConfig.isRecent ? 'text-green-700' : 'text-blue-700'
          }`}>
            {dateConfig.primaryDate.getDate()}
          </span>
          <span className={`text-xs uppercase ${
            dateConfig.isRecent ? 'text-green-600' : 'text-blue-600'
          }`}>
            {dateConfig.primaryDate.toLocaleString('en-US', { month: 'short' })}
          </span>
        </div>
        
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">
              {dateConfig.primaryLabel} on
            </span>
            <time 
              dateTime={dateConfig.primaryDate.toISOString()}
              className="text-lg font-bold text-gray-800"
            >
              {formatDisplayDate(dateConfig.primaryDate)}
            </time>
          </div>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-gray-500">
              ({getTimeAgo(dateConfig.primaryDate)})
            </span>
            
            {dateConfig.showUpdatedBadge && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                dateConfig.isRecent 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {dateConfig.isRecent ? 'Recently updated' : 'Updated'}
                {dateConfig.daysSinceUpdate > 0 && ` • ${dateConfig.daysSinceUpdate} days later`}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {dateConfig.showSecondary && dateConfig.secondaryDate && (
        <div className="pl-15 border-l-2 border-gray-200 pl-4 ml-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <span className="font-medium">{dateConfig.secondaryLabel}:</span>
            <time dateTime={dateConfig.secondaryDate.toISOString()}>
              {formatDisplayDate(dateConfig.secondaryDate)}
            </time>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              ({getTimeAgo(dateConfig.secondaryDate)})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   ✅ HELPER FUNCTIONS
========================================================= */

const makeHeadingId = (text = "") => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

const getAuthorDisplayName = (topic) => {
  return topic.author?.name || topic.author_name || "Niinfomed Staff";
};

const getAuthorSlug = (topic) => {
  if (topic.author?.slug) return topic.author.slug;
  if (topic.author?.name) {
    return topic.author.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  return null;
};

const getReviewerSlug = (topic) => {
  if (topic.reviewer?.slug) return topic.reviewer.slug;
  if (topic.reviewer?.name) {
    return topic.reviewer.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  return null;
};

/* =========================================================
   ✅ Table of Contents Component
========================================================= */

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    if (!content || typeof window === "undefined") return;

    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(content, "text/html");

      const nodes = Array.from(doc.querySelectorAll("h2, h3"));

      const toc = nodes
        .map((h) => {
          const text = (h.textContent || "").trim();
          if (!text) return null;

          const id = h.id ? h.id : makeHeadingId(text);

          return {
            id,
            text,
            level: h.tagName,
          };
        })
        .filter(Boolean);

      setHeadings(toc);
    } catch (err) {
      console.error("TOC parse error:", err);
      setHeadings([]);
    }
  }, [content]);

  if (!headings.length) return null;

  return (
    <div className="mb-8 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold mb-3">On this page</h3>

      <ul className="space-y-2 text-sm">
        {headings.map((item) => (
          <li key={item.id} className={item.level === "H3" ? "ml-4" : ""}>
            <a
              href={`#${item.id}`}
              className="text-gray-700 hover:text-blue-600 hover:underline transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(item.id);
                if (element) {
                  const offset = 100;
                  const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* =========================================================
   ✅ Content Metadata Component
========================================================= */

const ContentMetadata = ({ 
  category, 
  difficultyLevel, 
  readingTime,
  publishedDate,
  updatedDate 
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {category && (
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {category.name}
        </span>
      )}
      
      {difficultyLevel && (
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {difficultyLevel}
        </span>
      )}
      
      {readingTime && (
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {readingTime} min read
        </span>
      )}
      
      <DateDisplay 
        publishedDate={publishedDate}
        updatedDate={updatedDate}
        compact={true}
        className="bg-gray-100 px-3 py-1.5 rounded-full"
      />
    </div>
  );
};

/* =========================================================
   ✅ Skeleton Loader Component
========================================================= */
const SkeletonLoader = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      <div className="h-64 bg-gray-200 rounded mb-8"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */

export default function WellnessDetail({ 
  topic: initialTopic, 
  relatedTopics: initialRelated,
  processedBody: initialProcessedBody,
  processedReferences: initialProcessedReferences,
  processedBenefits: initialProcessedBenefits,
  processedTips: initialProcessedTips,
  mainImageUrl: initialMainImageUrl
}) {
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [relatedTopics, setRelatedTopics] = useState(initialRelated);
  const [loading, setLoading] = useState(!initialTopic);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  const [processedBody, setProcessedBody] = useState(initialProcessedBody || "");
  const [processedReferences, setProcessedReferences] = useState(initialProcessedReferences || "");
  const [processedBenefits, setProcessedBenefits] = useState(initialProcessedBenefits || "");
  const [processedTips, setProcessedTips] = useState(initialProcessedTips || "");

  // Fix content client-side if not processed server-side
  useEffect(() => {
    if (initialProcessedBody && initialProcessedReferences && 
        initialProcessedBenefits && initialProcessedTips) {
      setContentLoaded(true);
      return;
    }

    if (topic) {
      // Process all content in parallel
      const processAllContent = () => {
        setProcessedBody(fixContentUrls(topic.body || ""));
        setProcessedReferences(fixContentUrls(topic.references || ""));
        setProcessedBenefits(fixContentUrls(topic.benefits || ""));
        setProcessedTips(fixContentUrls(topic.tips || ""));
        setContentLoaded(true);
      };

      processAllContent();
    }
  }, [topic, initialProcessedBody, initialProcessedReferences, initialProcessedBenefits, initialProcessedTips]);

  // Mark content as loaded when hero image loads
  useEffect(() => {
    if (!topic?.image) {
      setHeroImageLoaded(true);
      setContentLoaded(true);
      return;
    }

    const imageLoader = typeof window !== 'undefined' ? new window.Image() : null;
    
    if (imageLoader) {
      const imageUrl = getProxiedImageUrl(topic.image);
      imageLoader.src = imageUrl;
      imageLoader.onload = () => {
        setHeroImageLoaded(true);
        setContentLoaded(true);
      };
      imageLoader.onerror = () => {
        setHeroImageLoaded(true);
        setContentLoaded(true);
      };
    } else {
      setHeroImageLoaded(true);
      setContentLoaded(true);
    }
  }, [topic?.image]);

  if (router.isFallback || loading) {
    return <SkeletonLoader />;
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">Wellness Topic Not Found</h1>
          <p className="text-yellow-700 mb-6">
            This wellness topic does not exist or may have been removed.
          </p>
          <Link
            href="/wellness"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All Wellness Topics
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&h=630&q=75";
  const mainImageUrl = initialMainImageUrl || getProxiedImageUrl(topic.image) || fallbackImage;

  const authorDisplayName = getAuthorDisplayName(topic);
  const authorSlug = getAuthorSlug(topic);
  const reviewerDisplayName = topic.reviewer?.name || topic.reviewer_name;
  const reviewerSlug = getReviewerSlug(topic);

  const publishedDate = topic.first_published_at || topic.created_at || topic.published_date;
  const updatedDate = topic.last_published_at || topic.updated_at;

  // Critical CSS for LCP
  const criticalCSS = `
    .hero-container {
      content-visibility: auto;
      contain-intrinsic-size: 400px;
    }
    .above-fold {
      content-visibility: auto;
    }
  `;

  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        <link 
          rel="preload" 
          as="image" 
          href={getProxiedImageUrl(mainImageUrl)} 
          fetchPriority="high"
        />
        
        <link rel="preconnect" href="https://images.unsplash.com" />
        {mainImageUrl.includes('161.118.167.107') && (
          <link rel="preconnect" href="http://161.118.167.107" />
        )}
      </Head>

      <SEO
        title={`${topic.title} - Wellness - Niinfomed`}
        description={topic.summary?.substring(0, 160) || topic.title}
        image={getProxiedImageUrl(mainImageUrl)}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: publishedDate,
            modifiedTime: updatedDate,
            authors: authorDisplayName ? [authorDisplayName] : [],
            tags: ['wellness', 'health', 'lifestyle', topic.category?.name].filter(Boolean),
          },
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 above-fold">
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/wellness" className="hover:text-gray-800 transition-colors">
            Wellness
          </Link>
          {topic.category?.name && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">
                {topic.category.name}
              </span>
            </>
          )}
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            {/* Main Content */}
            <article className="above-fold">
              {/* Hero Image - Using ImageWithFallback */}
              {topic.image && (
                <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-6 hero-container">
                  <ImageWithFallback
                    src={mainImageUrl}
                    alt={topic.title}
                    className="w-full h-full object-cover"
                    width={1200}
                    height={630}
                    priority={true}
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                {topic.title}
              </h1>

              {/* Subtitle */}
              {topic.subtitle && (
                <p className="text-xl text-gray-600 mb-4">
                  {topic.subtitle}
                </p>
              )}

              {/* Content Metadata */}
              <ContentMetadata 
                category={topic.category}
                difficultyLevel={topic.difficulty_level}
                readingTime={topic.reading_time}
                publishedDate={publishedDate}
                updatedDate={updatedDate}
              />

              {/* Author / Reviewer */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                {authorDisplayName && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Author:</span>
                    {authorSlug ? (
                      <Link
                        href={`/authors/${authorSlug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {authorDisplayName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-gray-700">
                        {authorDisplayName}
                      </span>
                    )}
                  </div>
                )}

                {reviewerDisplayName && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Reviewed by:</span>
                    {reviewerSlug ? (
                      <Link
                        href={`/reviewers/${reviewerSlug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {reviewerDisplayName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-gray-700">
                        {reviewerDisplayName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Detailed Date Display */}
              <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  Article Timeline
                </h3>
                <DateDisplay 
                  publishedDate={publishedDate}
                  updatedDate={updatedDate}
                />
              </div>

              {/* Summary */}
              {topic.summary && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>
              )}

              {/* Table of Contents */}
              {contentLoaded && processedBody && (
                <TableOfContents content={processedBody} />
              )}

              {/* Body Content */}
              {contentLoaded && processedBody && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">About {topic.title}</h2>

                  <div
                    className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:h-auto"
                    dangerouslySetInnerHTML={{
                      __html: processedBody,
                    }}
                  />
                </div>
              )}

              {/* Additional Content Sections */}
              {contentLoaded && processedBenefits && (
                <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 text-green-800">Benefits</h3>
                  <div
                    className="prose prose-green max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: processedBenefits,
                    }}
                  />
                </div>
              )}

              {contentLoaded && processedTips && (
                <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 text-yellow-800">Tips & Recommendations</h3>
                  <div
                    className="prose prose-yellow max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: processedTips,
                    }}
                  />
                </div>
              )}

              {/* References Section */}
              {contentLoaded && processedReferences && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold mb-4">References</h3>
                  <div className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-2xl">
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{
                        __html: processedReferences,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Comments - Load last */}
              {contentLoaded && (
                <CommentSection
                  contentType="wellness"
                  contentSlug={topic.slug}
                  pageTitle={topic.title}
                />
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Article Info Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                  <h3 className="text-lg font-bold mb-4">Article Info</h3>
                  
                  <div className="space-y-4">
                    {/* Dates */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Dates</h4>
                      <DateDisplay 
                        publishedDate={publishedDate}
                        updatedDate={updatedDate}
                        compact={true}
                      />
                    </div>
                    
                    {/* Stats */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Content Info</h4>
                      {topic.difficulty_level && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Difficulty:</span>
                          <span className="font-medium">{topic.difficulty_level}</span>
                        </div>
                      )}
                      {topic.reading_time && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reading Time:</span>
                          <span className="font-medium">{topic.reading_time} minutes</span>
                        </div>
                      )}
                      {topic.category && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{topic.category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {relatedTopics?.length > 0 && contentLoaded && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                    <h3 className="text-lg font-bold mb-4">Related Topics</h3>
                    <div className="space-y-4">
                      {relatedTopics.slice(0, 3).map((item) => (
                        <Link
                          key={item.id}
                          href={`/wellness/${item.slug}`}
                          className="block group"
                          prefetch={false}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                width={80}
                                height={64}
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {item.summary?.substring(0, 80) || "Learn more about wellness"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Mobile Related Topics */}
          {relatedTopics?.length > 0 && contentLoaded && (
            <div className="mt-12 lg:hidden">
              <h2 className="text-2xl font-bold mb-6">Related Wellness Topics</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTopics.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/wellness/${item.slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    prefetch={false}
                  >
                    <div className="h-48 w-full overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={240}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ✅ STATIC GENERATION WITH MULTIPLE ENDPOINTS
========================================================= */

export async function getStaticPaths() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";
    
    const endpoints = [
      `${baseUrl}/api/wellness/topics/`,
      `${baseUrl}/api/wellness/topics`,
      `${baseUrl}/api/wellness/`,
      `${baseUrl}/api/v2/pages/?type=wellness.WellnessPage&fields=slug`,
    ];

    console.log("🔍 Fetching wellness paths from Oracle CMS...");
    
    let paths = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, { 
          timeout: 10000,
          params: { limit: 100 }
        });
        
        const data = response.data;
        
        let topics = [];
        if (Array.isArray(data)) {
          topics = data;
        } else if (data.results) {
          topics = data.results;
        } else if (data.items) {
          topics = data.items;
        }
        
        if (topics.length > 0) {
          paths = topics
            .filter(t => t?.slug)
            .map((t) => ({
              params: { slug: t.slug },
            }));
          break;
        }
      } catch (err) {
        console.log(`❌ Endpoint failed: ${endpoint}`);
      }
    }

    console.log(`✅ Generated ${paths.length} wellness paths`);
    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error fetching wellness paths:", error.message);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const start = Date.now();
    const baseUrl = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";
    const slug = params.slug;
    
    console.log(`📡 Fetching wellness topic: ${slug} from Oracle CMS`);

    // Try multiple endpoints for topic detail
    const detailEndpoints = [
      `${baseUrl}/api/wellness/topics/${slug}/`,
      `${baseUrl}/api/wellness/topics/${slug}`,
      `${baseUrl}/api/wellness/${slug}/`,
      `${baseUrl}/api/wellness/${slug}`,
      `${baseUrl}/api/wellness/detail/${slug}/`,
      `${baseUrl}/api/v2/pages/?slug=${slug}&type=wellness.WellnessPage`,
    ];

    let topic = null;
    
    for (const endpoint of detailEndpoints) {
      try {
        const response = await axios.get(endpoint, { 
          timeout: 10000,
          params: { lang: "en" }
        });
        
        if (response.data) {
          if (response.data.items && response.data.items.length > 0) {
            topic = response.data.items[0];
          } else if (response.data.results && response.data.results.length > 0) {
            topic = response.data.results[0];
          } else {
            topic = response.data;
          }
          
          if (topic) {
            console.log(`✅ Found topic at: ${endpoint}`);
            break;
          }
        }
      } catch (err) {
        console.log(`❌ Failed: ${endpoint}`);
      }
    }

    if (!topic) {
      console.log(`❌ Wellness topic not found: ${slug}`);
      return {
        notFound: true,
        revalidate: 60,
      };
    }

    // Try multiple endpoints for related topics
    let relatedTopics = [];
    
    const relatedEndpoints = [
      `${baseUrl}/api/wellness/topics/`,
      `${baseUrl}/api/wellness/topics`,
      `${baseUrl}/api/wellness/`,
      `${baseUrl}/api/v2/pages/?type=wellness.WellnessPage`,
    ];
    
    for (const endpoint of relatedEndpoints) {
      try {
        const response = await axios.get(endpoint, { 
          params: { limit: 6, lang: "en" },
          timeout: 10000,
        });
        
        const data = response.data;
        
        let topics = [];
        if (Array.isArray(data)) {
          topics = data;
        } else if (data.results) {
          topics = data.results;
        } else if (data.items) {
          topics = data.items;
        }
        
        if (topics.length > 0) {
          relatedTopics = topics.filter((t) => t.slug !== slug);
          break;
        }
      } catch (err) {
        console.log(`❌ Related endpoint failed: ${endpoint}`);
      }
    }

    // Process content on server-side for better performance
    let processedBody = "";
    let processedReferences = "";
    let processedBenefits = "";
    let processedTips = "";
    
    if (topic.body) {
      processedBody = fixContentUrls(topic.body || "");
    }
    
    if (topic.references) {
      processedReferences = fixContentUrls(topic.references || "");
    }
    
    if (topic.benefits) {
      processedBenefits = fixContentUrls(topic.benefits || "");
    }
    
    if (topic.tips) {
      processedTips = fixContentUrls(topic.tips || "");
    }
    
    // Optimize main image URL
    const mainImageUrl = topic.image || null;
    
    console.log(`✅ Generated wellness article ${slug} in ${Date.now() - start}ms`);
    
    return {
      props: {
        topic,
        relatedTopics: relatedTopics.slice(0, 3),
        processedBody,
        processedReferences,
        processedBenefits,
        processedTips,
        mainImageUrl
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching wellness topic:", error.message);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
}
