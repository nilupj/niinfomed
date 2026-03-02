// pages/sitemap.xml.js

/* ----------------------------------
   SAFE OPTIONAL API IMPORTS
-----------------------------------*/

import {
  fetchArticlePaths,
  fetchConditionPaths,
  fetchNewsPaths,
  fetchAuthorPaths,
  fetchReviewerPaths,
  fetchYogaPaths,
  fetchAyurvedaPaths,
  fetchHomeopathyPaths,
} from "../utils/api";

// Optional APIs (prevent build crash if missing)
let fetchWellnessPaths = null;
let fetchDrugPaths = null;
let fetchQuizPaths = null;
let fetchFaqPaths = null;
let fetchImageData = null;

try {
  const api = require("../utils/api");

  fetchWellnessPaths = api.fetchWellnessPaths || null;
  fetchDrugPaths = api.fetchDrugPaths || null;
  fetchQuizPaths = api.fetchQuizPaths || null;
  fetchFaqPaths = api.fetchFaqPaths || null;
  fetchImageData = api.fetchImageData || null;
} catch (err) {
  console.warn("Optional sitemap APIs missing:", err.message);
}

/* ----------------------------------
   SITE CONFIG
-----------------------------------*/

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://niinfomed.com";

/* ----------------------------------
   PRIORITY MAP
-----------------------------------*/

const PRIORITY = {
  pages: "1.0",
  articles: "0.8",
  conditions: "0.9",
  news: "0.8",
  authors: "0.7",
  reviewers: "0.9",
  yoga: "0.8",
  ayurveda: "0.8",
  homeopathy: "0.8",
  wellness: "0.7",
  drugs: "0.9",
  quiz: "0.6",
  faq: "0.6",
};

/* ----------------------------------
   XML GENERATOR
-----------------------------------*/

function generateSiteMap(urls = []) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

${urls.join("")}

</urlset>`;
}

function urlEntry({
  loc,
  lastmod,
  changefreq = "weekly",
  priority = "0.7",
  images = [],
}) {
  return `
<url>
<loc>${loc}</loc>
<lastmod>${lastmod || new Date().toISOString()}</lastmod>
<changefreq>${changefreq}</changefreq>
<priority>${priority}</priority>

${images
  .map(
    (img) => `
<image:image>
<image:loc>${img}</image:loc>
</image:image>`
  )
  .join("")}

</url>`;
}

/* ----------------------------------
   SAFE FETCH HELPER
-----------------------------------*/

async function safeFetch(fetchFn) {
  if (!fetchFn) return [];
  try {
    const data = await fetchFn();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/* ----------------------------------
   SERVER HANDLER
-----------------------------------*/

export async function getServerSideProps({ res, query }) {
  const type = query.type || "index";

  /* ---------- INDEX ---------- */

  if (type === "index") {
    const sitemaps = [
      "pages",
      "articles",
      "conditions",
      "news",
      "authors",
      "reviewers",
      "yoga",
      "ayurveda",
      "homeopathy",
      "wellness",
      "drugs",
      "quiz",
      "faq",
      "images",
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${sitemaps
  .map(
    (sm) => `
<sitemap>
<loc>${SITE_URL}/sitemap-${sm}.xml</loc>
<lastmod>${new Date().toISOString()}</lastmod>
</sitemap>`
  )
  .join("")}

</sitemapindex>`;

    res.setHeader("Content-Type", "text/xml");
    res.write(xml);
    res.end();

    return { props: {} };
  }

  /* ---------- URL BUILDER ---------- */

  const mapSimple = async (fetchFn, basePath, priority) => {
    const data = await safeFetch(fetchFn);

    return data.map((item) =>
      urlEntry({
        loc: `${SITE_URL}${basePath}/${item.slug}`,
        lastmod: item.updated_at,
        priority,
      })
    );
  };

  let urls = [];

  /* ---------- SWITCH ---------- */

  switch (type) {
    case "articles":
      urls = await mapSimple(fetchArticlePaths, "/articles", PRIORITY.articles);
      break;

    case "conditions":
      urls = await mapSimple(
        fetchConditionPaths,
        "/conditions",
        PRIORITY.conditions
      );
      break;

    case "news":
      urls = await mapSimple(fetchNewsPaths, "/news", PRIORITY.news);
      break;

    case "authors":
      urls = await mapSimple(fetchAuthorPaths, "/authors", PRIORITY.authors);
      break;

    case "reviewers":
      urls = await mapSimple(
        fetchReviewerPaths,
        "/reviewers",
        PRIORITY.reviewers
      );
      break;

    case "yoga":
      urls = await mapSimple(fetchYogaPaths, "/yoga", PRIORITY.yoga);
      break;

    case "ayurveda":
      urls = await mapSimple(
        fetchAyurvedaPaths,
        "/ayurveda",
        PRIORITY.ayurveda
      );
      break;

    case "homeopathy":
      urls = await mapSimple(
        fetchHomeopathyPaths,
        "/homeopathy",
        PRIORITY.homeopathy
      );
      break;

    case "wellness":
      urls = await mapSimple(
        fetchWellnessPaths,
        "/wellness",
        PRIORITY.wellness
      );
      break;

    case "drugs":
      urls = await mapSimple(fetchDrugPaths, "/drugs", PRIORITY.drugs);
      break;

    case "quiz":
      urls = await mapSimple(fetchQuizPaths, "/quiz", PRIORITY.quiz);
      break;

    case "faq":
      urls = await mapSimple(fetchFaqPaths, "/faq", PRIORITY.faq);
      break;

    case "images":
      const images = await safeFetch(fetchImageData);

      urls = images.map((img) =>
        urlEntry({
          loc: img.page_url,
          lastmod: img.updated_at,
          images: img.images || [],
        })
      );
      break;

    case "pages":
    default:
      urls = [
        urlEntry({
          loc: SITE_URL,
          changefreq: "daily",
          priority: "1.0",
        }),

        urlEntry({
          loc: `${SITE_URL}/articles`,
          priority: "0.9",
        }),

        urlEntry({
          loc: `${SITE_URL}/conditions`,
          priority: "0.9",
        }),

        urlEntry({
          loc: `${SITE_URL}/news`,
          priority: "0.8",
        }),

        urlEntry({
          loc: `${SITE_URL}/contact`,
          priority: "0.5",
        }),
      ];
  }

  /* ---------- RETURN ---------- */

  const sitemap = generateSiteMap(urls);

  res.setHeader("Content-Type", "text/xml");

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate"
  );

  res.write(sitemap);
  res.end();

  return { props: {} };
}

/* ----------------------------------
   PAGE COMPONENT
-----------------------------------*/

export default function SiteMap() {
  return null;
}