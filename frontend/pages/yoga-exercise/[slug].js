import { useRouter } from "next/router";
import Link from "next/link";
import SEO from "../../components/SEO";
import axios from "axios";
import CommentSection from "../../components/CommentSection";
import ReferencesSection from "../../components/ReferencesSection";
import { useState, useEffect, useMemo } from "react";
import Head from "next/head";

/* =========================================================
   ✅ FIX: Mobile cannot fetch 0.0.0.0 / localhost / 127.0.0.1
========================================================= */
const getSafeCMSUrl = () => {
  let base = process.env.NEXT_PUBLIC_CMS_API_URL || "http://127.0.0.1:8001";

  if (typeof window !== "undefined") {
    const frontendHost = window.location.hostname;

    base = base
      .replace("0.0.0.0", frontendHost)
      .replace("127.0.0.1", frontendHost)
      .replace("localhost", frontendHost);
  }

  return base;
};

// ⚠️ For SSR/SSG use env directly (build time)
const CMS_API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL || "http://127.0.0.1:8001";

/* =========================================================
   ✅ Helper: Fix all CMS media URLs inside HTML (src + srcset)
========================================================= */
const fixMediaUrlsInHtml = (html) => {
  if (!html) return "";

  return html
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
    .replace(/srcset="http:\/\/0\.0\.0\.0:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/0\.0\.0\.0:8001\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="http:\/\/127\.0\.0\.1:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/127\.0\.0\.1:8001\/media\//g, "srcset='/cms-media/")
    .replace(/srcset="http:\/\/localhost:8001\/media\//g, 'srcset="/cms-media/')
    .replace(/srcset='http:\/\/localhost:8001\/media\//g, "srcset='/cms-media/")
    .replace(/\/cms-media\/media\//g, "/cms-media/");
};

/* =========================================================
   ✅ IMAGE OPTIMIZATION HELPER
========================================================= */
const optimizeImageUrl = (url, width = 1200) => {
  if (!url) return null;
  
  // If using a proper CDN/image service, add optimization params
  if (url.includes('unsplash.com') || url.includes('cloudinary') || url.includes('imgix')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=75&auto=format,compress`;
  }
  
  return getProxiedImageUrl(url);
};

/* =========================================================
   ✅ Helper: Single image URL fix
========================================================= */
const getProxiedImageUrl = (url) => {
  if (!url) return null;

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
        `<img src="${proxiedUrl}" alt="Yoga Exercise Image" class="max-w-full h-auto rounded-xl" loading="lazy" width="800" height="450" />`
      );
    }

    return updatedHtml;
  } catch (err) {
    console.error("replaceEmbedImages error:", err);
    return html;
  }
};

/* =========================================================
   ✅ NEW: FIX WAGTAIL INTERNAL LINKS (CLICKABLE FIX)
   Converts: <a linktype="page" id="75"> -> <a href="/yoga-exercise/slug">
========================================================= */
const extractInternalPageLinkIds = (html = "") => {
  if (!html) return [];
  const matches = [...html.matchAll(/<a[^>]*linktype="page"[^>]*id="(\d+)"[^>]*>/g)];
  return matches.map((m) => m[1]);
};

const fetchWagtailPageById = async (id, safeBaseUrl) => {
  try {
    const res = await fetch(`${safeBaseUrl}/api/v2/pages/${id}/`);
    if (!res.ok) throw new Error("page fetch failed");
    return await res.json();
  } catch (err) {
    return null;
  }
};

const buildFrontendUrlFromWagtailPage = (pageData) => {
  const type = (pageData?.meta?.type || "").toLowerCase();
  const slug = pageData?.meta?.slug || pageData?.slug;

  if (!slug) return "#";

  // Yoga Exercise and other route mappings
  if (type.includes("yoga")) return `/yoga-exercise/${slug}`;
  if (type.includes("wellness")) return `/wellness/${slug}`;
  if (type.includes("ayurveda")) return `/ayurveda/${slug}`;
  if (type.includes("news")) return `/news/${slug}`;
  if (type.includes("article")) return `/articles/${slug}`;
  if (type.includes("condition")) return `/conditions/${slug}`;
  if (type.includes("drug")) return `/drugs/${slug}`;
  if (type.includes("homeopathy")) return `/homeopathy/${slug}`;

  // Fallback
  return `/${slug}`;
};

const fixWagtailInternalLinks = async (html = "", safeBaseUrl = "") => {
  if (!html) return "";

  let updated = html;

  // 1) Fix internal page links
  const ids = extractInternalPageLinkIds(updated);

  for (const id of ids) {
    const pageData = await fetchWagtailPageById(id, safeBaseUrl);

    const url = pageData ? buildFrontendUrlFromWagtailPage(pageData) : "#";

    // Replace <a linktype="page" id="75" ...> with <a href="/yoga-exercise/slug" ...>
    updated = updated.replace(
      new RegExp(`<a([^>]*?)linktype="page"([^>]*?)id="${id}"([^>]*?)>`, "g"),
      `<a$1$2href="${url}"$3>`
    );
  }

  // 2) Fix document links
  updated = updated.replace(
    /<a([^>]*?)linktype="document"([^>]*?)id="(\d+)"([^>]*?)>/g,
    `<a$1$2href="${CMS_API_URL}/documents/$3/" target="_blank" rel="noopener noreferrer"$4>`
  );

  // 3) Remove leftover wagtail attributes
  updated = updated.replace(/linktype="[^"]*"/g, "");
  updated = updated.replace(/\s?id="\d+"/g, "");

  return updated;
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
   ENHANCED: Date Functions with Fallbacks
========================================================= */

const createFallbackDates = () => {
  const now = new Date();

  const publishedDate = new Date(now);
  publishedDate.setDate(now.getDate() - 30);

  const updatedDate = new Date(now);
  updatedDate.setDate(now.getDate() - 7);

  const lastReviewedDate = new Date(now);
  lastReviewedDate.setDate(now.getDate() - 15);

  return {
    published: publishedDate,
    updated: updatedDate,
    lastReviewed: lastReviewedDate,
    isFallback: true,
  };
};

const parseDateSafe = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : null;
  } catch (error) {
    return null;
  }
};

const extractDatesFromTopic = (topic) => {
  if (!topic) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true,
    };
  }

  let publishedDate = null;
  let updatedDate = null;
  let lastReviewedDate = null;

  const possiblePublishedFields = [
    "first_published_at",
    "first_published_date",
    "published_date",
    "publish_date",
    "published_at",
    "publication_date",
    "created_at",
    "created_date",
    "date_published",
    "date",
  ];

  const possibleUpdatedFields = [
    "last_published_at",
    "last_published_date",
    "updated_at",
    "updated_date",
    "modified_at",
    "modified_date",
    "last_updated",
    "last_modified",
    "update_date",
  ];

  const possibleReviewedFields = [
    "last_reviewed",
    "last_reviewed_date",
    "reviewed_at",
    "review_date",
    "medical_review_date",
  ];

  for (const field of possiblePublishedFields) {
    if (topic[field]) {
      publishedDate = parseDateSafe(topic[field]);
      if (publishedDate) break;
    }
  }

  for (const field of possibleUpdatedFields) {
    if (topic[field]) {
      updatedDate = parseDateSafe(topic[field]);
      if (updatedDate) break;
    }
  }

  for (const field of possibleReviewedFields) {
    if (topic[field]) {
      lastReviewedDate = parseDateSafe(topic[field]);
      if (lastReviewedDate) break;
    }
  }

  if (!publishedDate && !updatedDate) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true,
    };
  }

  if (!publishedDate && updatedDate) publishedDate = updatedDate;
  if (!updatedDate && publishedDate) updatedDate = publishedDate;
  if (!lastReviewedDate) lastReviewedDate = updatedDate || publishedDate;

  return {
    publishedDate,
    updatedDate,
    lastReviewedDate,
    isFallback: false,
  };
};

const formatDateDisplay = (date) => {
  if (!date) return "Date not available";
  try {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid date";
  }
};

const getTimeAgo = (date) => {
  if (!date) return "";
  try {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  } catch (error) {
    return "";
  }
};

const isContentUpdated = (publishedDate, updatedDate) => {
  if (!publishedDate || !updatedDate) return false;
  try {
    const diffTime = Math.abs(updatedDate - publishedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0;
  } catch (error) {
    return false;
  }
};

/* =========================================================
   DateDisplay Component
========================================================= */

const DateDisplay = ({
  publishedDate,
  updatedDate,
  lastReviewedDate,
  isFallback = false,
  compact = false,
  className = "",
}) => {
  const isUpdated = isContentUpdated(publishedDate, updatedDate);
  const publishedDisplay = formatDateDisplay(publishedDate);
  const updatedDisplay = formatDateDisplay(updatedDate);
  const lastReviewedDisplay = formatDateDisplay(lastReviewedDate);

  const publishedTimeAgo = getTimeAgo(publishedDate);
  const updatedTimeAgo = getTimeAgo(updatedDate);
  const reviewedTimeAgo = getTimeAgo(lastReviewedDate);

  if (compact) {
    return (
      <div
        className={`flex flex-wrap items-center gap-2 text-sm text-gray-600 ${className}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        <span className="font-medium">Published:</span>
        <time dateTime={publishedDate?.toISOString() || ""}>
          {publishedDisplay}
        </time>

        {isUpdated && (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Updated
          </span>
        )}

        {isFallback && (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            Estimated
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Published */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Published</h4>
              <p className="text-sm text-gray-500">Original publication date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={publishedDate?.toISOString() || ""}
              className="text-lg sm:text-xl font-bold text-gray-800 block"
            >
              {publishedDisplay}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {publishedTimeAgo}
            </span>
          </div>
        </div>

        {/* Updated */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-full ${
                isUpdated ? "bg-green-100" : "bg-gray-100"
              } flex items-center justify-center`}
            >
              <svg
                className={`w-5 h-5 ${
                  isUpdated ? "text-green-600" : "text-gray-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {isUpdated ? "Updated" : "Last Updated"}
              </h4>
              <p className="text-sm text-gray-500">
                {isUpdated ? "Most recent update" : "Last modification"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={updatedDate?.toISOString() || ""}
              className="text-lg sm:text-xl font-bold text-gray-800 block"
            >
              {updatedDisplay}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {updatedTimeAgo}
            </span>
          </div>
        </div>

        {/* Reviewed */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Reviewed</h4>
              <p className="text-sm text-gray-500">Medical review date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={lastReviewedDate?.toISOString() || ""}
              className="text-lg sm:text-xl font-bold text-gray-800 block"
            >
              {lastReviewedDisplay}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {reviewedTimeAgo}
            </span>
          </div>
        </div>
      </div>

      {isFallback && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-700">
            Dates are estimated because CMS did not provide publication timeline.
          </p>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   Helper Functions
========================================================= */

const getAbsoluteImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${CMS_API_URL}${url}`;
  return url;
};

const fixRelativeMediaUrls = (html = "") => {
  if (!html) return "";
  let processed = html;

  processed = processed.replace(/src="\/media\//g, `src="${CMS_API_URL}/media/`);
  processed = processed.replace(/src='\/media\//g, `src='${CMS_API_URL}/media/`);

  processed = processed.replace(/url\(\/media\//g, `url(${CMS_API_URL}/media/`);
  processed = processed.replace(/url\('\/media\//g, `url('${CMS_API_URL}/media/`);
  processed = processed.replace(/url\("\/media\//g, `url("${CMS_API_URL}/media/`);

  return processed;
};

const fixWagtailEmbedImages = (html = "", imageMap = {}) => {
  if (!html) return "";

  let processed = html;

  processed = processed.replace(
    /<embed\s+[^>]*embedtype="image"[^>]*id="(\d+)"[^>]*\/?>/gi,
    (match, id) => {
      const imgUrl = imageMap?.[id] ? getAbsoluteImageUrl(imageMap[id]) : null;

      if (!imgUrl) {
        return `<div class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 my-4">
          Image not found (ID: ${id})
        </div>`;
      }

      return `
        <img
          src="${imgUrl}"
          alt="Yoga Exercise Image"
          class="max-w-full w-full h-auto rounded-xl shadow my-4"
          loading="lazy"
          width="800"
          height="450"
        />
      `;
    }
  );

  return processed;
};

const fixMediaUrls = (html = "", imageMap = {}) => {
  let processed = html;
  processed = fixWagtailEmbedImages(processed, imageMap);
  processed = fixRelativeMediaUrls(processed);
  return processed;
};

const getAuthorDisplayName = (author) => {
  if (!author) return null;
  return author.name || author.display_name || author.full_name || null;
};

const getAuthorSlug = (author) => {
  if (!author) return null;
  if (author.slug) return author.slug;
  if (author.name) {
    return author.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  return null;
};

const getReviewerSlug = (reviewer) => {
  if (!reviewer) return null;
  if (reviewer.slug) return reviewer.slug;
  if (reviewer.name) {
    return reviewer.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  return null;
};

/* =========================================================
   ✅ Skeleton Loader Component
========================================================= */
const SkeletonLoader = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
      
      {/* Hero image skeleton */}
      <div className="w-full h-64 md:h-96 bg-gray-200 rounded-2xl mb-6"></div>
      
      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

const TableOfContents = ({ headings = [] }) => {
  if (!headings.length) return null;

  const scrollToHeading = (id) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 90;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      <h3 className="text-lg font-bold mb-3">On this page</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <button
              onClick={() => scrollToHeading(h.id)}
              className="text-gray-700 hover:text-purple-600 hover:underline text-left w-full transition-colors"
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* =========================================================
   Content Metadata Component
========================================================= */

const ContentMetadata = ({ 
  category, 
  difficultyLevel, 
  readingTime,
  publishedDate,
  updatedDate,
  lastReviewedDate,
  isFallback = false
}) => {
  const isUpdated = isContentUpdated(publishedDate, updatedDate);
  
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {category?.name && (
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
      
      {isUpdated && (
        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Recently Updated
        </span>
      )}
      
      {isFallback && (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Estimated Dates
        </span>
      )}
    </div>
  );
};

/* =========================================================
   API Helpers
========================================================= */

const tryFetchFromMultipleEndpoints = async (endpoints = [], config = {}) => {
  for (let url of endpoints) {
    try {
      const res = await axios.get(url, config);
      if (res?.data) return { data: res.data, usedUrl: url };
    } catch (err) {}
  }
  return { data: null, usedUrl: null };
};

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */

export default function YogaDetail({ 
  topic: initialTopic, 
  relatedTopics: initialRelated,
  imageMap,
  processedBody: initialProcessedBody,
  processedReferences: initialProcessedReferences,
  processedBenefits: initialProcessedBenefits,
  processedInstructions: initialProcessedInstructions,
  headings: initialHeadings,
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
  const [processedInstructions, setProcessedInstructions] = useState(initialProcessedInstructions || "");
  const [headings, setHeadings] = useState(initialHeadings || []);
  
  const safeCMS = useMemo(() => getSafeCMSUrl(), []);

  const { publishedDate, updatedDate, lastReviewedDate, isFallback } = useMemo(
    () => extractDatesFromTopic(topic),
    [topic]
  );

  /* ✅ Get raw content */
  const rawBody = useMemo(
    () => fixMediaUrls(topic?.body || "", imageMap || {}),
    [topic?.body, imageMap]
  );

  const rawReferences = useMemo(
    () => fixMediaUrls(topic?.references || "", imageMap || {}),
    [topic?.references, imageMap]
  );

  const rawBenefits = useMemo(
    () => fixMediaUrls(topic?.benefits || "", imageMap || {}),
    [topic?.benefits, imageMap]
  );

  const rawInstructions = useMemo(
    () => fixMediaUrls(topic?.instructions || "", imageMap || {}),
    [topic?.instructions, imageMap]
  );

  /* =========================================================
     ✅ PARALLEL PROCESSING: Combine all async operations
  ========================================================= */
  useEffect(() => {
    if (initialProcessedBody && initialProcessedReferences && 
        initialProcessedBenefits && initialProcessedInstructions) {
      // Use server-processed content if available
      setContentLoaded(true);
      return;
    }

    let mounted = true;

    const processAllContent = async () => {
      try {
        // Run all async operations in parallel
        const [bodyResult, referencesResult, benefitsResult, instructionsResult] = await Promise.all([
          // Process body
          (async () => {
            const replaced = await replaceEmbedImages(rawBody, safeCMS);
            return await fixWagtailInternalLinks(replaced, safeCMS);
          })(),
          
          // Process references
          (async () => {
            return await fixWagtailInternalLinks(rawReferences, safeCMS);
          })(),
          
          // Process benefits
          (async () => {
            return await fixWagtailInternalLinks(rawBenefits, safeCMS);
          })(),
          
          // Process instructions
          (async () => {
            return await fixWagtailInternalLinks(rawInstructions, safeCMS);
          })()
        ]);

        if (mounted) {
          const extractedHeadings = extractHeadings(bodyResult);
          const bodyWithIds = addHeadingIds(bodyResult, extractedHeadings);
          
          setProcessedBody(bodyWithIds);
          setProcessedReferences(referencesResult);
          setProcessedBenefits(benefitsResult);
          setProcessedInstructions(instructionsResult);
          setHeadings(extractedHeadings);
        }
      } catch (error) {
        console.error("Error processing content:", error);
      }
    };

    if (rawBody || rawReferences || rawBenefits || rawInstructions) {
      processAllContent();
    }
  }, [rawBody, rawReferences, rawBenefits, rawInstructions, safeCMS, 
      initialProcessedBody, initialProcessedReferences, initialProcessedBenefits, initialProcessedInstructions]);

  /* ✅ Mark content as loaded when hero image loads */
  useEffect(() => {
    if (!topic?.image) {
      setHeroImageLoaded(true);
      setContentLoaded(true);
      return;
    }

    // Use window.Image to avoid conflict
    const imageLoader = typeof window !== 'undefined' ? new window.Image() : null;
    
    if (imageLoader) {
      const imageUrl = getProxiedImageUrl(topic.image) || getAbsoluteImageUrl(topic.image);
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
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">
            Yoga & Exercise Topic Not Found
          </h1>
          <p className="text-yellow-700 mb-6">
            This yoga & exercise topic does not exist or may have been removed.
          </p>
          <Link
            href="/yoga-exercise"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All Yoga & Exercise Topics
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&h=630&q=75";

  const mainImageUrl = initialMainImageUrl || getProxiedImageUrl(topic.image) || getAbsoluteImageUrl(topic.image) || fallbackImage;

  const authorDisplayName = getAuthorDisplayName(topic.author);
  const authorSlug = getAuthorSlug(topic.author);

  const reviewerDisplayName = getAuthorDisplayName(topic.reviewer);
  const reviewerSlug = getReviewerSlug(topic.reviewer);

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
        {/* ✅ Critical CSS for LCP */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* ✅ Preload LCP image */}
        <link 
          rel="preload" 
          as="image" 
          href={mainImageUrl} 
          fetchPriority="high"
        />
        
        {/* ✅ Preconnect to image domains */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        {mainImageUrl.includes('localhost') && (
          <link rel="preconnect" href={new URL(mainImageUrl).origin} />
        )}
      </Head>

      <SEO
        title={`${topic.title} - Yoga & Exercise - Niinfomed`}
        description={topic.summary?.substring(0, 160) || topic.title}
        image={mainImageUrl}
      />

      {/* ✅ Mobile Responsive Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-5 flex flex-wrap gap-1 above-fold">
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/yoga-exercise" className="hover:text-gray-800 transition-colors">
            Yoga & Exercise
          </Link>
          {topic.category?.name && (
            <>
              <span>/</span>
              <span className="text-gray-700 font-medium">
                {topic.category.name}
              </span>
            </>
          )}
        </nav>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* ARTICLE */}
          <article className="min-w-0 above-fold">
            {/* Hero Image - CRITICAL FOR LCP */}
            <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg mb-6 hero-container">
              <img
                src={mainImageUrl}
                alt={topic.title}
                className="w-full h-full object-cover"
                loading="eager" // ✅ Force eager loading for LCP
                decoding="async"
                width={1200}
                height={630}
                onLoad={() => setHeroImageLoaded(true)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              {topic.title}
            </h1>

            {/* Subtitle */}
            {topic.subtitle && (
              <p className="text-base sm:text-xl text-gray-600 mb-4">
                {topic.subtitle}
              </p>
            )}

            {/* Tags + Compact Published */}
            <div className="mb-4">
              <ContentMetadata 
                category={topic.category}
                difficultyLevel={topic.difficulty_level}
                readingTime={topic.reading_time}
                publishedDate={publishedDate}
                updatedDate={updatedDate}
                lastReviewedDate={lastReviewedDate}
                isFallback={isFallback}
              />
            </div>

            {/* Author / Reviewer */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-5 text-sm text-gray-600 mb-6">
              {authorDisplayName && (
                <div>
                  <span className="font-medium">Author:</span>{" "}
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
                <div>
                  <span className="font-medium">Reviewed by:</span>{" "}
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

            {/* Timeline */}
            <div className="mb-6 p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Article Timeline
              </h3>
              <DateDisplay
                publishedDate={publishedDate}
                updatedDate={updatedDate}
                lastReviewedDate={lastReviewedDate}
                isFallback={isFallback}
              />
            </div>

            {/* Summary */}
            {topic.summary && (
              <div className="mb-8 p-5 sm:p-6 bg-purple-50 border border-purple-200 rounded-2xl">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {topic.summary}
                </p>
              </div>
            )}

            {/* TOC Mobile */}
            {headings.length > 0 && heroImageLoaded && (
              <div className="mb-8 lg:hidden">
                <TableOfContents headings={headings} />
              </div>
            )}

            {/* Body */}
            {contentLoaded && processedBody && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  About {topic.title}
                </h2>

                <div
                  className="prose prose-base sm:prose-lg max-w-none
                             prose-img:w-full prose-img:h-auto
                             prose-img:rounded-xl prose-img:shadow
                             prose-headings:scroll-mt-24"
                  dangerouslySetInnerHTML={{ __html: processedBody }}
                />
              </div>
            )}

            {/* Benefits */}
            {contentLoaded && processedBenefits && (
              <div className="mb-8 p-5 sm:p-6 bg-green-50 border border-green-200 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 text-green-800">
                  Health Benefits
                </h3>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: processedBenefits }}
                />
              </div>
            )}

            {/* Instructions */}
            {contentLoaded && processedInstructions && (
              <div className="mb-8 p-5 sm:p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 text-yellow-800">
                  Step-by-Step Instructions
                </h3>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: processedInstructions }}
                />
              </div>
            )}

            {/* References */}
            {contentLoaded && topic.references && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <ReferencesSection references={processedReferences || topic.references || ""} />
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Safety Disclaimer:</strong> This information is for
                educational purposes only. Consult with a qualified yoga instructor
                or healthcare provider before starting any new exercise program,
                especially if you have pre-existing health conditions.
              </p>
            </div>

            {/* Comments - Load last */}
            {contentLoaded && (
              <CommentSection
                contentType="yoga"
                contentSlug={topic.slug}
                pageTitle={topic.title}
              />
            )}
          </article>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {headings.length > 0 && (
                <TableOfContents headings={headings} />
              )}

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
                      lastReviewedDate={lastReviewedDate}
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
                    {topic.category?.name && (
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
                    {relatedTopics.slice(0, 3).map((item) => {
                      const relatedImage =
                        getProxiedImageUrl(item.image) || getAbsoluteImageUrl(item.image) || fallbackImage;

                      return (
                        <Link
                          key={item.id || item.slug}
                          href={`/yoga-exercise/${item.slug}`}
                          className="block group"
                          prefetch={false} // ✅ Don't prefetch related articles
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={relatedImage}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy" // ✅ Lazy load related images
                                decoding="async"
                                width={80}
                                height={64}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = fallbackImage;
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-800 group-hover:text-purple-600 line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {item.summary?.substring(0, 80) ||
                                  "Learn more about yoga"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/yoga-exercise"
                      className="inline-flex w-full justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View All Yoga Topics
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Mobile Related Topics */}
        {relatedTopics?.length > 0 && contentLoaded && (
          <div className="mt-12 lg:hidden">
            <h2 className="text-2xl font-bold mb-6">Related Yoga Topics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTopics.slice(0, 3).map((item) => {
                const relatedImage = getProxiedImageUrl(item.image) || getAbsoluteImageUrl(item.image) || fallbackImage;

                return (
                  <Link
                    key={item.id}
                    href={`/yoga-exercise/${item.slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    prefetch={false}
                  >
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={relatedImage}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
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
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   ✅ STATIC GENERATION WITH PERFORMANCE OPTIMIZATIONS
========================================================= */

export async function getStaticPaths() {
  try {
    const listEndpoints = [
      `${CMS_API_URL}/api/yoga/topics/`,
      `${CMS_API_URL}/api/v1/yoga/topics/`,
      `${CMS_API_URL}/api/v1/yoga/`,
      `${CMS_API_URL}/yoga/topics/`,
    ];

    const { data } = await tryFetchFromMultipleEndpoints(listEndpoints, {
      timeout: 10000,
      params: { limit: 100 },
    });

    const topics = Array.isArray(data) ? data : data?.results || [];

    const paths = topics.map((t) => ({
      params: { slug: t.slug },
    }));

    return { paths, fallback: "blocking" };
  } catch (error) {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const start = Date.now();
    const slug = params.slug;

    const detailEndpoints = [
      `${CMS_API_URL}/api/yoga/topics/${slug}`,
      `${CMS_API_URL}/api/yoga/topics/${slug}/`,
      `${CMS_API_URL}/api/v1/yoga/topics/${slug}`,
      `${CMS_API_URL}/api/v1/yoga/topics/${slug}/`,
      `${CMS_API_URL}/yoga/topics/${slug}`,
      `${CMS_API_URL}/yoga/topics/${slug}/`,
    ];

    const listEndpoints = [
      `${CMS_API_URL}/api/yoga/topics/`,
      `${CMS_API_URL}/api/v1/yoga/topics/`,
      `${CMS_API_URL}/yoga/topics/`,
    ];

    const [{ data: topic }, { data: listData }] = await Promise.all([
      tryFetchFromMultipleEndpoints(detailEndpoints, {
        timeout: 10000,
        params: { lang: "en" },
      }),
      tryFetchFromMultipleEndpoints(listEndpoints, {
        timeout: 10000,
        params: { limit: 6, lang: "en" },
      }),
    ]);

    const allTopics = Array.isArray(listData)
      ? listData
      : listData?.results || [];

    const relatedTopics = allTopics.filter((t) => t.slug !== slug);

    if (!topic) {
      return { notFound: true, revalidate: 60 };
    }

    const ids = extractEmbedImageIds(topic.body || "");
    const imageMap = {};

    await Promise.all(
      ids.map(async (id) => {
        const url = await fetchWagtailImageUrl(id, CMS_API_URL);
        if (url) imageMap[id] = url;
      })
    );

    // Server-side URL for processing
    const safeCMS = CMS_API_URL;
    
    // Pre-process HTML on server-side for better performance
    let processedBody = "";
    let processedReferences = "";
    let processedBenefits = "";
    let processedInstructions = "";
    let headings = [];
    
    if (topic.body) {
      // Fix media URLs
      const fixedMedia = fixMediaUrls(topic.body || "", imageMap);
      
      // Process embed images and internal links in parallel if needed
      const rawBody = fixedMedia;
      const replaced = await replaceEmbedImages(rawBody, safeCMS);
      const linked = await fixWagtailInternalLinks(replaced, safeCMS);
      
      // Extract and add heading IDs
      headings = extractHeadings(linked);
      processedBody = addHeadingIds(linked, headings);
    }
    
    if (topic.references) {
      const fixedRefs = fixMediaUrls(topic.references || "", imageMap);
      processedReferences = await fixWagtailInternalLinks(fixedRefs, safeCMS);
    }
    
    if (topic.benefits) {
      const fixedBenefits = fixMediaUrls(topic.benefits || "", imageMap);
      processedBenefits = await fixWagtailInternalLinks(fixedBenefits, safeCMS);
    }
    
    if (topic.instructions) {
      const fixedInstructions = fixMediaUrls(topic.instructions || "", imageMap);
      processedInstructions = await fixWagtailInternalLinks(fixedInstructions, safeCMS);
    }
    
    // Optimize main image URL
    const mainImageUrl = getProxiedImageUrl(topic.image) || getAbsoluteImageUrl(topic.image);
    
    console.log(`✅ Generated yoga article ${slug} in ${Date.now() - start}ms`);
    
    return {
      props: {
        topic,
        relatedTopics,
        imageMap,
        processedBody,
        processedReferences,
        processedBenefits,
        processedInstructions,
        headings,
        mainImageUrl
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error(`Error fetching yoga article ${params.slug}:`, error);
    return { notFound: true, revalidate: 60 };
  }
}