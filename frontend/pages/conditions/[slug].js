import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import {
  fetchCondition,
  fetchConditionPaths,
  fetchConditionsIndex,
  fetchNews,
  fetchDrugs,
} from '../../utils/api';

import {
  MedicalConditionStructuredData,
  FAQPageStructuredData,
  MedicalWebPageStructuredData,
  BreadcrumbStructuredData,
  ReviewerStructuredData,
} from '../../components/StructuredData';

import CommentSection from '../../components/CommentSection';
import ReferencesSection from '../../components/ReferencesSection';

// Oracle CMS URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://161.118.167.107';

// Language alternates for hreflang tags
const LANGUAGE_ALTERNATES = [
  { hrefLang: 'en', path: '' },
  { hrefLang: 'hi', path: '/hi' },
  { hrefLang: 'bn', path: '/bn' },
  { hrefLang: 'te', path: '/te' },
  { hrefLang: 'mr', path: '/mr' },
  { hrefLang: 'ta', path: '/ta' },
  { hrefLang: 'ur', path: '/ur' },
  { hrefLang: 'gu', path: '/gu' },
  { hrefLang: 'kn', path: '/kn' },
  { hrefLang: 'ml', path: '/ml' },
  { hrefLang: 'or', path: '/or' },
  { hrefLang: 'pa', path: '/pa' },
  { hrefLang: 'as', path: '/as' },
  { hrefLang: 'x-default', path: '' },
];

/* =========================================================
   ✅ SLUG UTILITIES
========================================================= */

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse condition from URL slug
 */
function parseConditionSlug(urlSlug) {
  if (!urlSlug) return { slug: '', id: '' };
  
  const urlSlugStr = String(urlSlug);
  const parts = urlSlugStr.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part is a numeric ID
  if (/^\d+$/.test(lastPart)) {
    const id = lastPart;
    const slug = parts.slice(0, -1).join('-');
    return { slug, id };
  }
  
  return { slug: urlSlugStr, id: '' };
}

/**
 * Format condition URL with proper slug and ID
 */
function formatConditionUrl(title, id) {
  if (!title) return id ? `/conditions/condition-${id}` : '/conditions';
  
  const slug = generateSlug(title);
  return id ? `/conditions/${slug}-${id}` : `/conditions/${slug}`;
}

/**
 * Get canonical URL for condition
 */
function getConditionCanonicalUrl(title, id) {
  if (!title) return id ? `/conditions/condition-${id}` : '/conditions';
  
  const slug = generateSlug(title);
  return id ? `/conditions/${slug}-${id}` : `/conditions/${slug}`;
}

/* =========================================================
   ✅ IMAGE AND MEDIA HELPERS
========================================================= */

/**
 * Get proxied image URL for Oracle CMS
 */
