import {
  fetchArticlePaths,
  fetchConditionPaths,
  fetchNewsPaths,
  fetchAuthorPaths,
  fetchReviewerPaths,
  fetchYogaPaths,
  fetchAyurvedaPaths,
  fetchHomeopathyPaths,
  fetchWellnessPaths,
  fetchDrugPaths,
  fetchQuizPaths,
  fetchFaqPaths,
  fetchImageData,
} from '../utils/api';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://Niinfomed.com';

/* ----------------------------------
   PRIORITY MAP (SEO OPTIMIZED)
-----------------------------------*/
const PRIORITY = {
  pages: '1.0',
  articles: '0.8',
  conditions: '0.9',
  news: '0.8',
  authors: '0.7',
  reviewers: '0.9',
  yoga: '0.8',
  ayurveda: '0.8',
  homeopathy: '0.8',
  wellness: '0.7',
  drugs: '0.9',
  quiz: '0.6',
  faq: '0.6',
};

/* ----------------------------------
   URLSET GENERATOR
-----------------------------------*/
function generateSiteMap(urls, type = 'pages') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

${urls.join('')}
</urlset>`;
}

function urlEntry({
  loc,
  lastmod,
  changefreq = 'weekly',
  priority,
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
    .join('')}
</url>`;
}

/* ----------------------------------
   MAIN HANDLER
-----------------------------------*/
export async function getServerSideProps({ res, query }) {
  const { type } = query;

  /* -------- SITEMAP INDEX -------- */
  if (!type || type === 'index') {
    const sitemaps = [
      'pages',
      'articles',
      'conditions',
      'news',
      'authors',
      'reviewers',
      'yoga',
      'ayurveda',
      'homeopathy',
      'wellness',
      'drugs',
      'quiz',
      'faq',
      'images',
    ];

    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sm) => `
  <sitemap>
    <loc>${SITE_URL}/sitemap-${sm}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  )
  .join('')}
</sitemapindex>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(indexXml);
    res.end();
    return { props: {} };
  }

  let urls = [];

  /* -------- CONTENT SITEMAPS -------- */

  const mapSimple = async (fetchFn, basePath, cfg) => {
    const data = await fetchFn();
    return data.map((item) =>
      urlEntry({
        loc: `${SITE_URL}${basePath}/${item.slug}`,
        lastmod: item.updated_at,
        changefreq: cfg.changefreq,
        priority: cfg.priority,
      })
    );
  };

  switch (type) {
    case 'articles':
      urls = await mapSimple(fetchArticlePaths, '/articles', {
        changefreq: 'weekly',
        priority: PRIORITY.articles,
      });
      break;

    case 'conditions':
      urls = await mapSimple(fetchConditionPaths, '/conditions', {
        changefreq: 'weekly',
        priority: PRIORITY.conditions,
      });
      break;

    case 'news':
      urls = await mapSimple(fetchNewsPaths, '/news', {
        changefreq: 'daily',
        priority: PRIORITY.news,
      });
      break;

    case 'authors':
      urls = await mapSimple(fetchAuthorPaths, '/authors', {
        changefreq: 'monthly',
        priority: PRIORITY.authors,
      });
      break;

    case 'reviewers':
      urls = await mapSimple(fetchReviewerPaths, '/reviewers', {
        changefreq: 'monthly',
        priority: PRIORITY.reviewers,
      });
      break;

    case 'yoga':
      urls = await mapSimple(fetchYogaPaths, '/yoga', {
        changefreq: 'weekly',
        priority: PRIORITY.yoga,
      });
      break;

    case 'ayurveda':
      urls = await mapSimple(fetchAyurvedaPaths, '/ayurveda', {
        changefreq: 'weekly',
        priority: PRIORITY.ayurveda,
      });
      break;

    case 'homeopathy':
      urls = await mapSimple(fetchHomeopathyPaths, '/homeopathy', {
        changefreq: 'weekly',
        priority: PRIORITY.homeopathy,
      });
      break;

    case 'wellness':
      urls = await mapSimple(fetchWellnessPaths, '/wellness', {
        changefreq: 'weekly',
        priority: PRIORITY.wellness,
      });
      break;

    case 'drugs':
      urls = await mapSimple(fetchDrugPaths, '/drugs', {
        changefreq: 'monthly',
        priority: PRIORITY.drugs,
      });
      break;

    case 'quiz':
      urls = await mapSimple(fetchQuizPaths, '/quiz', {
        changefreq: 'yearly',
        priority: PRIORITY.quiz,
      });
      break;

    case 'faq':
      urls = await mapSimple(fetchFaqPaths, '/faq', {
        changefreq: 'yearly',
        priority: PRIORITY.faq,
      });
      break;

    /* -------- IMAGE SITEMAP -------- */
    case 'images': {
      const images = await fetchImageData();
      urls = images.map((img) =>
        urlEntry({
          loc: img.page_url,
          lastmod: img.updated_at,
          priority: '0.7',
          images: img.images,
        })
      );
      break;
    }

    /* -------- STATIC PAGES -------- */
    case 'pages':
      urls = [
        urlEntry({ loc: SITE_URL, changefreq: 'daily', priority: '1.0' }),
        urlEntry({ loc: `${SITE_URL}/articles`, priority: '0.9' }),
        urlEntry({ loc: `${SITE_URL}/conditions`, priority: '0.9' }),
        urlEntry({ loc: `${SITE_URL}/news`, priority: '0.8' }),
        urlEntry({ loc: `${SITE_URL}/doctors`, priority: '0.9' }),
        urlEntry({ loc: `${SITE_URL}/contact`, priority: '0.5' }),
      ];
      break;
  }

  const sitemap = generateSiteMap(urls, type);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate'
  );
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function SiteMap() {
  return null;
}
