import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fetchDrugDetails } from '../../utils/api';
import { NextSeo } from 'next-seo';
import {
  DrugStructuredData,
  BreadcrumbStructuredData,
  MedicalWebPageStructuredData,
} from '../../components/StructuredData';
import CommentSection from '../../components/CommentSection';
import ReferencesSection from '../../components/ReferencesSection';

/* =========================================================
   ✅ FIX: Network Error - Mobile cannot fetch 0.0.0.0 / localhost / 127.0.0.1
========================================================= */
const getSafeApiUrl = () => {
  // Default API URL from environment or localhost
  let base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

  // Only adjust for client-side rendering
  if (typeof window !== "undefined") {
    const frontendHost = window.location.hostname;
    const frontendProtocol = window.location.protocol;
    
    console.log("🌐 Frontend location:", { 
      hostname: frontendHost, 
      protocol: frontendProtocol,
      port: window.location.port 
    });

    // For external access (mobile, tablet, other devices)
    if (frontendHost !== "localhost" && 
        frontendHost !== "127.0.0.1" && 
        frontendHost !== "0.0.0.0") {
      
      // If API is on same domain but different port (for development)
      // Use the same protocol and hostname as frontend
      const newBase = `${frontendProtocol}//${frontendHost}:8001`;
      
      console.log("🔄 Adjusting API URL for external access:", { 
        from: base, 
        to: newBase 
      });
      base = newBase;
    } else {
      // For local development, replace problematic addresses
      base = base
        .replace("0.0.0.0", frontendHost)
        .replace("127.0.0.1", frontendHost)
        .replace("localhost", frontendHost);
    }
  }

  console.log("✅ Safe API URL:", base);
  return base;
};