const getProxiedImageUrl = (url) => {
  if (!url) return null;

  // Handle Oracle CMS URL
  if (url.includes('161.118.167.107')) {
    return url.replace(/https?:\/\/161\.118\.167\.107\/media\//, '/cms-media/');
  }

  // Handle localhost patterns
  if (url.includes('0.0.0.0:8001') || url.includes('127.0.0.1:8001') || url.includes('localhost:8001')) {
    return url.replace(/https?:\/\/[^\/]+\/media\//, '/cms-media/');
  }
  
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  
  return url;
};

/**
 * Fix media URLs in HTML content
 */
const fixMediaUrls = (html) => {
  if (!html) return '';

  return html
    // Oracle CMS patterns
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
   ✅ WAGTAIL EMBED IMAGE FUNCTIONS
========================================================= */

/**
 * Extract Wagtail embed image IDs from HTML
 */
const extractEmbedImageIds = (html = "") => {
  if (!html) return [];
  
  try {
    const regex = /embedtype="image"[^>]*id="(\d+)"/g;
    const matches = [];
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  } catch (error) {
    console.error("Error extracting embed image IDs:", error);
    return [];
  }
};

/**
 * Fetch Wagtail image URL by ID
 */
const fetchWagtailImageUrl = async (id) => {
  try {
    const res = await fetch(`${CMS_API_URL}/api/v2/images/${id}/`);
    if (!res.ok) return null;

    const data = await res.json();
    return data?.meta?.download_url ||
           data?.meta?.preview_url ||
           data?.meta?.original?.url ||
           data?.original?.url ||
           null;
  } catch (err) {
    console.error("fetchWagtailImageUrl error:", err);
    return null;
  }
};

/**
 * Replace Wagtail embed images with <img> tags
 */
const replaceEmbedImages = async (html = "") => {
  try {
    if (!html) return "";

    let updatedHtml = html;
    const ids = extractEmbedImageIds(updatedHtml);

    if (!ids.length) return updatedHtml;

    for (const id of ids) {
      const imgUrl = await fetchWagtailImageUrl(id);
      if (imgUrl) {
        const proxiedUrl = getProxiedImageUrl(imgUrl);
        
        const regex = new RegExp(`<embed[^>]*embedtype="image"[^>]*id="${id}"[^>]*>`, "g");
        updatedHtml = updatedHtml.replace(
          regex,
          `<img src="${proxiedUrl}" alt="Medical Image" class="max-w-full h-auto rounded-lg shadow-md my-4" loading="lazy" />`
        );
      }
    }

    return updatedHtml;
  } catch (err) {
    console.error("replaceEmbedImages error:", err);
    return html;
  }
};

/* =========================================================
   ✅ WAGTAIL INTERNAL LINK FUNCTIONS
========================================================= */

/**
 * Extract internal page link IDs from HTML
 */
const extractInternalPageLinkIds = (html = "") => {
  if (!html) return [];
  const regex = /<a[^>]*linktype="page"[^>]*id="(\d+)"[^>]*>/g;
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

/**
 * Extract document link IDs from HTML
 */
const extractDocumentLinkIds = (html = "") => {
  if (!html) return [];
  const regex = /<a[^>]*linktype="document"[^>]*id="(\d+)"[^>]*>/g;
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

/**
 * Fetch Wagtail page data by ID
 */
const fetchWagtailPageById = async (id) => {
  try {
    const res = await fetch(`${CMS_API_URL}/api/v2/pages/${id}/`);
    if (!res.ok) {
      console.warn(`Page fetch failed for ID ${id}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching Wagtail page:", err);
    return null;
  }
};

/**
 * Transform Wagtail URL to Next.js route
 */
const transformWagtailUrlToNextRoute = (fullSlug = "") => {
  if (!fullSlug) return "#";
  
  console.log("🔄 Transforming Wagtail URL:", fullSlug);
  
  // Remove any leading/trailing slashes
  const cleanSlug = fullSlug.replace(/^\/|\/$/g, '');
  
  // Handle specific patterns
  if (cleanSlug.includes('all-conditions-a-z/conditions/condition/')) {
    const slug = cleanSlug.split('condition/').pop();
    return `/conditions/${slug}`;
  }
  
  if (cleanSlug.includes('all-conditions/')) {
    const slug = cleanSlug.split('all-conditions/').pop();
    return `/conditions/${slug}`;
  }
  
  if (cleanSlug.includes('all-conditions-a-z/')) {
    const slug = cleanSlug.split('all-conditions-a-z/').pop();
    return `/conditions/${slug}`;
  }
  
  // Handle condition URLs with IDs
  if (cleanSlug.includes('-')) {
    const parts = cleanSlug.split('-');
    const lastPart = parts[parts.length - 1];
    
    if (/^\d+$/.test(lastPart)) {
      return `/conditions/${cleanSlug}`;
    }
  }
  
  // If it's already a clean route, return it
  if (cleanSlug.startsWith('conditions/')) {
    return `/${cleanSlug}`;
  }
  
  return `/${cleanSlug}`;
};

/**
 * Build Next.js route from Wagtail page data
 */
const buildNextRouteFromWagtailPage = (pageData) => {
  if (!pageData) return "#";
  
  const type = (pageData?.meta?.type || "").toLowerCase();
  const fullSlug = pageData?.meta?.slug || pageData?.slug || "";
  const title = pageData?.title || "";
  const id = pageData?.id;
  
  console.log("📄 Building route from:", { type, fullSlug, title: title.substring(0, 50), id });
  
  // If we have a full slug, transform it
  if (fullSlug) {
    let transformed = transformWagtailUrlToNextRoute(fullSlug);
    
    // Special handling for condition pages: Append ID if not present
    if (type.includes('condition') && id && transformed.startsWith('/conditions/')) {
      const currentSlug = transformed.replace('/conditions/', '');
      const { id: existingId } = parseConditionSlug(currentSlug);
      
      if (!existingId && title) {
        const slug = generateSlug(title);
        transformed = `/conditions/${slug}-${id}`;
        console.log(`🔥 Added ID to condition slug: ${transformed}`);
      }
    }
    
    return transformed;
  }
  
  // Fallback to type-based mapping
  let category = "";
  if (type.includes("condition")) {
    category = "conditions";
    if (id && title) {
      const slug = generateSlug(title);
      return `/${category}/${slug}-${id}`;
    }
  } else if (type.includes("article")) {
    category = "articles";
  } else if (type.includes("news")) {
    category = "news";
  } else if (type.includes("drug")) {
    category = "drugs";
  } else if (type.includes("wellness")) {
    category = "wellness";
  }
  
  if (category && title) {
    const slug = generateSlug(title);
    return `/${category}/${slug}`;
  }
  
  return "#";
};

/**
 * Fix Wagtail internal links in HTML content
 */
const fixWagtailInternalLinks = async (html = "") => {
  if (!html) return "";

  console.log("🔧 Fixing Wagtail internal links...");
  
  let updated = html;

  try {
    // 1. Fix internal page links
    const pageIds = extractInternalPageLinkIds(updated);
    
    if (pageIds.length > 0) {
      console.log(`🔗 Found ${pageIds.length} page link IDs`);
      
      const pageUrlMap = {};
      const uniqueIds = [...new Set(pageIds)];
      
      // Fetch all unique page URLs
      for (const id of uniqueIds) {
        if (!pageUrlMap[id]) {
          const pageData = await fetchWagtailPageById(id);
          if (pageData) {
            const url = buildNextRouteFromWagtailPage(pageData);
            pageUrlMap[id] = url;
            console.log(`✅ ID ${id} → ${url}`);
          } else {
            pageUrlMap[id] = "#";
          }
        }
      }

      // Replace page links with Next.js routes
      for (const id of uniqueIds) {
        const url = pageUrlMap[id];
        if (url && url !== "#") {
          const regex = new RegExp(`<a([^>]*?)linktype="page"([^>]*?)id="${id}"([^>]*?)>`, "g");
          updated = updated.replace(regex, `<a$1href="${url}"$3>`);
        }
      }
    }

    // 2. Fix document links
    const docIds = extractDocumentLinkIds(updated);
    if (docIds.length > 0) {
      for (const id of docIds) {
        const docUrl = `${CMS_API_URL}/documents/${id}/`;
        const regex = new RegExp(`<a([^>]*?)linktype="document"([^>]*?)id="${id}"([^>]*?)>`, "g");
        updated = updated.replace(regex, `<a$1href="${docUrl}" target="_blank" rel="noopener noreferrer"$3>`);
      }
    }

    // 3. Remove leftover Wagtail attributes
    updated = updated.replace(/linktype="[^"]*"/g, "");
    updated = updated.replace(/\s?id="\d+"/g, "");
    
    // 4. Make external links open in new tab
    updated = updated.replace(
      /<a([^>]*?)href="(https?:\/\/[^"]+)"([^>]*?)>/g,
      `<a$1href="$2"$3 target="_blank" rel="noopener noreferrer">`
    );

    console.log("✅ Finished fixing internal links");
    return updated;
  } catch (error) {
    console.error("❌ Error fixing Wagtail internal links:", error);
    return html;
  }
};

/**
 * Process HTML content with all Wagtail fixes
 */
const processWagtailContent = async (html = "") => {
  if (!html) return "";

  console.log("🚀 Processing Wagtail content...");
  
  try {
    let processedHtml = html;
    
    // 1. Replace embed images
    processedHtml = await replaceEmbedImages(processedHtml);
    
    // 2. Fix media URLs
    processedHtml = fixMediaUrls(processedHtml);
    
    // 3. Fix internal links
    processedHtml = await fixWagtailInternalLinks(processedHtml);
    
    // 4. Add enhanced styles to links
    processedHtml = processedHtml.replace(
      /<a([^>]*?)href="([^"]+)"([^>]*?)>/g,
      (match, before, href, after) => {
        if (href.startsWith('http')) return match;
        if (href.startsWith('#')) return match;
        
        const enhancedStyles = ' style="position: relative; z-index: 10; pointer-events: auto; cursor: pointer; text-decoration: underline;"';
        
        if (match.includes('style="')) {
          return match.replace('style="', 'style="position: relative; z-index: 10; pointer-events: auto; cursor: pointer; text-decoration: underline; ');
        }
        
        return `<a${before}href="${href}"${enhancedStyles}${after}>`;
      }
    );

    console.log("✅ Content processing complete!");
    return processedHtml;
  } catch (error) {
    console.error("❌ Error processing Wagtail content:", error);
    return fixMediaUrls(html);
  }
};

/* =========================================================
   ✅ RENDER COMPONENTS FOR STAGES AND FAQS
========================================================= */

/**
 * Render stages properly
 */
const renderStages = (stages) => {
  if (!stages || !Array.isArray(stages) || stages.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-neutral-800 mb-4">
        Stages of the Condition
      </h3>
      <div className="space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {stage.title || `Stage ${index + 1}`}
                </h4>
                {stage.description && (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: stage.description }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Render FAQs properly
 */
const renderFAQs = (faqs) => {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-neutral-800 mb-4">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={faq.id || index} className="border-b border-gray-200 pb-4">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">
                {faq.question || `Question ${index + 1}`}
              </h4>
            </div>
            {faq.answer && (
              <div className="ml-7">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   ✅ SVG ICONS
========================================================= */
const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function ConditionDetail({
  condition,
  relatedConditions,
  relatedNews,
  relatedDrugs,
}) {
  const router = useRouter();
  const { slug } = router.query;
  
  const [mounted, setMounted] = useState(false);
  const [pageCondition, setPageCondition] = useState(condition);
  const [loading, setLoading] = useState(!condition);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [activeLetter, setActiveLetter] = useState('A');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const alphabet = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), []);

  // Parse the slug to extract ID
  const parsedSlug = useMemo(() => {
    if (!slug) return { slug: '', id: '' };
    return parseConditionSlug(String(slug));
  }, [slug]);

  // Processed HTML state
  const [processedHtml, setProcessedHtml] = useState({
    about: '', causes: '', symptoms: '', stages: '',
    complications: '', treatments: '', faqs: '', publications: ''
  });

  // Get date meta
  const dateMeta = useMemo(() => {
    if (!pageCondition) return { publishedReadable: '', updatedReadable: '', lastReviewedReadable: '', timeAgo: '' };
    
    const publishedDate = pageCondition.first_published_at || pageCondition.created_at || null;
    const updatedDate = pageCondition.last_published_at || pageCondition.updated_at || publishedDate;
    const lastReviewedDate = pageCondition.review_date || updatedDate;
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const getTimeAgo = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    };
    
    return {
      publishedReadable: formatDate(publishedDate),
      updatedReadable: formatDate(updatedDate),
      lastReviewedReadable: formatDate(lastReviewedDate),
      timeAgo: getTimeAgo(updatedDate),
      publishedISO: publishedDate ? new Date(publishedDate).toISOString().split('T')[0] : '',
      updatedISO: updatedDate ? new Date(updatedDate).toISOString().split('T')[0] : '',
      lastReviewedISO: lastReviewedDate ? new Date(lastReviewedDate).toISOString().split('T')[0] : '',
    };
  }, [pageCondition]);

  // Get canonical URL
  const safePageUrl = useMemo(() => {
    if (!pageCondition) return '';
    return getConditionCanonicalUrl(
      pageCondition.name || pageCondition.title, 
      pageCondition.id
    );
  }, [pageCondition]);

  // Process content
  useEffect(() => {
    if (!pageCondition) return;

    const processContent = async () => {
      setIsProcessing(true);
      try {
        const processed = {};

        // Define content sections
        const sections = [
          { key: 'about', content: pageCondition.overview || '' },
          { key: 'causes', content: pageCondition.causes || '' },
          { key: 'symptoms', content: pageCondition.symptoms || '' },
          { key: 'treatments', content: pageCondition.treatments || '' },
          { key: 'complications', content: pageCondition.complications || '' },
          { key: 'publications', content: pageCondition.references || '' },
        ];

        // Process sections
        for (const section of sections) {
          if (section.content) {
            console.log(`🔄 Processing section: ${section.key}`);
            processed[section.key] = await processWagtailContent(section.content);
          } else {
            processed[section.key] = '';
          }
        }

        // For stages and FAQs, we don't need to process HTML
        processed.stages = '';
        processed.faqs = '';

        setProcessedHtml(processed);
        
        console.log("✅ Content processing complete!");
      } catch (error) {
        console.error("Error processing content:", error);
        // Fallback
        setProcessedHtml({
          about: fixMediaUrls(pageCondition.overview || ''),
          causes: fixMediaUrls(pageCondition.causes || ''),
          symptoms: fixMediaUrls(pageCondition.symptoms || ''),
          stages: '',
          treatments: fixMediaUrls(pageCondition.treatments || ''),
          complications: fixMediaUrls(pageCondition.complications || ''),
          publications: fixMediaUrls(pageCondition.references || ''),
          faqs: ''
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processContent();
  }, [pageCondition]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!router.isReady) return;
    const qLetter = (router.query.letter || 'A').toString().toUpperCase();
    setActiveLetter(qLetter);
  }, [router.isReady, router.query.letter]);

  useEffect(() => {
    if (!condition && slug) {
      fetchConditionData();
    } else {
      setLoading(false);
    }
  }, [slug, condition]);

  const fetchConditionData = async () => {
    try {
      setLoading(true);
      const id = parsedSlug.id || slug;
      const data = await fetchCondition(id);
      setPageCondition(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Condition not found');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (router.isFallback || loading || isProcessing) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="animate-pulse">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-neutral-200"></div>
          <div className="mx-auto w-48 h-4 mb-4 rounded bg-neutral-200"></div>
          <div className="mx-auto w-64 h-4 rounded bg-neutral-200"></div>
        </div>
      </div>
    );
  }

  if (error || !pageCondition) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">
            Condition Not Found
          </h1>
          <p className="text-yellow-700 mb-6">
            The condition you're looking for does not exist or may have been moved.
          </p>
          <Link
            href="/conditions"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All Conditions
          </Link>
        </div>
      </div>
    );
  }

  // Prepare content
  const pageTitle = pageCondition.name || pageCondition.title;
  const pageSubtitle = pageCondition.subtitle;
  const alsoKnownAs = pageCondition.also_known_as;

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Health Conditions', url: '/conditions' },
    { name: pageTitle, url: safePageUrl },
  ];

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'causes', label: `Causes of ${pageTitle || 'Condition'}` },
    { id: 'symptoms', label: 'Symptoms and Signs' },
    { id: 'stages', label: 'Stages' },
    { id: 'complications', label: 'Complications' },
    { id: 'treatments', label: 'Treatment' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'publications', label: 'Latest Publications' },
  ];

  const parsedFaqs = pageCondition.faqs || [];

  return (
    <>
      <NextSeo
        title={`${pageTitle} - Symptoms, Causes and Treatment | Niinfomed`}
        description={pageSubtitle || `Learn about ${pageTitle}, including symptoms, causes, treatment options, and prevention.`}
        canonical={`https://niinfomed.com${safePageUrl}`}
        languageAlternates={LANGUAGE_ALTERNATES.map(lang => ({
          hrefLang: lang.hrefLang,
          href: `https://niinfomed.com${lang.path}${safePageUrl}`,
        }))}
        openGraph={{
          url: `https://niinfomed.com${safePageUrl}`,
          title: `${pageTitle} - Symptoms, Causes and Treatment | Niinfomed`,
          description: pageSubtitle || `Learn about ${pageTitle}`,
          images: pageCondition.image
            ? [
                {
                  url: getProxiedImageUrl(pageCondition.image),
                  width: 1200,
                  height: 630,
                  alt: pageTitle,
                },
              ]
            : [],
          siteName: 'Niinfomed',
          type: 'article',
          article: {
            publishedTime: dateMeta.publishedISO,
            modifiedTime: dateMeta.updatedISO,
            authors: pageCondition.author ? [pageCondition.author.name] : [],
            tags: pageCondition.tags || [],
          },
        }}
      />

      <BreadcrumbStructuredData items={breadcrumbItems} />

      <MedicalConditionStructuredData
        name={pageTitle}
        alternateName={alsoKnownAs}
        description={pageCondition.overview || pageCondition.subtitle}
        url={`https://niinfomed.com${safePageUrl}`}
        image={getProxiedImageUrl(pageCondition.image)}
        associatedAnatomy={pageCondition.specialties}
        relevantSpecialty={pageCondition.specialties}
        datePublished={dateMeta.publishedISO}
        dateModified={dateMeta.updatedISO}
      />

      <MedicalWebPageStructuredData
        title={pageTitle}
        description={pageCondition.subtitle || pageCondition.overview}
        url={`https://niinfomed.com${safePageUrl}`}
        image={getProxiedImageUrl(pageCondition.image)}
        datePublished={dateMeta.publishedISO}
        dateModified={dateMeta.updatedISO}
        author={pageCondition.author}
        reviewer={pageCondition.reviewer}
        lastReviewed={dateMeta.lastReviewedISO}
        specialty={pageCondition.specialties}
      />

      {parsedFaqs.length > 0 && (
        <FAQPageStructuredData
          faqs={parsedFaqs.map(faq => ({
            question: faq.question,
            answer: faq.answer?.replace(/<[^>]*>/g, '') || '',
          }))}
          url={`https://niinfomed.com${safePageUrl}`}
          title={`FAQs about ${pageTitle}`}
        />
      )}

      {pageCondition.reviewer && (
        <ReviewerStructuredData
          name={pageCondition.reviewer.name}
          credentials={pageCondition.reviewer.credentials}
          image={getProxiedImageUrl(pageCondition.reviewer.image)}
          specialty={pageCondition.specialties}
        />
      )}

      <div className="bg-white">
        <div className="container-custom py-4">
          {/* Breadcrumbs */}
          <nav className="text-sm text-neutral-500 mb-6">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/conditions" className="hover:text-primary">
              Health Conditions
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700">{pageTitle}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {pageTitle}
              </h1>

              {pageSubtitle && (
                <p className="text-lg text-neutral-600 mb-3">
                  {pageSubtitle}
                </p>
              )}

              {alsoKnownAs && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Also known as:
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    {alsoKnownAs}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 mb-4">
                <div className="flex items-center gap-1">
                  <CalendarIcon />
                  <span>
                    Published:{' '}
                    <time dateTime={dateMeta.publishedISO}>
                      {dateMeta.publishedReadable}
                    </time>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <PencilIcon />
                  <span>
                    Updated:{' '}
                    <time dateTime={dateMeta.updatedISO}>
                      {dateMeta.updatedReadable}
                    </time>
                  </span>
                </div>

                {dateMeta.timeAgo && (
                  <div className="flex items-center gap-1">
                    <ClockIcon />
                    <span>{dateMeta.timeAgo}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-2 rounded-lg">
              <EyeIcon />
              <div className="text-sm">
                <div className="font-medium">
                  Medically Reviewed
                </div>
                <div className="text-xs">
                  <time dateTime={dateMeta.lastReviewedISO}>
                    {dateMeta.lastReviewedReadable}
                  </time>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 text-sm border-b border-neutral-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-primary hover:bg-primary/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT SIDEBAR */}
            <aside className="lg:w-48 shrink-0">
              <div className="sticky top-4 space-y-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 mb-2">
                    Written by
                  </p>

                  {pageCondition.author ? (
                    <div className="flex items-start gap-3">
                      {pageCondition.author.image && (
                        <img
                          src={getProxiedImageUrl(pageCondition.author.image)}
                          alt={pageCondition.author.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <Link
                          href={`/authors/${pageCondition.author.slug || 'staff'}`}
                          className="font-semibold text-primary hover:underline text-sm"
                        >
                          {pageCondition.author.name}
                        </Link>
                        {pageCondition.author.credentials && (
                          <p className="text-xs text-neutral-500">
                            {pageCondition.author.credentials}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon />
                      </div>
                      <div>
                        <span className="font-semibold text-primary text-sm">
                          Medical Team
                        </span>
                        <p className="text-xs text-neutral-500">
                          Health Content Writers
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-neutral-200 mt-4 pt-4">
                    <p className="text-sm text-neutral-600 mb-2">
                      Medically Reviewed by
                    </p>

                    {pageCondition.reviewer ? (
                      <div className="flex items-start gap-3">
                        {pageCondition.reviewer.image && (
                          <img
                            src={getProxiedImageUrl(pageCondition.reviewer.image)}
                            alt={pageCondition.reviewer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <Link
                            href={`/reviewers/${pageCondition.reviewer.slug || 'staff'}`}
                            className="font-semibold text-primary hover:underline text-sm"
                          >
                            {pageCondition.reviewer.name}
                          </Link>
                          {pageCondition.reviewer.credentials && (
                            <p className="text-xs text-neutral-500">
                              {pageCondition.reviewer.credentials}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckIcon />
                        </div>
                        <div>
                          <span className="font-semibold text-primary text-sm">
                            Medical Review Board
                          </span>
                          <p className="text-xs text-neutral-500">
                            Clinical Review Team
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Consulting Doctor Info */}
                  {pageCondition.consulting_doctor_name && (
                    <div className="border-t border-neutral-200 mt-4 pt-4">
                      <p className="text-sm font-medium text-neutral-700 mb-1">
                        Consulting Doctor
                      </p>
                      
                      <span className="text-sm text-primary">
                        {pageCondition.consulting_doctor_name}
                      </span>
                      
                      {pageCondition.consulting_doctor_specialty && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {pageCondition.consulting_doctor_specialty}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 min-w-0">
              <article className="bg-white">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                  {tabs.find((t) => t.id === activeTab)?.label || 'About'} {pageTitle}
                </h2>

                <div className="prose prose-lg max-w-none mb-8">
                  {activeTab === 'about' && (
                    <div dangerouslySetInnerHTML={{ __html: processedHtml.about }} />
                  )}
                  
                  {activeTab === 'causes' && (
                    <div dangerouslySetInnerHTML={{ __html: processedHtml.causes }} />
                  )}
                  
                  {activeTab === 'symptoms' && (
                    <div dangerouslySetInnerHTML={{ __html: processedHtml.symptoms }} />
                  )}
                  
                  {activeTab === 'stages' && (
                    <>
                      {pageCondition.stages && Array.isArray(pageCondition.stages) && pageCondition.stages.length > 0 ? (
                        renderStages(pageCondition.stages)
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-lg">
                            Stages for this condition will be added soon.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'complications' && (
                    <div dangerouslySetInnerHTML={{ __html: processedHtml.complications }} />
                  )}
                  
                  {activeTab === 'treatments' && (
                    <div dangerouslySetInnerHTML={{ __html: processedHtml.treatments }} />
                  )}
                  
                  {activeTab === 'faqs' && (
                    <>
                      {pageCondition.faqs && Array.isArray(pageCondition.faqs) && pageCondition.faqs.length > 0 ? (
                        renderFAQs(pageCondition.faqs)
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg">
                            FAQs for this condition will be added soon.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'publications' && (
                    <div dangerouslySetInnerHTML={{ __html: processedHtml.publications }} />
                  )}
                </div>

                {/* References Section */}
                {pageCondition.references && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-bold mb-4">References and Sources</h3>
                    <div className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-2xl">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: processedHtml.publications }}
                      />
                    </div>
                  </div>
                )}

                <CommentSection
                  contentType="condition"
                  contentSlug={pageCondition.slug || parsedSlug.slug}
                  contentId={pageCondition.id}
                  pageTitle={pageTitle}
                />
              </article>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="lg:w-72 shrink-0">
              <div className="sticky top-4 space-y-6">
                {/* Specialties */}
                {pageCondition.specialties && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-bold text-purple-800 mb-2 text-sm">
                      Medical Specialties
                    </h3>
                    <p className="text-sm">{pageCondition.specialties}</p>
                  </div>
                )}

                {/* Prevalence */}
                {pageCondition.prevalence && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-bold text-blue-800 mb-2 text-sm">
                      Prevalence
                    </h3>
                    <p className="text-sm">{pageCondition.prevalence}</p>
                  </div>
                )}

                {/* Risk Factors */}
                {pageCondition.risk_factors && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-800 mb-2 text-sm">
                      Risk Factors
                    </h3>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: pageCondition.risk_factors
                      }}
                    />
                  </div>
                )}

                {/* A-Z Navigation */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-bold text-primary mb-3">
                    Health Articles A-Z
                  </h3>
                  <div className="grid grid-cols-9 gap-1 text-xs">
                    {alphabet.map((letter) => (
                      <Link
                        key={letter}
                        href={`/conditions?letter=${letter}`}
                        className={`w-6 h-6 flex items-center justify-center rounded ${
                          activeLetter === letter
                            ? 'bg-primary text-white'
                            : 'bg-white text-primary hover:bg-primary/10'
                        }`}
                      >
                        {letter}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Latest News */}
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-bold text-neutral-800 mb-4 border-b pb-2">
                    Latest Health News
                  </h3>
                  <div className="space-y-4">
                    {relatedNews && relatedNews.length > 0 ? (
                      relatedNews.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          {item.image && (
                            <img
                              src={getProxiedImageUrl(item.image)}
                              alt={item.title}
                              className="w-16 h-12 rounded object-cover shrink-0"
                            />
                          )}
                          <Link
                            href={item.slug ? `/news/${item.slug}` : '#'}
                            className="text-sm text-primary hover:underline line-clamp-2"
                          >
                            {item.title}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500">
                        No related news available at this time.
                      </p>
                    )}
                  </div>
                </div>

                {/* Related Drugs */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-bold text-purple-800 mb-3 text-sm">
                    Drugs for {pageTitle}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {(relatedDrugs && relatedDrugs.length > 0
                      ? relatedDrugs.slice(0, 4)
                      : []
                    ).map((drug, idx) => (
                      <Link
                        key={idx}
                        href={drug.slug ? `/drugs/${drug.slug}` : '/drugs'}
                        className="block text-primary hover:underline"
                      >
                        {drug.name || drug.title}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Related Conditions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-3 text-sm">
                    Related Conditions
                  </h3>
                  <div className="space-y-2 text-sm">
                    {(relatedConditions && relatedConditions.length > 0
                      ? relatedConditions.slice(0, 6)
                      : []
                    ).map((related, idx) => (
                      <Link
                        key={idx}
                        href={formatConditionUrl(related.name, related.id)}
                        className="block text-primary hover:underline"
                      >
                        {related.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

// Updated getStaticPaths to use slug IDs
export async function getStaticPaths() {
  try {
    const conditions = await fetchConditionsIndex();
    
    const paths = conditions.map((condition) => {
      // Generate slug with ID
      const slug = getConditionCanonicalUrl(condition.title || condition.name, condition.id);
      // Remove leading slash and get just the slug part
      const slugPart = slug.replace('/conditions/', '');
      
      return { params: { slug: slugPart } };
    });
    
    console.log(`📁 Generated ${paths.length} static paths for conditions`);
    
    return {
      paths: paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching condition paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

// Updated getStaticProps to handle slug with ID
export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    
    // Parse the slug to extract ID
    const { slug: conditionSlug, id } = parseConditionSlug(String(slug));
    
    console.log(`📄 Fetching condition with slug: ${slug}, parsed:`, { conditionSlug, id });
    
    // Use ID if available, otherwise use the full slug
    const condition = await fetchCondition(id || conditionSlug || slug);

    if (!condition) {
      console.warn(`Condition not found for slug: ${slug}`);
      return { notFound: true };
    }

    let relatedConditions = [];
    let relatedNews = [];
    let relatedDrugs = [];

    try {
      const conditions = await fetchConditionsIndex();
      relatedConditions = (conditions || [])
        .filter(c => c.id !== condition.id)
        .slice(0, 6) || [];
    } catch (e) {
      console.log('Could not fetch related conditions');
    }

    try {
      const news = await fetchNews();
      relatedNews = (news?.results || news || []).slice(0, 5);
    } catch (e) {
      console.log('Could not fetch related news');
    }

    try {
      const drugs = await fetchDrugs();
      relatedDrugs = (drugs?.results || drugs || []).slice(0, 5);
    } catch (e) {
      console.log('Could not fetch related drugs');
    }

    return {
      props: {
        condition,
        relatedConditions,
        relatedNews,
        relatedDrugs,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error(`Error fetching condition ${params.slug}:`, error);
    return { notFound: true };
  }
}