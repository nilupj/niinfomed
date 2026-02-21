import { useRouter } from "next/router";
import Link from "next/link";
import SEO from "../../components/SEO";
import axios from "axios";
import CommentSection from "../../components/CommentSection";
import ReferencesSection from "../../components/ReferencesSection";
import { useState, useEffect } from "react";

import Image from "next/image";
import { useMemo } from "react";

const CMS_API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL ||
  (typeof window !== "undefined"
    ? `http://${window.location.hostname}:8001`
    : "http://127.0.0.1:8001");

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
        `<img src="${proxiedUrl}" alt="Ayurveda Image" class="max-w-full h-auto rounded-xl" loading="lazy" />`
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
   Converts: <a linktype="page" id="75"> -> <a href="/ayurveda/slug">
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

  // Ayurveda and other route mappings
  if (type.includes("ayurveda")) return `/ayurveda/${slug}`;
  if (type.includes("news")) return `/news/${slug}`;
  if (type.includes("article")) return `/articles/${slug}`;
  if (type.includes("condition")) return `/conditions/${slug}`;
  if (type.includes("drug")) return `/drugs/${slug}`;
  if (type.includes("homeopathy")) return `/homeopathy/${slug}`;
  if (type.includes("wellness")) return `/wellness/${slug}`;
  if (type.includes("yoga")) return `/yoga-exercise/${slug}`;

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

    // Replace <a linktype="page" id="75" ...> with <a href="/ayurveda/slug" ...>
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
          alt="Ayurveda Image"
          class="max-w-full w-full h-auto rounded-xl shadow my-4"
          loading="lazy"
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
  return author.name || null;
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
              className="text-gray-700 hover:text-amber-600 hover:underline text-left w-full transition-colors"
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
   MAIN COMPONENT
========================================================= */

