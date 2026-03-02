import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { useState, useEffect, useMemo } from 'react';
import ArticleCard from '../../components/ArticleCard';
import ShareButton from '../../components/ShareButton';
import AuthorCard from '../../components/AuthorCard';
import { fetchArticle, fetchArticlePaths, fetchRelatedArticles } from '../../utils/api';
import ContentNav from '../../components/ContentNav';

/* =========================================================
   ✅ UPDATED: Use environment variable for CMS URL
   No more hardcoded localhost/0.0.0.0/127.0.0.1
========================================================= */
const getSafeCMSUrl = () => {
  // Use environment variable with fallback to your Oracle CMS
  let base = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";

  // For client-side, we might need to replace the hostname
  if (typeof window !== "undefined") {
    const frontendHost = window.location.hostname;
    
    // Only replace if the base contains localhost/127.0.0.1
    // This ensures we don't break the Oracle URL
    if (base.includes('localhost') || base.includes('127.0.0.1') || base.includes('0.0.0.0')) {
      base = base
        .replace("0.0.0.0", frontendHost)
        .replace("127.0.0.1", frontendHost)
        .replace("localhost", frontendHost);
    }
  }

  return base;
};

// ⚠️ For SSR/SSG use env directly (build time)
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";

/* =========================================================
   ✅ Helper: Fix all CMS media URLs inside HTML (src + srcset)
   Updated to handle Oracle CMS URL
========================================================= */
const fixMediaUrls = (html) => {
  if (!html) return "";

  return html
    // Replace any CMS URL patterns with /cms-media/
    .replace(/src="https?:\/\/161\.118\.167\.107\/media\//g, 'src="/cms-media/')
    .replace(/src='https?:\/\/161\.118\.167\.107\/media\//g, "src='/cms-media/")
    .replace(/src="http:\/\/0\.0\.0\.0:8001\/media\//g, 'src="/cms-media/')
    .replace(/src='http:\/\/0\.0\.0\.0:8001\/media\//g, "src='/cms-media/")
    .replace(/src="http:\/\/127\.0\.0\.1:8001\/media\//g, 'src="/cms-media/')
    .replace(/src='http:\/\/127\.0\.0\.1:8001\/media\//g, "src='/cms-media/")
    .replace(/src="http:\/\/localhost:8001\/media\//g, 'src="/cms-media/')
    .replace(/src='http:\/\/localhost:8001\/media\//g, "src='/cms-media/")
    .replace(/src="\/media\//g, 'src="/cms-media/')
    .replace(/src='\/media\//g, "src='/cms-media/")
    .replace(/srcset="\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="https?:\/\/161\.118\.167\.107\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='https?:\/\/161\.118\.167\.107\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="http:\/\/0\.0\.0\.0:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/0\.0\.0\.0:8001\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="http:\/\/127\.0\.0\.1:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/127\.0\.0\.1:8001\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="http:\/\/localhost:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/localhost:8001\/media\//g, "srcset='/cms-media/")
    .replace(/\/cms-media\/media\//g, "/cms-media/");
};

/* =========================================================
   ✅ Helper: Single image URL fix
   Updated to handle Oracle CMS URL
========================================================= */
const getProxiedImageUrl = (url) => {
  if (!url) return null;

  // Handle Oracle CMS URL
  if (url.includes('161.118.167.107')) {
    return url
      .replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/')
      .replace('/cms-media/media/', '/cms-media/');
  }

  // Handle localhost/0.0.0.0 patterns
  if (url.startsWith("http://0.0.0.0:8001")) {
    return url
      .replace("http://0.0.0.0:8001", "/cms-media")
      .replace("/cms-media/media/", "/cms-media/");
  }

  if (url.startsWith("http://127.0.0.1:8001")) {
    return url
      .replace("http://127.0.0.1:8001", "/cms-media")
      .replace("/cms-media/media/", "/cms-media/");
  }

  if (url.startsWith("http://localhost:8001")) {
    return url
      .replace("http://localhost:8001", "/cms-media")
      .replace("/cms-media/media/", "/cms-media/");
  }

  if (url.startsWith("/media/")) {
    return `/cms-media${url.replace("/media/", "/")}`;
  }

  if (url.startsWith("/cms-media/")) {
    return url.replace("/cms-media/media/", "/cms-media/");
  }

  return url;
};

/* =========================================================
   ✅ Wagtail EMBED IMAGE FIX FUNCTIONS
========================================================= */
const extractEmbedImageIds = (html = "") => {
  if (!html) return [];
  const matches = [...html.matchAll(/embedtype="image"[^>]*id="(\d+)"/g)];
  return matches.map((m) => m[1]);
};

const fetchWagtailImageUrl = async (id, safeBaseUrl) => {
  try {
    const res = await fetch(`${safeBaseUrl}/api/v2/images/${id}/`);
    if (!res.ok) throw new Error(`Image ${id} fetch failed`);

    const data = await res.json();

    const url =
      data?.meta?.download_url ||
      data?.meta?.preview_url ||
      data?.meta?.original?.url ||
      data?.original?.url ||
      null;

    if (!url) return null;

    if (url.startsWith("/")) return `${safeBaseUrl}${url}`;

    return url;
  } catch (err) {
    console.error("fetchWagtailImageUrl error:", err);
    return null;
  }
};

const replaceEmbedImages = async (html = "", safeBaseUrl = "") => {
  try {
    if (!html) return "";

    let updatedHtml = html;
    const ids = extractEmbedImageIds(updatedHtml);

    if (!ids.length) return updatedHtml;

    for (const id of ids) {
      const imgUrl = await fetchWagtailImageUrl(id, safeBaseUrl);

      if (!imgUrl) {
        updatedHtml = updatedHtml.replace(
          new RegExp(
            `<embed\\s+[^>]*embedtype="image"[^>]*id="${id}"[^>]*\\/?>`,
            "g"
          ),
          ""
        );
        continue;
      }

      const proxiedUrl = getProxiedImageUrl(imgUrl);

      updatedHtml = updatedHtml.replace(
        new RegExp(
          `<embed\\s+[^>]*embedtype="image"[^>]*id="${id}"[^>]*\\/?>`,
          "g"
        ),
        `<img src="${proxiedUrl}" alt="Article Image" class="max-w-full h-auto rounded-lg" loading="lazy" />`
      );
    }

    return updatedHtml;
  } catch (err) {
    console.error("replaceEmbedImages error:", err);
    return html;
  }
};

/* =========================================================
   ✅ COMPREHENSIVE WAGTAIL URL FIXER
   Updated to handle Oracle CMS URLs
========================================================= */

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
 * TRANSFORM WAGTAIL URL TO NEXT.JS ROUTE - ULTIMATE VERSION
 * Handles URLs from Oracle CMS
 */
const transformWagtailUrlToNextRoute = (wagtailUrl = "") => {
  if (!wagtailUrl || wagtailUrl === "#") return "#";
  
  console.log("🔄 Transforming Wagtail URL:", wagtailUrl);
  
  // Remove domain and protocol to get just the path
  let path = wagtailUrl;
  
  // Remove http://161.118.167.107/ or similar domains
  path = path.replace(/https?:\/\/[^\/]+\//, '/');
  
  // Remove localhost patterns
  path = path.replace(/https?:\/\/localhost:5000\//, '/');
  path = path.replace(/https?:\/\/127.0.0.1:5000\//, '/');
  path = path.replace(/https?:\/\/0.0.0.0:5000\//, '/');
  
  // Ensure it starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  console.log("📝 Path after removing domain:", path);
  
  // SPECIAL CASE MAPPING - Direct transformations for known patterns
  const directMappings = {
    // Homeopathy patterns
    '/all-homeopathic-pages/': '/homeopathy/',
    '/all-homeopathy/': '/homeopathy/',
    
    // Ayurveda patterns
    '/all-ayurvedic-pages/': '/ayurveda/',
    '/all-ayurveda/': '/ayurveda/',
    
    // News patterns
    '/all-news-pages/': '/news/',
    '/all-news/': '/news/',
    
    // Wellness patterns
    '/all-wellness-pages/': '/wellness/',
    '/all-wellness/': '/wellness/',
    
    // Conditions patterns
    '/all-conditions-a-z/conditions/condition/': '/conditions/',
    '/all-conditions-a-z/': '/conditions/',
    '/all-conditions/': '/conditions/',
    
    // Drugs patterns
    '/all-drugs-a-z-pages/all-drugs-pages/drugs/': '/drugs/',
    '/all-drugs-pages/drugs/': '/drugs/',
    '/all-drugs-a-z-pages/': '/drugs/',
    '/all-drugs/': '/drugs/',
    
    // Yoga patterns
    '/all-yoga-pages/': '/yoga-exercise/',
    '/all-yoga/': '/yoga-exercise/',
    
    // Articles patterns
    '/all-article-pages/': '/articles/',
    '/all-articles/': '/articles/',
  };
  
  // Check for pattern matches
  for (const [wagtailPattern, nextRoute] of Object.entries(directMappings)) {
    if (path.startsWith(wagtailPattern)) {
      // Extract the slug part after the pattern
      const slug = path.replace(wagtailPattern, '');
      if (slug && !slug.includes('/')) {
        const finalRoute = `${nextRoute}${slug}`;
        console.log(`✅ Pattern match: ${path} → ${finalRoute}`);
        return finalRoute;
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
 * Fetch Wagtail page by ID
 */
const fetchWagtailPageById = async (id, safeBaseUrl) => {
  try {
    console.log(`🔍 Fetching Wagtail page for ID: ${id}`);
    const res = await fetch(`${safeBaseUrl}/api/v2/pages/${id}/`);
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
 */
const fixWagtailInternalLinks = async (html = "", safeBaseUrl = "") => {
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

      // Fetch all pages in parallel
      const fetchPromises = pageIds.map(async (id) => {
        const pageData = await fetchWagtailPageById(id, safeBaseUrl);
        if (pageData) {
          pageMap.set(id, pageData);
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
    updatedHtml = updatedHtml.replace(
      /<a([^>]*?)linktype="document"([^>]*?)id="(\d+)"([^>]*?)>/g,
      `<a$1href="${safeBaseUrl}/documents/$3/" target="_blank" rel="noopener noreferrer"$4>`
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
      href.includes('0.0.0.0') ||
      href.includes('161.118.167.107')
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
      
      // Drugs
      { pattern: /href="[^"]*\/all-drugs-a-z-pages\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="[^"]*\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      { pattern: /href="[^"]*\/all-drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      
      // Yoga
      { pattern: /href="[^"]*\/all-yoga-pages\/([^"]+)"/g, replacement: 'href="/yoga-exercise/$1"' },
      { pattern: /href="[^"]*\/all-yoga\/([^"]+)"/g, replacement: 'href="/yoga-exercise/$1"' },
      
      // Articles
      { pattern: /href="[^"]*\/all-article-pages\/([^"]+)"/g, replacement: 'href="/articles/$1"' },
      { pattern: /href="[^"]*\/all-articles\/([^"]+)"/g, replacement: 'href="/articles/$1"' },
      
      // Oracle CMS patterns
      { pattern: /href="http:\/\/161\.118\.167\.107\/all-homeopathic-pages\/([^"]+)"/g, replacement: 'href="/homeopathy/$1"' },
      { pattern: /href="http:\/\/161\.118\.167\.107\/all-news\/([^"]+)"/g, replacement: 'href="/news/$1"' },
      { pattern: /href="http:\/\/161\.118\.167\.107\/all-ayurvedic-pages\/([^"]+)"/g, replacement: 'href="/ayurveda/$1"' },
      { pattern: /href="http:\/\/161\.118\.167\.107\/all-wellness-pages\/([^"]+)"/g, replacement: 'href="/wellness/$1"' },
      { pattern: /href="http:\/\/161\.118\.167\.107\/all-conditions-a-z\/conditions\/condition\/([^"]+)"/g, replacement: 'href="/conditions/$1"' },
      { pattern: /href="http:\/\/161\.118\.167\.107\/all-drugs-a-z-pages\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
      
      // Localhost patterns
      { pattern: /href="http:\/\/localhost:5000\/all-homeopathic-pages\/([^"]+)"/g, replacement: 'href="/homeopathy/$1"' },
      { pattern: /href="http:\/\/localhost:5000\/all-news\/([^"]+)"/g, replacement: 'href="/news/$1"' },
      { pattern: /href="http:\/\/localhost:5000\/all-ayurvedic-pages\/([^"]+)"/g, replacement: 'href="/ayurveda/$1"' },
      { pattern: /href="http:\/\/localhost:5000\/all-wellness-pages\/([^"]+)"/g, replacement: 'href="/wellness/$1"' },
      { pattern: /href="http:\/\/localhost:5000\/all-conditions-a-z\/conditions\/condition\/([^"]+)"/g, replacement: 'href="/conditions/$1"' },
      { pattern: /href="http:\/\/localhost:5000\/all-drugs-a-z-pages\/all-drugs-pages\/drugs\/([^"]+)"/g, replacement: 'href="/drugs/$1"' },
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
   ✅ TOC Helpers
========================================================= */
const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const extractHeadings = (html) => {
  if (!html) return [];
  const matches = [...html.matchAll(/<h([2-3])[^>]*>(.*?)<\/h\1>/gi)];
  return matches.map((m) => ({
    level: Number(m[1]),
    text: m[2].replace(/<\/?[^>]+(>|$)/g, "").trim(),
  }));
};

const addHeadingIds = (html, headings) => {
  if (!html || !headings?.length) return html;

  let updated = html;
  headings.forEach((h) => {
    const id = slugify(h.text);

    updated = updated.replace(
      new RegExp(`<h${h.level}([^>]*)>${h.text}</h${h.level}>`, "i"),
      `<h${h.level}$1 id="${id}">${h.text}</h${h.level}>`
    );
  });

  return updated;
};

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */
export default function ArticleDetail({ article: initialArticle, relatedArticles }) {
  const router = useRouter();

  const [pageArticle, setPageArticle] = useState(initialArticle);
  const [loading, setLoading] = useState(!initialArticle);
  const [finalBodyHtml, setFinalBodyHtml] = useState("");
  const [finalReferencesHtml, setFinalReferencesHtml] = useState("");

  const safeCMS = useMemo(() => getSafeCMSUrl(), []);

  /* ✅ Content processing hooks */
  const rawBody = useMemo(
    () => fixMediaUrls(pageArticle?.body || ""),
    [pageArticle?.body]
  );

  const rawReferences = useMemo(
    () => fixMediaUrls(pageArticle?.references || ""),
    [pageArticle?.references]
  );

  /* =========================================================
     ✅ Body processing pipeline:
     1) fix media urls
     2) replace embed images
     3) fix internal links (page/document)
  ========================================================= */
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      console.log("🔄 Processing article body...");
      
      // 1) embed images
      const replaced = await replaceEmbedImages(rawBody, safeCMS);

      // 2) internal links clickable
      const linked = await fixWagtailInternalLinks(replaced, safeCMS);

      if (mounted) {
        setFinalBodyHtml(linked);
        console.log("✅ Article body processed");
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [rawBody, safeCMS]);

  /* ✅ References link fix too */
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      console.log("🔄 Processing references...");
      const linked = await fixWagtailInternalLinks(rawReferences, safeCMS);
      if (mounted) {
        setFinalReferencesHtml(linked);
        console.log("✅ References processed");
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [rawReferences, safeCMS]);

  const headings = useMemo(() => extractHeadings(finalBodyHtml), [finalBodyHtml]);

  const bodyWithIds = useMemo(
    () => addHeadingIds(finalBodyHtml, headings),
    [finalBodyHtml, headings]
  );

  // If fallback is true and the page is being generated
  if (router.isFallback || loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-neutral-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pageArticle) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">Article Not Found</h1>
        <p className="text-neutral-600 mb-6">The article you are looking for does not exist or has been moved.</p>
        <Link href="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  const {
    title,
    subtitle,
    image,
    author,
    published_date,
    updated_date,
    body,
    tags,
    category,
  } = pageArticle;

  // Format dates
  const formattedPublishedDate = new Date(published_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedUpdatedDate = updated_date
    ? new Date(updated_date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    : null;

  // SEO
  const pageTitle = `${title} - Niinfomed`;
  const pageDescription = subtitle || `Read about ${title} on Niinfomed.`;
  const pageUrl = typeof window !== "undefined"
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/articles/${router.query.slug}`;

  const mainImageUrl = getProxiedImageUrl(image) || "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1200&h=630";

  return (
    <>
      <NextSeo
        title={pageTitle}
        description={pageDescription}
        canonical={pageUrl}
        openGraph={{
          title: pageTitle,
          description: pageDescription,
          url: pageUrl,
          images: [
            {
              url: mainImageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
          siteName: "Niinfomed",
          type: 'article',
          article: {
            publishedTime: published_date,
            modifiedTime: updated_date,
            authors: author?.name ? [author.name] : [],
            tags: tags || [],
          },
        }}
      />

      <div className="container-custom py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-neutral-500 mb-6">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            {category && (
              <li className="flex items-center">
                <Link href={`/categories/${category.slug}`} className="hover:text-primary transition-colors">
                  {category.name}
                </Link>
                <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
            )}
            <li>
              <span className="text-neutral-600">{title}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <header className="p-6 pb-0">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-3">{title}</h1>
                {subtitle && <p className="text-xl text-neutral-600 mb-4">{subtitle}</p>}

                {/* Medical Reviewer */}
                {pageArticle.reviewer && (
                  <AuthorCard author={pageArticle.reviewer} label="Medically Reviewed by" isReviewer={true} />
                )}

                <div className="flex flex-wrap items-center justify-between text-sm text-neutral-500 mb-6">
                  <div className="flex flex-wrap items-center">
                    {author && (
                      <div className="flex items-center mr-6 mb-2">
                        <span className="font-medium">Written by {author.name}</span>
                        {author.credentials && <span>, {author.credentials}</span>}
                      </div>
                    )}
                    <div className="mr-6 mb-2">
                      <time dateTime={published_date}>Published: {formattedPublishedDate}</time>
                    </div>
                    {formattedUpdatedDate && (
                      <div className="mb-2">
                        <time dateTime={updated_date}>Updated: {formattedUpdatedDate}</time>
                      </div>
                    )}
                  </div>
                  <ShareButton title={title} url={pageUrl} />
                </div>
              </header>

              {image && (
                <div className="relative h-64 sm:h-80 md:h-96 w-full">
                  <Image
                    src={mainImageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    unoptimized={mainImageUrl?.includes("127.0.0.1") || mainImageUrl?.includes("localhost") || mainImageUrl?.includes("161.118.167.107")}
                  />
                </div>
              )}

              <div className="p-6">
                {/* Table of Contents */}
                {headings.length > 0 && (
                  <div className="mb-8 p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-3">On this page</h3>
                    <ul className="space-y-2 text-sm">
                      {headings.map((h, idx) => (
                        <li
                          key={`${h.text}-${idx}`}
                          className={h.level === 3 ? "ml-4" : ""}
                        >
                          <a
                            href={`#${slugify(h.text)}`}
                            className="text-neutral-700 hover:text-primary transition-colors"
                          >
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Body Content - ADD Z-INDEX FOR CLICKABLE LINKS */}
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: bodyWithIds }}
                  style={{ position: 'relative', zIndex: 10 }}
                />

                {/* Tags */}
                {tags && tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <h3 className="text-lg font-semibold mb-2">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Link
                          key={tag}
                          href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                          className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm hover:bg-neutral-200 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author bio */}
                {author && author.bio && (
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <div className="flex items-start">
                      {author.image && (
                        <div className="flex-shrink-0 mr-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden">
                            <Image
                              src={getProxiedImageUrl(author.image)}
                              alt={author.name}
                              fill
                              className="object-cover"
                              unoptimized={true}
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">About the Author</h3>
                        <p className="text-sm font-medium">{author.name}{author.credentials && `, ${author.credentials}`}</p>
                        <p className="text-sm text-neutral-600 mt-1">{author.bio}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical disclaimer */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-700 text-sm">
                    <strong>Medical Disclaimer:</strong> The information provided in this article is for educational and
                    informational purposes only and should not be considered medical advice. Always consult with a
                    qualified healthcare provider for personalized medical advice.
                  </p>
                </div>

                {/* References Section */}
                {pageArticle.references && (
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <h3 className="text-2xl font-bold mb-4">References</h3>
                    <div className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                      <div
                        className="prose max-w-none text-sm references-list"
                        dangerouslySetInnerHTML={{ __html: finalReferencesHtml }}
                        style={{ position: 'relative', zIndex: 10 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div>
            {/* Related articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles.map(article => {
                    const articleImage = getProxiedImageUrl(article.image);
                    return (
                      <div key={article.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                        <h4 className="font-medium mb-1">
                          <Link
                            href={`/articles/${article.slug}`}
                            className="text-primary hover:text-primary-light transition-colors"
                          >
                            {article.title}
                          </Link>
                        </h4>
                        {articleImage && (
                          <div className="mb-2">
                            <img
                              src={articleImage}
                              alt={article.title}
                              className="w-full h-32 object-cover rounded"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <p className="text-sm text-neutral-600 line-clamp-2">{article.summary}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular topics */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Popular Topics</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/conditions/diabetes"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  Diabetes
                </Link>
                <Link
                  href="/conditions/heart-disease"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  Heart Disease
                </Link>
                <Link
                  href="/conditions/hypertension"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  Hypertension
                </Link>
                <Link
                  href="/conditions/arthritis"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  Arthritis
                </Link>
                <Link
                  href="/conditions/covid-19"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  COVID-19
                </Link>
                <Link
                  href="/conditions/cancer"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  Cancer
                </Link>
                <Link
                  href="/conditions/anxiety"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  Anxiety
                </Link>
                <Link
                  href="/conditions/depression"
                  className="p-2 bg-neutral-50 rounded text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  Depression
                </Link>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="bg-primary-light rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Stay Informed</h3>
              <p className="mb-4 text-white/90">
                Get the latest health news and information delivered straight to your inbox.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-3 py-2 text-neutral-800 text-sm rounded border-0 focus:ring-2 focus:ring-white"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-white text-primary text-sm font-medium rounded hover:bg-neutral-100 transition-colors"
                >
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* More from Niinfomed */}
        <div className="mt-12">
          <h2 className="section-title">More From Niinfomed</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ArticleCard
              article={{
                id: 1,
                title: 'The Key Health Benefits of Pistachios',
                slug: 'health-benefits-pistachios',
                image: getProxiedImageUrl('https://example.com/images/pistachios.jpg'),
                summary: 'Discover how these small nuts pack a powerful nutritional punch and contribute to overall health.',
                category: 'Nutrition',
                created_at: '2023-03-15T14:00:00Z',
              }}
            />
            <ArticleCard
              article={{
                id: 2,
                title: 'How Alcohol Affects Your Skin',
                slug: 'alcohol-affects-skin',
                image: getProxiedImageUrl('https://example.com/images/alcohol-skin.jpg'),
                summary: 'Learn about the impact of alcohol consumption on your skin health and appearance.',
                category: 'Skincare',
                created_at: '2023-03-10T10:30:00Z',
              }}
            />
            <ArticleCard
              article={{
                id: 3,
                title: 'What Causes Cracked Heels?',
                slug: 'causes-cracked-heels',
                image: getProxiedImageUrl('https://example.com/images/cracked-heels.jpg'),
                summary: 'Understanding the causes, prevention, and treatment options for cracked heels.',
                category: 'Foot Health',
                created_at: '2023-03-05T08:15:00Z',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  try {
    const paths = await fetchArticlePaths();

    return {
      paths: paths.map(slug => ({ params: { slug } })),
      fallback: true, // Show a loading state while generating pages on-demand
    };
  } catch (error) {
    console.error('Error fetching article paths:', error);
    return {
      paths: [],
      fallback: true,
    };
  }
}

export async function getStaticProps({ params, locale }) {
  try {
    console.log(`📡 Fetching article: ${params.slug} from Oracle CMS`);
    const article = await fetchArticle(params.slug, locale);

    if (!article) {
      return {
        notFound: true,
      };
    }

    // Fetch related articles
    const relatedArticles = await fetchRelatedArticles(params.slug);

    return {
      props: {
        article,
        relatedArticles,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error(`Error fetching article ${params.slug}:`, error);
    return {
      notFound: true,
    };
  }
}