/* =========================================================
   ENHANCED: Media URL Fix Functions - Optimized version
========================================================= */
const getProxiedImageUrl = (url) => {
  if (!url) return null;

  // Create a map of replacements for cleaner code
  const replacements = {
    'http://0.0.0.0:8001': '/cms-media',
    'http://127.0.0.1:8001': '/cms-media',
    'http://localhost:8001': '/cms-media',
    '/media/': '/cms-media/'
  };

  let newUrl = url;
  
  // Apply replacements
  Object.entries(replacements).forEach(([pattern, replacement]) => {
    if (newUrl.includes(pattern)) {
      newUrl = newUrl.replace(pattern, replacement);
    }
  });

  // Clean up any double cms-media paths
  newUrl = newUrl.replace(/\/cms-media\/media\//g, '/cms-media/');
  
  return newUrl;
};

const fixMediaUrls = (html) => {
  if (!html) return '';

  // Use a single replace with multiple patterns for better performance
  const patterns = [
    [/(src="|src=')http:\/\/0\.0\.0\.0:8001\/media\//g, '$1/cms-media/'],
    [/(src="|src=')http:\/\/127\.0\.0\.1:8001\/media\//g, '$1/cms-media/'],
    [/(src="|src=')http:\/\/localhost:8001\/media\//g, '$1/cms-media/'],
    [/(src="|src=')\/media\//g, '$1/cms-media/'],
    [/(srcset="|srcset=')\/media\//g, '$1/cms-media/']
  ];

  let fixedHtml = html;
  patterns.forEach(([pattern, replacement]) => {
    fixedHtml = fixedHtml.replace(pattern, replacement);
  });

  return fixedHtml.replace(/\/cms-media\/media\//g, '/cms-media/');
};

/* =========================================================
   ENHANCED: Wagtail URL Transformation Functions
========================================================= */

/**
 * TRANSFORM WAGTAIL URL TO NEXT.JS ROUTE - ULTIMATE VERSION
 * Handles: http://localhost:5000/all-homeopathic-pages/9-worst-habits-for-muscles
 * Result: /homeopathy/9-worst-habits-for-muscles
 */
const transformWagtailUrlToNextRoute = (wagtailUrl = "") => {
  if (!wagtailUrl || wagtailUrl === "#") return "#";
  
  console.log("🔄 Transforming Wagtail URL:", wagtailUrl);
  
  // Remove domain and protocol to get just the path
  let path = wagtailUrl;
  
  // Remove http://localhost:5000/ or similar domains
  path = path.replace(/https?:\/\/[^\/]+\//, '/');
  
  // Ensure it starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  console.log("📝 Path after removing domain:", path);
  
  // SPECIAL CASE MAPPING - Direct transformations for known patterns
  const directMappings = {
    // Drug-specific patterns
    '/all-drugs-a-z-pages/all-drugs-pages/drugs/': '/drugs/',
    '/all-drugs-pages/drugs/': '/drugs/',
    '/all-drugs-a-z-pages/': '/drugs/',
    '/all-drugs/': '/drugs/',
    
    // Other content types
    '/all-homeopathic-pages/': '/homeopathy/',
    '/all-homeopathy/': '/homeopathy/',
    '/all-ayurvedic-pages/': '/ayurveda/',
    '/all-ayurveda/': '/ayurveda/',
    '/all-news-pages/': '/news/',
    '/all-news/': '/news/',
    '/all-wellness-pages/': '/wellness/',
    '/all-wellness/': '/wellness/',
    '/all-conditions-a-z/conditions/condition/': '/conditions/',
    '/all-conditions-a-z/': '/conditions/',
    '/all-conditions/': '/conditions/',
    '/all-yoga-pages/': '/yoga-exercise/',
    '/all-yoga/': '/yoga-exercise/',
    '/all-article-pages/': '/articles/',
    '/all-articles/': '/articles/',
  };
  
  // Check for exact matches first
  for (const [wagtailPattern, nextRoute] of Object.entries(directMappings)) {
    if (path === wagtailPattern) {
      console.log(`✅ Exact match: ${path} → ${nextRoute}`);
      return nextRoute;
    }
  }
  
  // Check for pattern matches
  for (const [wagtailPattern, nextRoute] of Object.entries(directMappings)) {
    if (path.startsWith(wagtailPattern)) {
      // Extract the slug part after the pattern
      const slug = path.replace(wagtailPattern, '');
      if (slug) {
        const finalRoute = nextRoute.endsWith('/') 
          ? `${nextRoute}${slug}`
          : `${nextRoute}/${slug}`;
        console.log(`✅ Pattern match: ${path} → ${finalRoute}`);
        return finalRoute;
      }
    }
  }
  
  // DYNAMIC TRANSFORMATION - Handle any "all-*" pattern
  if (path.includes('/all-')) {
    const parts = path.split('/').filter(p => p);
    
    // Find the "all-*" part
    const allIndex = parts.findIndex(p => p.startsWith('all-'));
    
    if (allIndex !== -1) {
      const allPart = parts[allIndex];
      
      // Map "all-*" to category
      const categoryMap = {
        'all-homeopathic-pages': 'homeopathy',
        'all-homeopathy': 'homeopathy',
        'all-ayurvedic-pages': 'ayurveda',
        'all-ayurveda': 'ayurveda',
        'all-news-pages': 'news',
        'all-news': 'news',
        'all-wellness-pages': 'wellness',
        'all-wellness': 'wellness',
        'all-conditions-a-z': 'conditions',
        'all-conditions': 'conditions',
        'all-drugs-a-z-pages': 'drugs',
        'all-drugs-pages': 'drugs',
        'all-drugs': 'drugs',
        'all-yoga-pages': 'yoga-exercise',
        'all-yoga': 'yoga-exercise',
        'all-article-pages': 'articles',
        'all-articles': 'articles'
      };
      
      const category = categoryMap[allPart];
      
      if (category) {
        // Get the last part as slug
        const slug = parts[parts.length - 1];
        
        // Skip if slug is the same as category or empty
        if (slug && slug !== category && !slug.startsWith('all-')) {
          const finalRoute = `/${category}/${slug}`;
          console.log(`✅ Dynamic transformation: ${path} → ${finalRoute}`);
          return finalRoute;
        }
      }
    }
  }
  
  // If it's already a clean route, return it
  if (path.startsWith('/homeopathy/') || 
      path.startsWith('/ayurveda/') || 
      path.startsWith('/news/') || 
      path.startsWith('/wellness/') || 
      path.startsWith('/conditions/') || 
      path.startsWith('/drugs/') || 
      path.startsWith('/articles/') || 
      path.startsWith('/yoga-exercise/')) {
    console.log(`✅ Already clean route: ${path}`);
    return path;
  }
  
  console.warn(`⚠️ Could not transform URL: ${wagtailUrl}`);
  return "#";
};

/**
 * Extract internal page link IDs from HTML
 */
const extractInternalPageLinkIds = (html = "") => {
  if (!html) return [];

  const matches = [
    ...html.matchAll(
      /<a[^>]*(?:linktype="page"[^>]*id="(\d+)"|id="(\d+)"[^>]*linktype="page")[^>]*>/g
    ),
  ];

  return matches.map(m => Number(m[1] || m[2]));
};

/**
 * Extract ALL href URLs from HTML (including those without linktype)
 */
const extractAllHrefUrls = (html = "") => {
  if (!html) return [];
  
  const matches = [...html.matchAll(/href="([^"]*)"/g)];
  return matches.map(m => m[1]);
};

/**
 * Fetch Wagtail page by ID - With error handling
 */
const fetchWagtailPageById = async (id, apiBaseUrl) => {
  try {
    console.log(`🔍 Fetching Wagtail page for ID: ${id} from ${apiBaseUrl}`);
    
    // Use the safe API URL for client-side requests
    const safeUrl = apiBaseUrl || getSafeApiUrl();
    const url = `${safeUrl}/api/v2/pages/${id}/`;
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.warn(`⚠️ Page fetch failed for ID ${id}: ${res.status}`);
      return null;
    }
    
    return await res.json();
  } catch (err) {
    console.error("Error fetching Wagtail page:", err);
    return null;
  }
};

/**
 * Build frontend URL from Wagtail page data
 */
const buildFrontendUrlFromWagtailPage = (pageData) => {
  if (!pageData) return "#";

  const type = (pageData?.meta?.type || "").toLowerCase();
  const slug = pageData?.meta?.slug || pageData?.slug;
  const title = pageData?.title || "";

  console.log("📄 Building URL from:", { type, slug, title: title.substring(0, 50) });

  if (!slug) {
    console.warn("❌ No slug found in page data");
    return "#";
  }

  // Check if slug is a full URL
  if (slug.includes('http://') || slug.includes('https://') || slug.includes('localhost')) {
    // Transform the full URL
    const transformed = transformWagtailUrlToNextRoute(slug);
    console.log(`✅ Transformed full URL: ${slug} → ${transformed}`);
    return transformed;
  }

  // Check if slug contains "all-" patterns
  if (slug.includes('all-')) {
    const transformed = transformWagtailUrlToNextRoute(`/${slug}`);
    if (transformed !== "#") {
      console.log(`✅ Transformed slug pattern: ${slug} → ${transformed}`);
      return transformed;
    }
  }

  // Fallback to type-based mapping
  let category = "";
  if (type.includes("homeopathy") || type.includes("homeopathic")) {
    category = "homeopathy";
  } else if (type.includes("ayurveda") || type.includes("ayurvedic")) {
    category = "ayurveda";
  } else if (type.includes("article")) {
    category = "articles";
  } else if (type.includes("news")) {
    category = "news";
  } else if (type.includes("condition")) {
    category = "conditions";
  } else if (type.includes("drug")) {
    category = "drugs";
  } else if (type.includes("wellness")) {
    category = "wellness";
  } else if (type.includes("yoga") || type.includes("exercise")) {
    category = "yoga-exercise";
  }

  // Extract just the last part of slug as the actual content slug
  const slugParts = slug.split('/').filter(p => p);
  const contentSlug = slugParts[slugParts.length - 1] || "";

  if (category && contentSlug) {
    const route = `/${category}/${contentSlug}`;
    console.log(`🎯 Built route from type: ${route}`);
    return route;
  }

  console.warn(`❌ Could not build route for:`, { type, slug });
  return "#";
};

/**
 * ULTIMATE FIX FOR WAGTAIL INTERNAL LINKS
 * This handles both linktype="page" links AND raw href URLs
 */
const fixWagtailInternalLinks = async (html = "", apiBaseUrl = "") => {
  if (!html) return html;

  console.log("🛠️ Starting comprehensive Wagtail link fix...");
  
  let updatedHtml = html;

  try {
    // PHASE 1: Fix links with linktype="page"
    const pageIds = extractInternalPageLinkIds(updatedHtml);
    
    if (pageIds.length > 0) {
      console.log(`🔗 Found ${pageIds.length} page link IDs:`, [...new Set(pageIds)]);
      
      // Create a map to store page data
      const pageMap = new Map();

      // Fetch all pages in parallel with error handling
      const fetchPromises = pageIds.map(async (id) => {
        try {
          const pageData = await fetchWagtailPageById(id, apiBaseUrl);
          if (pageData) {
            pageMap.set(id, pageData);
          }
        } catch (error) {
          console.warn(`Failed to fetch page ${id}:`, error);
        }
      });

      await Promise.all(fetchPromises);

      // Replace all page links
      pageIds.forEach((id) => {
        const pageData = pageMap.get(id);
        const frontendUrl = pageData ? buildFrontendUrlFromWagtailPage(pageData) : "#";

        // Create a regex to find the specific anchor tag with this ID
        const regex = new RegExp(
          `(<a[^>]*(?:linktype="page"[^>]*id="${id}"|id="${id}"[^>]*linktype="page")[^>]*?)>`,
          "g"
        );

        updatedHtml = updatedHtml.replace(regex, `$1 href="${frontendUrl}">`);
      });
      
      console.log("✅ Phase 1: Fixed linktype='page' links");
    }

    // PHASE 2: Fix document links
    const safeUrl = apiBaseUrl || getSafeApiUrl();
    updatedHtml = updatedHtml.replace(
      /<a([^>]*?)linktype="document"([^>]*?)id="(\d+)"([^>]*?)>/g,
      `<a$1href="${safeUrl}/documents/$3/" target="_blank" rel="noopener noreferrer"$4>`
    );

    // PHASE 3: Fix ALL href attributes that contain wagtail patterns
    console.log("🔍 Scanning for raw wagtail URLs in href attributes...");
    
    // Get all href values
    const allHrefs = extractAllHrefUrls(updatedHtml);
    
    // Filter for wagtail patterns
    const wagtailHrefs = allHrefs.filter(href => 
      href.includes('all-') || 
      href.includes('localhost') || 
      href.includes('127.0.0.1') ||
      href.includes('0.0.0.0')
    );
    
    if (wagtailHrefs.length > 0) {
      console.log(`🔄 Found ${wagtailHrefs.length} raw wagtail URLs to transform:`, wagtailHrefs);
      
      // Transform each wagtail URL
      wagtailHrefs.forEach(wagtailUrl => {
        const transformedUrl = transformWagtailUrlToNextRoute(wagtailUrl);
        
        if (transformedUrl !== "#" && transformedUrl !== wagtailUrl) {
          console.log(`🔄 Replacing: ${wagtailUrl} → ${transformedUrl}`);
          
          // Escape special regex characters in the URL
          const escapedUrl = wagtailUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`href="${escapedUrl}"`, 'g');
          
          updatedHtml = updatedHtml.replace(regex, `href="${transformedUrl}"`);
        }
      });
      
      console.log("✅ Phase 3: Transformed raw wagtail URLs");
    }

    // PHASE 4: Fix specific known patterns with regex
    console.log("🔍 Applying pattern-based transformations...");
    
    const patternReplacements = [
      // Homeopathy
      { pattern: /href="[^"]*\/all-homeopathic-pages\/([^"]+)"/g, replacement: 'href="/homeopathy/$1"' },
      { pattern: /href="[^"]*\/all-homeopathy\/([^"]+)"/g, replacement: 'href="/homeopathy/$1"' },
      
      // Ayurveda
      { pattern: /href="[^"]*\/all-ayurvedic-pages\/([^"]+)"/g, replacement: 'href="/ayurveda/$1"' },
      { pattern: /href="[^"]*\/all-ayurveda\/([^"]+)"/g, replacement: 'href="/ayurveda/$1"' },
      
      // News
      { pattern: /href="[^"]*\/all-news-pages\/([^"]+)"/g, replacement: 'href="/news/$1"' },
      { pattern: /href="[^"]*\/all-news\/([^"]+)"/g, replacement: 'href="/news/$1"' },
      
      // Wellness
      { pattern: /href="[^"]*\/all-wellness-pages\/([^"]+)"/g, replacement: 'href="/wellness/$1"' },
      { pattern: /href="[^"]*\/all-wellness\/([^"]+)"/g, replacement: 'href="/wellness/$1"' },
      
      // Conditions
      { pattern: /href="[^"]*\/all-conditions-a-z\/conditions\/condition\/([^"]+)"/g, replacement: 'href="/conditions/$1"' },
      { pattern: /href="[^"]*\/all-conditions\/([^"]+)"/g, replacement: 'href="/conditions/$1"' },
      
      // Drugs - Added multiple patterns
      { pattern: /href="[^"]*\/all-drugs-a-z-pages\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="[^"]*\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="[^"]*\/all-drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      
      // Yoga
      { pattern: /href="[^"]*\/all-yoga-pages\/([^"]+)"/g, replacement: 'href="/yoga-exercise/$1"' },
      { pattern: /href="[^"]*\/all-yoga\/([^"]+)"/g, replacement: 'href="/yoga-exercise/$1"' },
      
      // Articles
      { pattern: /href="[^"]*\/all-article-pages\/([^"]+)"/g, replacement: 'href="/articles/$1"' },
      { pattern: /href="[^"]*\/all-articles\/([^"]+)"/g, replacement: 'href="/articles/$1"' },
      
      // Localhost patterns for drugs
      { pattern: /href="http:\/\/localhost:[0-9]+\/all-drugs-a-z-pages\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="http:\/\/localhost:[0-9]+\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="http:\/\/localhost:[0-9]+\/all-drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      
      // Other localhost patterns
      { pattern: /href="http:\/\/localhost:[0-9]+\/all-homeopathic-pages\/([^"]+)"/g, replacement: 'href="/homeopathy/$1"' },
      { pattern: /href="http:\/\/localhost:[0-9]+\/all-news\/([^"]+)"/g, replacement: 'href="/news/$1"' },
      { pattern: /href="http:\/\/localhost:[0-9]+\/all-ayurvedic-pages\/([^"]+)"/g, replacement: 'href="/ayurveda/$1"' },
      { pattern: /href="http:\/\/localhost:[0-9]+\/all-wellness-pages\/([^"]+)"/g, replacement: 'href="/wellness/$1"' },
      { pattern: /href="http:\/\/localhost:[0-9]+\/all-conditions-a-z\/conditions\/condition\/([^"]+)"/g, replacement: 'href="/conditions/$1"' },
    ];
    
    patternReplacements.forEach(({ pattern, replacement }) => {
      const matches = updatedHtml.match(pattern);
      if (matches) {
        console.log(`🔄 Applying pattern: ${pattern} (${matches.length} matches)`);
        updatedHtml = updatedHtml.replace(pattern, replacement);
      }
    });
    
    console.log("✅ Phase 4: Applied pattern-based transformations");

    // PHASE 5: Clean up leftover Wagtail attributes
    updatedHtml = updatedHtml.replace(/linktype="[^"]*"/g, '');
    updatedHtml = updatedHtml.replace(/\s?parent-id="\d+"/g, '');
    updatedHtml = updatedHtml.replace(/\s?id="\d+"/g, '');
    
    // PHASE 6: Make external links open in new tab
    updatedHtml = updatedHtml.replace(
      /<a([^>]*?)href="(https?:\/\/[^"]+)"([^>]*?)>/g,
      `<a$1href="$2"$3 target="_blank" rel="noopener noreferrer">`
    );
    
    // PHASE 7: Add click-friendly styles to all internal links
    updatedHtml = updatedHtml.replace(
      /<a([^>]*?)href="([^"]+)"([^>]*?)>/g,
      (match, before, href, after) => {
        // Skip external links (already handled)
        if (href.startsWith('http')) return match;
        
        // Don't add to anchor links
        if (href.startsWith('#')) return match;
        
        // Add enhanced styles for internal navigation links
        const enhancedStyles = ' style="position: relative; z-index: 10; pointer-events: auto; cursor: pointer; text-decoration: underline;"';
        
        if (match.includes('style="')) {
          return match.replace('style="', 'style="position: relative; z-index: 10; pointer-events: auto; cursor: pointer; text-decoration: underline; ');
        }
        
        return `<a${before}href="${href}"${enhancedStyles}${after}>`;
      }
    );

    console.log("✅ All phases completed successfully!");
    
    return updatedHtml;
  } catch (error) {
    console.error("❌ Error in fixWagtailInternalLinks:", error);
    return html;
  }
};

/* =========================================================
   ENHANCED: Date Functions with better error handling
========================================================= */

/**
 * Create fallback dates when CMS doesn't provide them
 */
const createFallbackDates = () => {
  const now = new Date();
  
  // Use setFullYear, setMonth, setDate for better date manipulation
  const publishedDate = new Date(now);
  publishedDate.setDate(now.getDate() - 60);

  const updatedDate = new Date(now);
  updatedDate.setDate(now.getDate() - 30);

  const lastReviewedDate = new Date(now);
  lastReviewedDate.setDate(now.getDate() - 45);

  return {
    published: publishedDate,
    updated: updatedDate,
    lastReviewed: lastReviewedDate,
    isFallback: true
  };
};

/**
 * Safe date parsing with multiple format attempts
 */
const parseDateSafe = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;

  const dateFormats = [
    dateString, // Try as-is
    dateString.replace(' ', 'T') + 'Z', // Try ISO format
    dateString.split('T')[0], // Just date part
  ];

  for (const format of dateFormats) {
    const date = new Date(format);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

/**
 * Extract dates from drug with intelligent fallbacks
 */
const extractDatesFromDrug = (drug) => {
  if (!drug) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true
    };
  }

  const dateFieldGroups = {
    published: [
      'first_published_at', 'first_published_date', 'published_date',
      'publish_date', 'published_at', 'publication_date', 'created_at',
      'created_date', 'date_published', 'date', 'approval_date'
    ],
    updated: [
      'last_published_at', 'last_published_date', 'updated_at',
      'updated_date', 'modified_at', 'modified_date', 'last_updated',
      'last_modified', 'update_date', 'last_revised'
    ],
    reviewed: [
      'last_reviewed', 'last_reviewed_date', 'reviewed_at',
      'review_date', 'medical_review_date', 'last_medical_review'
    ]
  };

  // Find dates using field groups
  const findDateFromFields = (fields) => {
    for (const field of fields) {
      if (drug[field]) {
        const date = parseDateSafe(drug[field]);
        if (date) return date;
      }
    }
    return null;
  };

  const publishedDate = findDateFromFields(dateFieldGroups.published);
  const updatedDate = findDateFromFields(dateFieldGroups.updated);
  const lastReviewedDate = findDateFromFields(dateFieldGroups.reviewed);

  // If no dates at all, use fallback
  if (!publishedDate && !updatedDate && !lastReviewedDate) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true
    };
  }

  // Set intelligent defaults
  const finalPublishedDate = publishedDate || updatedDate || lastReviewedDate;
  const finalUpdatedDate = updatedDate || publishedDate || lastReviewedDate;
  const finalReviewedDate = lastReviewedDate || updatedDate || publishedDate;

  return {
    publishedDate: finalPublishedDate,
    updatedDate: finalUpdatedDate,
    lastReviewedDate: finalReviewedDate,
    isFallback: false
  };
};

/**
 * Format date for display with timezone consideration
 */
const formatDateDisplay = (date, includeTime = false) => {
  if (!date) return "Date not available";

  try {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
      ...(includeTime && { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };

    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return "Date error";
  }
};

/**
 * Get human-readable time ago string
 */
const getTimeAgo = (date) => {
  if (!date) return "";

  try {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 0) return "in the future";
    if (seconds < 60) return "just now";

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }

    return `${seconds} seconds ago`;
  } catch (error) {
    console.warn('Time ago calculation error:', error);
    return "";
  }
};

/**
 * Check if drug info was significantly updated
 */
const isDrugUpdated = (publishedDate, updatedDate) => {
  if (!publishedDate || !updatedDate) return false;

  try {
    // Check if dates are different (not just the same date)
    if (publishedDate.getTime() === updatedDate.getTime()) return false;
    
    const diffTime = Math.abs(updatedDate - publishedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Consider updated if > 7 days difference (more sensitive)
    return diffDays > 7;
  } catch (error) {
    console.warn('Date comparison error:', error);
    return false;
  }
};

/* =========================================================
   Enhanced DateDisplay Component with better accessibility
========================================================= */

const DateDisplay = ({
  publishedDate,
  updatedDate,
  lastReviewedDate,
  isFallback = false,
  compact = false,
  className = ""
}) => {
  const isUpdated = isDrugUpdated(publishedDate, updatedDate);

  if (compact) {
    return (
      <div 
        className={`flex flex-wrap items-center gap-2 text-sm text-gray-600 ${className}`}
        aria-label="Publication dates"
      >
        <svg 
          className="w-4 h-4 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>

        <span className="font-medium">Published:</span>
        <time 
          dateTime={publishedDate?.toISOString() || ''}
          className="whitespace-nowrap"
        >
          {formatDateDisplay(publishedDate)}
        </time>

        {isUpdated && (
          <span 
            className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200"
            aria-label="This information has been updated"
          >
            Updated
          </span>
        )}

        {isFallback && (
          <span 
            className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
            aria-label="Estimated dates based on typical publication timelines"
          >
            Estimated
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Drug information timeline">
      {/* Main Date Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Published Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Publication information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Information Published</h4>
              <p className="text-xs text-gray-500">When this drug info was first published</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={publishedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(publishedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(publishedDate)}
            </span>
          </div>
        </div>

        {/* Updated Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Update information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className={`w-10 h-10 rounded-full ${isUpdated ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}
              aria-hidden="true"
            >
              <svg 
                className={`w-5 h-5 ${isUpdated ? 'text-green-600' : 'text-gray-600'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {isUpdated ? 'Updated' : 'Last Updated'}
              </h4>
              <p className="text-xs text-gray-500">
                {isUpdated ? 'Most recent update' : 'Last modification'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={updatedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(updatedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(updatedDate)}
            </span>
          </div>

          {isUpdated && (
            <div className="mt-3 text-center">
              <span 
                className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                aria-label="Recently updated content"
              >
                Recently Updated
              </span>
            </div>
          )}
        </div>

        {/* Reviewed Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Medical review information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Medically Reviewed</h4>
              <p className="text-xs text-gray-500">Last medical review date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={lastReviewedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(lastReviewedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(lastReviewedDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Fallback Notice */}
      {isFallback && (
        <div 
          className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
          role="alert"
          aria-label="Estimated dates notice"
        >
          <div className="flex items-start gap-3">
            <svg 
              className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-yellow-800 mb-1">Estimated Dates</h5>
              <p className="text-sm text-yellow-700">
                This drug information was recently added to our database. The dates shown are estimated
                based on typical publication timelines for drug information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Important Disclaimer */}
      <div 
        className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        role="contentinfo"
        aria-label="Medical disclaimer"
      >
        <div className="flex items-start gap-3">
          <svg 
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h5 className="font-medium text-blue-800 mb-1">Important Medical Disclaimer</h5>
            <p className="text-sm text-blue-700">
              This drug information is for educational purposes only. Always consult your healthcare
              provider or pharmacist before starting, stopping, or changing any medication. Drug
              information changes frequently, and this content may not reflect the most current updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Loading Skeleton Component
========================================================= */
const DrugPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-6xl animate-pulse">
    {/* Breadcrumb skeleton */}
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
    
    {/* Header skeleton */}
    <div className="mb-8">
      <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content skeleton */}
      <div className="lg:col-span-2 space-y-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar skeleton */}
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   MAIN COMPONENT with improved performance
========================================================= */

export default function DrugPage({ drug: initialDrug, error: initialError }) {
  const router = useRouter();
  const { slug } = router.query;

  const [drug, setDrug] = useState(initialDrug || null);
  const [loading, setLoading] = useState(!initialDrug);
  const [error, setError] = useState(initialError || null);
  const [fixedContent, setFixedContent] = useState({
    overview: '',
    uses: '',
    dosage: '',
    sideEffects: '',
    warnings: ''
  });

  // Get safe API URL for client-side fetches
  const safeApiUrl = useMemo(() => getSafeApiUrl(), []);

  // Extract dates from drug - memoized for performance
  const { publishedDate, updatedDate, lastReviewedDate, isFallback } = useMemo(
    () => extractDatesFromDrug(drug),
    [drug]
  );

  // Memoized drug name for better performance
  const drugName = useMemo(() => {
    if (!drug) return 'Drug Information';
    
    const parts = [];
    if (drug.generic_name) parts.push(drug.generic_name);
    if (drug.brand_names) parts.push(`(${drug.brand_names})`);
    
    return parts.length > 0 ? parts.join(' ') : drug.title || 'Unnamed Drug';
  }, [drug]);

  // Memoized SEO data
  const seoData = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://Niinfomed.com';
    
    const description = drug?.overview 
      ? drug.overview.replace(/<[^>]*>/g, '').substring(0, 155) + '...'
      : `Complete information about ${drugName} including uses, dosage, side effects, precautions, and warnings. Consult your healthcare provider for medical advice.`;

    return {
      title: `${drugName} - Comprehensive Drug Information, Dosage, Side Effects | Niinfomed`,
      description,
      canonical: `${baseUrl}/drugs/${slug}`,
      openGraph: {
        url: `${baseUrl}/drugs/${slug}`,
        title: `${drugName} - Drug Information | Niinfomed`,
        description,
        images: drug?.image ? [
          {
            url: getProxiedImageUrl(drug.image),
            width: 1200,
            height: 630,
            alt: drugName,
          },
        ] : [],
        siteName: 'Niinfomed',
        type: 'article',
        article: {
          publishedTime: publishedDate?.toISOString(),
          modifiedTime: updatedDate?.toISOString(),
          authors: drug?.author ? [drug.author.name] : [],
          tags: ['drug', 'medication', 'pharmacy', ...(drug?.drug_class ? [drug.drug_class] : [])],
        },
      }
    };
  }, [drug, drugName, slug, publishedDate, updatedDate]);

  // Fetch drug if not preloaded
  useEffect(() => {
    if (!initialDrug && slug) {
      const loadDrug = async () => {
        setLoading(true);
        try {
          console.log("📡 Fetching drug data from:", `${safeApiUrl}/api/drugs/${slug}/`);
          const response = await fetch(`${safeApiUrl}/api/drugs/${slug}/`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          setDrug(data);
          setError(null);
        } catch (err) {
          console.error('Error fetching drug:', err);
          setError(`Failed to load drug information: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      loadDrug();
    }
  }, [slug, initialDrug, safeApiUrl]);

  // Apply content fixes with link transformation
  useEffect(() => {
    if (!drug) return;

    const fixContent = async () => {
      try {
        const contentSections = {
          overview: drug.overview || '',
          uses: drug.uses || '',
          dosage: drug.dosage || '',
          sideEffects: drug.side_effects || '',
          warnings: drug.warnings || ''
        };

        // Process all sections in parallel with link transformation
        const fixedSections = await Promise.all(
          Object.entries(contentSections).map(async ([key, content]) => {
            const mediaFixed = fixMediaUrls(content);
            const linkFixed = await fixWagtailInternalLinks(mediaFixed, safeApiUrl);
            return [key, linkFixed];
          })
        );

        setFixedContent(Object.fromEntries(fixedSections));
      } catch (error) {
        console.error('Error fixing content:', error);
        // Fallback to media-only fixed content
        const fallbackSections = {
          overview: fixMediaUrls(drug.overview || ''),
          uses: fixMediaUrls(drug.uses || ''),
          dosage: fixMediaUrls(drug.dosage || ''),
          sideEffects: fixMediaUrls(drug.side_effects || ''),
          warnings: fixMediaUrls(drug.warnings || '')
        };
        setFixedContent(fallbackSections);
      }
    };

    fixContent();
  }, [drug, safeApiUrl]);

  // Loading state
  if (loading) {
    return <DrugPageSkeleton />;
  }

  // Error state
  if (error || !drug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <svg 
              className="w-16 h-16 text-red-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              {error ? 'Error Loading Drug Information' : 'Drug Not Found'}
            </h1>
            <p className="text-red-700 mb-6 max-w-md mx-auto">
              {error || 'The drug information you\'re looking for is not available or may have been removed.'}
            </p>
            <Link 
              href="/drugs" 
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse All Drugs & Supplements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO and Structured Data */}
      <NextSeo
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.canonical}
        openGraph={seoData.openGraph}
        additionalMetaTags={[
          {
            name: 'article:published_time',
            content: publishedDate?.toISOString() || '',
          },
          {
            name: 'article:modified_time',
            content: updatedDate?.toISOString() || '',
          },
          {
            name: 'robots',
            content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        ]}
      />

      <BreadcrumbStructuredData items={[
        { name: 'Home', url: '/' },
        { name: 'Drugs & Supplements', url: '/drugs' },
        { name: drugName, url: `/drugs/${drug.slug}` },
      ]} />

      <DrugStructuredData
        name={drug.generic_name || drug.title}
        description={drug.overview?.replace(/<[^>]*>/g, '').substring(0, 300)}
        url={seoData.canonical}
        activeIngredient={drug.generic_name}
        drugClass={drug.drug_class}
        dosageForm={drug.dosage_form}
        manufacturer={drug.manufacturer}
        warning={drug.warnings}
        datePublished={publishedDate?.toISOString()}
        dateModified={updatedDate?.toISOString()}
      />

      <MedicalWebPageStructuredData
        title={drugName}
        description={seoData.description}
        url={seoData.canonical}
        image={getProxiedImageUrl(drug.image)}
        datePublished={publishedDate?.toISOString()}
        dateModified={updatedDate?.toISOString()}
        author={drug.author}
        reviewer={drug.reviewer}
        lastReviewed={lastReviewedDate?.toISOString()}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link 
                  href="/" 
                  className="hover:text-gray-800 transition-colors"
                  aria-label="Go to homepage"
                >
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link 
                  href="/drugs" 
                  className="hover:text-gray-800 transition-colors"
                  aria-label="Browse all drugs and supplements"
                >
                  Drugs & Supplements
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700 font-medium" aria-current="page">
                {drugName}
              </li>
            </ol>
          </nav>

          {/* Main Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-gray-900">
              {drugName}
            </h1>

            {/* Drug Class & Type */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {drug.drug_class && (
                <span 
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                  aria-label={`Drug class: ${drug.drug_class}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  {drug.drug_class}
                </span>
              )}

              {drug.dosage_form && (
                <span 
                  className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium"
                  aria-label={`Dosage form: ${drug.dosage_form}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {drug.dosage_form}
                </span>
              )}

              {/* Compact Date Display */}
              <DateDisplay
                publishedDate={publishedDate}
                updatedDate={updatedDate}
                lastReviewedDate={lastReviewedDate}
                isFallback={isFallback}
                compact={true}
                className="ml-auto"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <main className="lg:col-span-2 space-y-8" id="main-content">
              {/* Author & Reviewer Info */}
              {(drug.author || drug.reviewer) && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {drug.author && (
                      <div className="flex items-start gap-4">
                        {drug.author.image && (
                          <img
                            src={getProxiedImageUrl(drug.author.image)}
                            alt={drug.author.name}
                            className="w-14 h-14 rounded-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Written by</p>
                          <Link
                            href={`/authors/${drug.author.slug || 'staff'}`}
                            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline block"
                            data-testid="link-drug-author"
                          >
                            {drug.author.name}
                          </Link>
                          {drug.author.credentials && (
                            <p className="text-sm text-gray-600">
                              {drug.author.credentials}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {drug.reviewer && (
                      <div className="flex items-start gap-4">
                        {drug.reviewer.image && (
                          <img
                            src={getProxiedImageUrl(drug.reviewer.image)}
                            alt={drug.reviewer.name}
                            className="w-14 h-14 rounded-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Medically Reviewed by</p>
                          <Link
                            href={`/reviewers/${drug.reviewer.slug || 'staff'}`}
                            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline block"
                            data-testid="link-drug-reviewer"
                          >
                            {drug.reviewer.name}
                          </Link>
                          {drug.reviewer.credentials && (
                            <p className="text-sm text-gray-600">
                              {drug.reviewer.credentials}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date Timeline Section */}
              <section className="bg-white rounded-xl shadow-md p-6" aria-label="Information timeline">
                <h2 className="text-xl font-semibold mb-4">Information Timeline</h2>
                <DateDisplay
                  publishedDate={publishedDate}
                  updatedDate={updatedDate}
                  lastReviewedDate={lastReviewedDate}
                  isFallback={isFallback}
                />
              </section>

              {/* Content Sections */}
              {[
                { title: "Overview", content: fixedContent.overview, id: "overview" },
                { title: "Uses & Indications", content: fixedContent.uses, id: "uses" },
                { title: "Dosage & Administration", content: fixedContent.dosage, id: "dosage" },
                { title: "Side Effects & Precautions", content: fixedContent.sideEffects, id: "side-effects" },
              ].map((section) => (
                <section 
                  key={section.id} 
                  id={section.id}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <h2 className="text-2xl font-bold mb-6 border-b pb-3">
                    {section.title}
                  </h2>
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: section.content || 
                        `<p class="text-gray-500 italic">${section.title.toLowerCase()} information for ${drugName} is not available at this time.</p>`
                    }}
                  />
                </section>
              ))}
            </main>

            {/* Sidebar */}
            <aside className="space-y-8" aria-label="Additional information">
              {/* Quick Facts Card */}
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-semibold mb-6 border-b pb-3">Quick Facts</h3>

                <div className="space-y-4">
                  {[
                    { label: "Generic Name", value: drug.generic_name },
                    { label: "Brand Names", value: drug.brand_names },
                    { label: "Drug Class", value: drug.drug_class },
                    { label: "Dosage Form", value: drug.dosage_form },
                    { label: "Manufacturer", value: drug.manufacturer },
                  ].filter(item => item.value).map((item, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-700 mb-1">{item.label}</h4>
                      <p className="text-gray-900">{item.value}</p>
                    </div>
                  ))}

                  {/* Date Summary */}
                  {(publishedDate || updatedDate || lastReviewedDate) && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Information Dates</h4>
                      <div className="space-y-2 text-sm">
                        {[
                          { label: "Published", date: publishedDate },
                          { label: "Updated", date: updatedDate },
                          { label: "Reviewed", date: lastReviewedDate },
                        ].filter(item => item.date).map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{item.label}:</span>
                            <time 
                              dateTime={item.date.toISOString()} 
                              className="font-medium"
                            >
                              {formatDateDisplay(item.date)}
                            </time>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Warnings Card */}
              {drug.warnings && (
                <div 
                  className="bg-red-50 border border-red-200 rounded-xl p-6"
                  role="alert"
                  aria-label="Important warnings"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-red-800">Important Warnings</h3>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-red-700"
                    dangerouslySetInnerHTML={{ __html: fixedContent.warnings }}
                  />
                </div>
              )}

              {/* References Section */}
              {drug.references && drug.references.length > 0 && (
                <ReferencesSection references={drug.references} />
              )}

              {/* Disclaimer Card */}
              <div className="bg-gray-100 border border-gray-300 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Disclaimer</h3>
                <p className="text-sm text-gray-600">
                  This drug information is for educational purposes only and is not medical advice.
                  Always consult with a healthcare professional before using any medication.
                  Do not stop or change any medication without consulting your doctor.
                </p>
              </div>
            </aside>
          </div>

          {/* Comments Section */}
          <CommentSection
            contentType="drug"
            contentSlug={drug.slug}
            pageTitle={drugName}
          />
        </div>
      </div>
    </>
  );
}

/* =========================================================
   STATIC GENERATION with better error handling
========================================================= */

export async function getStaticPaths() {
  // ⚠️ For SSR/SSG use env directly (build time)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
  
  try {
    console.log("📡 Fetching static paths from:", `${apiUrl}/api/drugs/`);
    const response = await fetch(`${apiUrl}/api/drugs/`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Revalidate API calls every hour
    });

    if (!response.ok) {
      console.warn(`Failed to fetch drug paths: ${response.status}`);
      return { paths: [], fallback: 'blocking' };
    }

    const data = await response.json();
    const drugs = Array.isArray(data) ? data : data.results || [];

    // Filter out drugs without slugs
    const paths = drugs
      .filter(drug => drug?.slug && typeof drug.slug === 'string')
      .map((drug) => ({
        params: { slug: drug.slug },
      }));

    console.log(`Generated ${paths.length} static paths for drugs`);
    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching drug paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  if (!params?.slug) {
    return { notFound: true };
  }

  // ⚠️ For SSR/SSG use env directly (build time)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
  
  try {
    console.log(`📡 Fetching drug ${params.slug} from:`, `${apiUrl}/api/drugs/${params.slug}/`);
    const response = await fetch(`${apiUrl}/api/drugs/${params.slug}/`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      console.warn(`Failed to fetch drug ${params.slug}: ${response.status}`);
      return { 
        props: { 
          drug: null, 
          error: `Failed to load drug (${response.status})` 
        } 
      };
    }

    const drug = await response.json();

    if (!drug) {
      return { notFound: true };
    }

    return {
      props: {
        drug,
        error: null,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error(`Error fetching drug ${params.slug}:`, error);
    return { 
      props: { 
        drug: null, 
        error: 'Network error loading drug information' 
      } 
    };
  }
}