import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { NextSeo } from "next-seo";
import Head from "next/head";

import ShareButton from "../../components/ShareButton";
import CommentSection from "../../components/CommentSection";

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

/* ✅ Helper: Fix all CMS media URLs inside HTML (src + srcset) */
const fixMediaUrls = (html) => {
  if (!html) return "";

  return (
    html
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

      .replace(
        /srcset="http:\/\/0\.0\.0\.0:8001\/media\//g,
        'srcset="/cms-media/'
      )
      .replace(
        /srcset='http:\/\/0\.0\.0\.0:8001\/media\//g,
        "srcset='/cms-media/"
      )
      .replace(
        /srcset="http:\/\/127\.0\.0\.1:8001\/media\//g,
        'srcset="/cms-media/'
      )
      .replace(
        /srcset='http:\/\/127\.0\.0\.1:8001\/media\//g,
        "srcset='/cms-media/"
      )
      .replace(
        /srcset="http:\/\/localhost:8001\/media\//g,
        'srcset="/cms-media/'
      )
      .replace(
        /srcset='http:\/\/localhost:8001\/media\//g,
        "srcset='/cms-media/"
      )

      .replace(/\/cms-media\/media\//g, "/cms-media/")
  );
};

/* ✅ Helper: Single image URL fix */
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
        `<img src="${proxiedUrl}" alt="Homeopathy Image" class="max-w-full h-auto rounded-xl" loading="lazy" width="800" height="450" />`
      );
    }

    return updatedHtml;
  } catch (err) {
    console.error("replaceEmbedImages error:", err);
    return html;
  }
};