export default function AyurvedaDetail({ topic, relatedTopics, imageMap }) {
  const router = useRouter();

  const { publishedDate, updatedDate, lastReviewedDate, isFallback } = useMemo(
    () => extractDatesFromTopic(topic),
    [topic]
  );

  const [processedBody, setProcessedBody] = useState("");
  const [processedReferences, setProcessedReferences] = useState("");
  const safeCMS = useMemo(() => getSafeCMSUrl(), []);

  /* ✅ Content processing hooks */
  const rawBody = useMemo(
    () => fixMediaUrls(topic?.body || "", imageMap || {}),
    [topic?.body, imageMap]
  );

  const rawReferences = useMemo(
    () => fixMediaUrls(topic?.references || "", imageMap || {}),
    [topic?.references, imageMap]
  );

  /* =========================================================
     ✅ Body processing pipeline:
     1) fix media urls (already done in rawBody)
     2) replace embed images
     3) fix internal links (page/document)
  ========================================================= */
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!rawBody) return;

      try {
        // 1) embed images
        const replaced = await replaceEmbedImages(rawBody, safeCMS);

        // 2) internal links clickable
        const linked = await fixWagtailInternalLinks(replaced, safeCMS);

        if (mounted) setProcessedBody(linked);
      } catch (error) {
        console.error("Error processing body:", error);
        if (mounted) setProcessedBody(rawBody);
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
      if (!rawReferences) return;

      try {
        const linked = await fixWagtailInternalLinks(rawReferences, safeCMS);
        if (mounted) setProcessedReferences(linked);
      } catch (error) {
        console.error("Error processing references:", error);
        if (mounted) setProcessedReferences(rawReferences);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [rawReferences, safeCMS]);

  const headings = useMemo(() => extractHeadings(processedBody), [processedBody]);

  const bodyWithIds = useMemo(
    () => addHeadingIds(processedBody, headings),
    [processedBody, headings]
  );

  if (router.isFallback) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">
            Ayurveda Topic Not Found
          </h1>
          <p className="text-yellow-700 mb-6">
            This Ayurveda topic does not exist or may have been removed.
          </p>
          <Link
            href="/ayurveda"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All Ayurveda Topics
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&w=1200&h=630";

  const mainImageUrl = topic.image
    ? getProxiedImageUrl(topic.image) || getAbsoluteImageUrl(topic.image)
    : fallbackImage;

  const authorDisplayName = getAuthorDisplayName(topic.author);
  const authorSlug = getAuthorSlug(topic.author);

  const reviewerDisplayName = getAuthorDisplayName(topic.reviewer);
  const reviewerSlug = getReviewerSlug(topic.reviewer);

  return (
    <>
      <SEO
        title={`${topic.title} - Ayurveda - Niinfomed`}
        description={topic.summary?.substring(0, 160) || topic.title}
        image={mainImageUrl}
      />

      {/* ✅ Mobile Responsive Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-5 flex flex-wrap gap-1">
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/ayurveda" className="hover:text-gray-800 transition-colors">
            Ayurveda
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
          <article className="min-w-0">
            {/* Image */}
            <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-100">
              <Image
                src={mainImageUrl}
                alt={topic.title}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
                priority
                unoptimized={mainImageUrl?.includes("127.0.0.1")}
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
              <DateDisplay
                publishedDate={publishedDate}
                updatedDate={updatedDate}
                lastReviewedDate={lastReviewedDate}
                isFallback={isFallback}
                compact={true}
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
              <div className="mb-8 p-5 sm:p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {topic.summary}
                </p>
              </div>
            )}

            {/* TOC Mobile */}
            {headings.length > 0 && (
              <div className="mb-8 lg:hidden">
                <TableOfContents headings={headings} />
              </div>
            )}

            {/* Body */}
            {processedBody && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  About {topic.title}
                </h2>

                <div
                  className="prose prose-base sm:prose-lg max-w-none
                             prose-img:w-full prose-img:h-auto
                             prose-img:rounded-xl prose-img:shadow
                             prose-headings:scroll-mt-24"
                  dangerouslySetInnerHTML={{ __html: bodyWithIds }}
                />
              </div>
            )}

            {/* References (your component) */}
            {topic.references && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <ReferencesSection references={processedReferences || topic.references || ""} />
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Ayurvedic Disclaimer:</strong> This information is for
                educational purposes only and not a substitute for medical
                advice. Consult a qualified practitioner before starting any
                treatment.
              </p>
            </div>

            {/* Comments */}
            <CommentSection
              contentType="ayurveda"
              contentSlug={topic.slug}
              pageTitle={topic.title}
            />
          </article>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents headings={headings} />

              {relatedTopics?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                  <h3 className="text-lg font-bold mb-4">Related Topics</h3>

                  <div className="space-y-4">
                    {relatedTopics.slice(0, 3).map((item) => {
                      const relatedImage =
                        getProxiedImageUrl(item.image) || getAbsoluteImageUrl(item.image) || fallbackImage;

                      return (
                        <Link
                          key={item.id || item.slug}
                          href={`/ayurveda/${item.slug}`}
                          className="block group"
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={relatedImage}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-800 group-hover:text-amber-600 line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {item.summary?.substring(0, 80) ||
                                  "Learn more about Ayurveda"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/ayurveda"
                      className="inline-flex w-full justify-center items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      View All Ayurveda Topics
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   STATIC GENERATION (LIKE WELLNESS)
========================================================= */

export async function getStaticPaths() {
  try {
    const listEndpoints = [
      `${CMS_API_URL}/api/ayurveda/topics/`,
      `${CMS_API_URL}/api/v1/ayurveda/topics/`,
      `${CMS_API_URL}/api/v1/ayurveda/`,
      `${CMS_API_URL}/ayurveda/topics/`,
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
    const slug = params.slug;

    const detailEndpoints = [
      `${CMS_API_URL}/api/ayurveda/topics/${slug}`,
      `${CMS_API_URL}/api/ayurveda/topics/${slug}/`,
      `${CMS_API_URL}/api/v1/ayurveda/topics/${slug}`,
      `${CMS_API_URL}/api/v1/ayurveda/topics/${slug}/`,
      `${CMS_API_URL}/ayurveda/topics/${slug}`,
      `${CMS_API_URL}/ayurveda/topics/${slug}/`,
    ];

    const listEndpoints = [
      `${CMS_API_URL}/api/ayurveda/topics/`,
      `${CMS_API_URL}/api/v1/ayurveda/topics/`,
      `${CMS_API_URL}/ayurveda/topics/`,
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

    return {
      props: {
        topic,
        relatedTopics,
        imageMap,
      },
      revalidate: 3600,
    };
  } catch (error) {
    return { notFound: true, revalidate: 60 };
  }
}