/* =========================================================
   ✅ FIX WAGTAIL INTERNAL LINKS (CLICKABLE FIX)
   Converts: <a linktype="page" id="75"> -> <a href="/homeopathy/slug">
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

  if (type.includes("homeopathy")) return `/homeopathy/${slug}`;
  if (type.includes("ayurveda")) return `/ayurveda/${slug}`;
  if (type.includes("article")) return `/articles/${slug}`;
  if (type.includes("news")) return `/news/${slug}`;
  if (type.includes("condition")) return `/conditions/${slug}`;
  if (type.includes("drug")) return `/drugs/${slug}`;
  if (type.includes("wellness")) return `/wellness/${slug}`;
  if (type.includes("yoga")) return `/yoga-exercise/${slug}`;

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
   ✅ Author/Reviewer Helper Functions
========================================================= */
const getAuthorDisplayName = (author) => {
  if (!author) return "Niinfomed Staff";
  return author.name || "Niinfomed Staff";
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

const getReviewerDisplayName = (reviewer) => {
  if (!reviewer) return null;
  return reviewer.name || null;
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
   ✅ PROCESS HTML WITH INTERNAL LINKS
========================================================= */
const processHtmlContent = async (html, safeBaseUrl) => {
  try {
    if (!html) return html;
    
    let processedHtml = html;
    
    // 1. Fix media URLs
    processedHtml = fixMediaUrls(processedHtml);
    
    // 2. Replace embed images
    processedHtml = await replaceEmbedImages(processedHtml, safeBaseUrl);
    
    // 3. Fix Wagtail internal links
    processedHtml = await fixWagtailInternalLinks(processedHtml, safeBaseUrl);
    
    return processedHtml;
  } catch (error) {
    console.error("Error processing HTML content:", error);
    return html;
  }
};

/* =========================================================
   ✅ TABLE OF CONTENTS COMPONENT
========================================================= */
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
    <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
      <h3 className="text-lg font-bold mb-4">On this page</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((h, idx) => (
          <li
            key={`${h.text}-${idx}`}
            className={h.level === 3 ? "ml-4" : ""}
          >
            <button
              onClick={() => scrollToHeading(slugify(h.text))}
              className="text-neutral-700 hover:text-primary hover:underline text-left w-full transition-colors"
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
   ✅ Skeleton Loader Component
========================================================= */
const SkeletonLoader = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="animate-pulse">
      <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
      <div className="h-96 bg-neutral-200 rounded mb-8"></div>
    </div>
  </div>
);

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */
export default function HomeopathyTopicPage({ 
  topic: initialTopic, 
  relatedTopics: initialRelated,
  processedBody: initialProcessedBody,
  processedRemedyDetails: initialProcessedRemedyDetails,
  processedIndications: initialProcessedIndications,
  processedDosage: initialProcessedDosage,
  processedPrecautions: initialProcessedPrecautions,
  processedReferences: initialProcessedReferences,
  mainImageUrl: initialMainImageUrl 
}) {
  const router = useRouter();
  const { slug } = router.query;

  const [pageTopic, setPageTopic] = useState(initialTopic);
  const [relatedTopics, setRelatedTopics] = useState(initialRelated);
  const [loading, setLoading] = useState(!initialTopic);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  /* ✅ Store processed HTML */
  const [finalBodyHtml, setFinalBodyHtml] = useState(initialProcessedBody || "");
  const [finalRemedyDetailsHtml, setFinalRemedyDetailsHtml] = useState(initialProcessedRemedyDetails || "");
  const [finalIndicationsHtml, setFinalIndicationsHtml] = useState(initialProcessedIndications || "");
  const [finalDosageHtml, setFinalDosageHtml] = useState(initialProcessedDosage || "");
  const [finalPrecautionsHtml, setFinalPrecautionsHtml] = useState(initialProcessedPrecautions || "");
  const [finalReferencesHtml, setFinalReferencesHtml] = useState(initialProcessedReferences || "");

  const safeCMS = useMemo(() => getSafeCMSUrl(), []);

  /* ✅ Process all content sections with internal links */
  useEffect(() => {
    if (initialProcessedBody && initialProcessedRemedyDetails && 
        initialProcessedIndications && initialProcessedDosage && 
        initialProcessedPrecautions && initialProcessedReferences) {
      setContentLoaded(true);
      return;
    }

    let mounted = true;

    const processAllSections = async () => {
      if (!pageTopic) return;

      try {
        // Process all sections in parallel
        const sections = [
          { key: 'body', content: pageTopic.body, setter: setFinalBodyHtml },
          { key: 'remedy_details', content: pageTopic.remedy_details, setter: setFinalRemedyDetailsHtml },
          { key: 'indications', content: pageTopic.indications, setter: setFinalIndicationsHtml },
          { key: 'dosage', content: pageTopic.dosage, setter: setFinalDosageHtml },
          { key: 'precautions', content: pageTopic.precautions, setter: setFinalPrecautionsHtml },
          { key: 'references', content: pageTopic.references, setter: setFinalReferencesHtml }
        ];

        const results = await Promise.all(
          sections.map(async ({ key, content }) => {
            if (content) {
              try {
                const processed = await processHtmlContent(content, safeCMS);
                return { key, content: processed };
              } catch (error) {
                console.error(`Error processing ${key}:`, error);
                return { key, content: fixMediaUrls(content || "") };
              }
            }
            return { key, content: "" };
          })
        );

        if (mounted) {
          results.forEach(({ key, content }) => {
            switch (key) {
              case 'body': setFinalBodyHtml(content); break;
              case 'remedy_details': setFinalRemedyDetailsHtml(content); break;
              case 'indications': setFinalIndicationsHtml(content); break;
              case 'dosage': setFinalDosageHtml(content); break;
              case 'precautions': setFinalPrecautionsHtml(content); break;
              case 'references': setFinalReferencesHtml(content); break;
            }
          });
          setContentLoaded(true);
        }
      } catch (err) {
        console.error("Error processing content sections:", err);
        // Fallback to basic media URL fixes
        if (mounted) {
          if (pageTopic.body) setFinalBodyHtml(fixMediaUrls(pageTopic.body || ""));
          setContentLoaded(true);
        }
      }
    };

    processAllSections();

    return () => {
      mounted = false;
    };
  }, [pageTopic, safeCMS, initialProcessedBody, initialProcessedRemedyDetails, 
      initialProcessedIndications, initialProcessedDosage, initialProcessedPrecautions, 
      initialProcessedReferences]);

  /* ✅ Mark content as loaded when hero image loads */
  useEffect(() => {
    if (!pageTopic?.image) {
      setHeroImageLoaded(true);
      setContentLoaded(true);
      return;
    }

    const imageLoader = typeof window !== 'undefined' ? new window.Image() : null;
    
    if (imageLoader) {
      const imageUrl = initialMainImageUrl || getProxiedImageUrl(pageTopic.image);
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
  }, [pageTopic?.image, initialMainImageUrl]);

  const headings = useMemo(
    () => extractHeadings(finalBodyHtml),
    [finalBodyHtml]
  );

  const bodyWithIds = useMemo(
    () => addHeadingIds(finalBodyHtml, headings),
    [finalBodyHtml, headings]
  );

  useEffect(() => {
    if (!initialTopic && slug) {
      fetchTopic();
    } else {
      setLoading(false);
    }
  }, [slug, initialTopic]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${safeCMS}/api/homeopathy/topics/${slug}/`);
      if (!res.ok) throw new Error("Topic not found");
      const data = await res.json();
      setPageTopic(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!pageTopic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-800 mb-3">
            Homeopathy Topic Not Found
          </h1>
          <p className="text-yellow-700 mb-6">
            This homeopathy topic does not exist or may have been removed.
          </p>
          <Link
            href="/homeopathy"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            ← Browse All Homeopathy Topics
          </Link>
        </div>
      </div>
    );
  }

  // SEO values
  const pageTitle = `${pageTopic.title} - Homeopathic Remedies`;
  const pageDescription =
    pageTopic.summary || "Read homeopathic remedy details, dosage and uses.";

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${
          router.asPath
        }`;

  const fallbackImage = "https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&w=1200&h=630&q=75";
  const ogImage = initialMainImageUrl || getProxiedImageUrl(pageTopic.image) || fallbackImage;

  // Get author and reviewer info
  const authorDisplayName = getAuthorDisplayName(pageTopic.author);
  const authorSlug = getAuthorSlug(pageTopic.author);
  const reviewerDisplayName = getReviewerDisplayName(pageTopic.reviewer);
  const reviewerSlug = getReviewerSlug(pageTopic.reviewer);

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
          href={ogImage} 
          fetchPriority="high"
        />
        
        {/* ✅ Preconnect to image domains */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        {ogImage.includes('localhost') && (
          <link rel="preconnect" href={new URL(ogImage).origin} />
        )}
      </Head>

      <NextSeo
        title={pageTitle}
        description={pageDescription}
        canonical={pageUrl}
        openGraph={{
          url: pageUrl,
          title: pageTitle,
          description: pageDescription,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: pageTopic.title,
            },
          ],
          siteName: "HealthInfo",
          type: "article",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-500 mb-5 flex flex-wrap gap-1 above-fold">
          <Link href="/" className="hover:text-neutral-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/homeopathy" className="hover:text-neutral-800 transition-colors">
            Homeopathy
          </Link>
          {pageTopic.category?.name && (
            <>
              <span>/</span>
              <span className="text-neutral-700 font-medium">
                {pageTopic.category.name}
              </span>
            </>
          )}
        </nav>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* MAIN CONTENT */}
          <article className="min-w-0 above-fold">
            {/* Hero Image - CRITICAL FOR LCP */}
            <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg mb-6 hero-container">
              <img
                src={ogImage}
                alt={pageTopic.title}
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
              {pageTopic.title}
            </h1>

            {/* Subtitle */}
            {pageTopic.subtitle && (
              <p className="text-base sm:text-xl text-neutral-600 mb-4">
                {pageTopic.subtitle}
              </p>
            )}

            {/* Category and Potency */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {pageTopic.category && (
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {pageTopic.category.name}
                </span>
              )}
              {pageTopic.potency && (
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Potency: {pageTopic.potency}
                </span>
              )}
            </div>

            {/* Author / Reviewer */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-5 text-sm text-neutral-600 mb-6">
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
                    <span className="font-semibold text-neutral-700">
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
                    <span className="font-semibold text-neutral-700">
                      {reviewerDisplayName}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="mb-6">
              <ShareButton
                title={pageTopic.title}
                url={pageUrl}
              />
            </div>

            {/* Summary */}
            {pageTopic.summary && (
              <div className="mb-8 p-5 sm:p-6 bg-green-50 border border-green-200 rounded-2xl">
                <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                  {pageTopic.summary}
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
            {contentLoaded && finalBodyHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  About {pageTopic.title}
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

            {/* Remedy Details */}
            {contentLoaded && finalRemedyDetailsHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  Remedy Details
                </h2>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: finalRemedyDetailsHtml }}
                />
              </div>
            )}

            {/* Indications */}
            {contentLoaded && finalIndicationsHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  Indications
                </h2>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: finalIndicationsHtml }}
                />
              </div>
            )}

            {/* Dosage */}
            {contentLoaded && finalDosageHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  Dosage & Administration
                </h2>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: finalDosageHtml }}
                />
              </div>
            )}

            {/* Precautions */}
            {contentLoaded && finalPrecautionsHtml && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  Precautions & Safety
                </h2>
                <div
                  className="prose prose-base sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: finalPrecautionsHtml }}
                />
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Homeopathic Disclaimer:</strong> This information is for
                educational purposes only and not a substitute for medical
                advice. Always consult a qualified homeopathic practitioner
                before starting any treatment.
              </p>
            </div>

            {/* References */}
            {contentLoaded && finalReferencesHtml ? (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">References</h3>
                <div className="bg-neutral-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: finalReferencesHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">References</h3>
                <div className="bg-neutral-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <p className="text-sm text-neutral-600">
                    Compiled by the HealthInfo Homeopathy Team
                  </p>
                </div>
              </div>
            )}

            {/* Comments - Load last */}
            {contentLoaded && (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <CommentSection
                  contentType="homeopathy"
                  contentSlug={pageTopic.slug}
                  pageTitle={pageTopic.title}
                />
              </div>
            )}
          </article>

          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents headings={headings} />

              {relatedTopics?.length > 0 && contentLoaded && (
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
                  <h3 className="text-lg font-bold mb-4">Related Remedies</h3>

                  <div className="space-y-4">
                    {relatedTopics.slice(0, 3).map((item) => {
                      const relatedImage = getProxiedImageUrl(item.image) || fallbackImage;

                      return (
                        <Link
                          key={item.id || item.slug}
                          href={`/homeopathy/${item.slug}`}
                          className="block group"
                          prefetch={false}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                              <img
                                src={relatedImage}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
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
                              <p className="font-semibold text-sm text-neutral-800 group-hover:text-green-600 line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                                {item.summary?.substring(0, 80) ||
                                  "Learn more about this remedy"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/homeopathy"
                      className="inline-flex w-full justify-center items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View All Homeopathy Remedies
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Related Topics */}
        {relatedTopics.length > 0 && contentLoaded && (
          <section className="mt-12 pt-12 border-t border-neutral-200">
            <h2 className="text-2xl font-bold mb-6">Related Remedies</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTopics.map((related) => {
                const relatedImage = getProxiedImageUrl(related.image) || fallbackImage;
                
                return (
                  <div key={related.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/homeopathy/${related.slug}`} prefetch={false}>
                      <div className="relative h-40 w-full">
                        <img
                          src={relatedImage}
                          alt={related.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={240}
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {related.summary || "Learn more about this remedy"}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
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
    const response = await axios.get(`${CMS_API_URL}/api/homeopathy/topics/`);
    const paths = response.data.map((topic) => ({
      params: { slug: topic.slug },
    }));
    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error("Error fetching homeopathy topics for paths:", error);
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const start = Date.now();
    
    const [topicRes, allTopicsRes] = await Promise.allSettled([
      axios.get(`${CMS_API_URL}/api/homeopathy/topics/${params.slug}`, {
        params: { lang: "en" },
      }),
      axios.get(`${CMS_API_URL}/api/homeopathy/topics/`, {
        params: { limit: 6, lang: "en" },
      }),
    ]);

    const topic = topicRes.status === "fulfilled" ? topicRes.value.data : null;
    const allTopics =
      allTopicsRes.status === "fulfilled" ? allTopicsRes.value.data : [];

    if (!topic) {
      return { notFound: true, revalidate: 60 };
    }

    // Server-side URL for processing
    const safeCMS = CMS_API_URL;
    
    // Process content on server-side for better performance
    let processedBody = "";
    let processedRemedyDetails = "";
    let processedIndications = "";
    let processedDosage = "";
    let processedPrecautions = "";
    let processedReferences = "";
    
    // Process all sections in parallel
    const sections = [
      { key: 'body', content: topic.body },
      { key: 'remedy_details', content: topic.remedy_details },
      { key: 'indications', content: topic.indications },
      { key: 'dosage', content: topic.dosage },
      { key: 'precautions', content: topic.precautions },
      { key: 'references', content: topic.references }
    ];

    const processingPromises = sections.map(async ({ key, content }) => {
      if (content) {
        try {
          let processed = content;
          // Fix media URLs
          processed = fixMediaUrls(processed);
          // Replace embed images
          processed = await replaceEmbedImages(processed, safeCMS);
          // Fix Wagtail internal links
          processed = await fixWagtailInternalLinks(processed, safeCMS);
          return { key, content: processed };
        } catch (error) {
          console.error(`Error processing ${key}:`, error);
          return { key, content: fixMediaUrls(content || "") };
        }
      }
      return { key, content: "" };
    });

    const results = await Promise.all(processingPromises);
    
    results.forEach(({ key, content }) => {
      switch (key) {
        case 'body': processedBody = content; break;
        case 'remedy_details': processedRemedyDetails = content; break;
        case 'indications': processedIndications = content; break;
        case 'dosage': processedDosage = content; break;
        case 'precautions': processedPrecautions = content; break;
        case 'references': processedReferences = content; break;
      }
    });
    
    const relatedTopics = allTopics.filter((t) => t.slug !== params.slug);
    
    // Optimize main image URL
    const mainImageUrl = getProxiedImageUrl(topic.image);

    console.log(`✅ Generated homeopathy article ${params.slug} in ${Date.now() - start}ms`);

    return { 
      props: { 
        topic, 
        relatedTopics,
        processedBody,
        processedRemedyDetails,
        processedIndications,
        processedDosage,
        processedPrecautions,
        processedReferences,
        mainImageUrl
      }, 
      revalidate: 3600 
    };
  } catch (error) {
    console.error("Error fetching homeopathy topic:", error);
    return { 
      props: { 
        topic: null, 
        relatedTopics: [],
        processedBody: "",
        processedRemedyDetails: "",
        processedIndications: "",
        processedDosage: "",
        processedPrecautions: "",
        processedReferences: "",
        mainImageUrl: ""
      }, 
      revalidate: 60 
    };
  }
}