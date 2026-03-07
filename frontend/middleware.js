// middleware.js
import { NextResponse } from "next/server";

/* 🌍 Country → locale mapping (only where content exists) */
const COUNTRY_LOCALE_MAP = {
  GB: "/uk",
  CN: "/cn",
  FR: "/fr",
  DE: "/de",
  ES: "/es",
};

// Cache for article checks to avoid repeated API calls
const articleCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function checkArticleExists(slug, apiUrl) {
  const cacheKey = `article-${slug}`;
  const cached = articleCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.exists;
  }
  
  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // Check article endpoint first (most likely)
    const articleRes = await fetch(`${apiUrl}/api/articles/${slug}/`, {
      method: "HEAD",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (articleRes.ok) {
      articleCache.set(cacheKey, { exists: 'article', timestamp: Date.now() });
      return 'article';
    }
    
    // Check other content types in parallel
    const checkPromises = [
      fetch(`${apiUrl}/api/news/${slug}/`, { method: "HEAD", signal: AbortSignal.timeout(2000) }).then(r => r.ok ? 'news' : null).catch(() => null),
      fetch(`${apiUrl}/api/wellness/topics/${slug}/`, { method: "HEAD", signal: AbortSignal.timeout(2000) }).then(r => r.ok ? 'wellness' : null).catch(() => null),
      fetch(`${apiUrl}/api/yoga/topics/${slug}/`, { method: "HEAD", signal: AbortSignal.timeout(2000) }).then(r => r.ok ? 'yoga' : null).catch(() => null),
      fetch(`${apiUrl}/api/videos/${slug}/`, { signal: AbortSignal.timeout(2000) }).then(r => r.ok ? 'videos' : null).catch(() => null)
    ];
    
    const results = await Promise.allSettled(checkPromises);
    const foundType = results.find(r => r.status === 'fulfilled' && r.value)?.value;
    
    articleCache.set(cacheKey, { exists: foundType || false, timestamp: Date.now() });
    return foundType || false;
    
  } catch (error) {
    console.error(`Article check failed for ${slug}:`, error.message);
    articleCache.set(cacheKey, { exists: false, timestamp: Date.now() });
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  /* ----------------------------------
     1️⃣ Ignore Next internals / static
  ---------------------------------- */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  /* ----------------------------------
     2️⃣ BOT detection (SEO CRITICAL)
  ---------------------------------- */
  const userAgent = request.headers.get("user-agent") || "";
  const isBot = /bot|crawler|spider|googlebot|bingbot|yandexbot|baiduspider|facebookexternalhit|twitterbot/i.test(userAgent);

  /* ==================================================
     🔁 PART A — ARTICLE FALLBACK REDIRECT (EXISTING)
     Applies ONLY to /articles/*
  ================================================== */
  if (pathname.startsWith("/articles/")) {
    const slug = pathname.replace("/articles/", "").replace(/\/$/, "");
    
    // Don't process empty slugs
    if (!slug) return NextResponse.next();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_CMS_API_URL || "https://api.niinfomed.com";
      
      const foundType = await checkArticleExists(slug, apiUrl);
      
      if (foundType && foundType !== 'article') {
        const redirectPath = foundType === 'news' ? '/news/' :
                            foundType === 'wellness' ? '/wellness/' :
                            foundType === 'yoga' ? '/yoga-exercise/' :
                            foundType === 'videos' ? '/videos/' : null;
        
        if (redirectPath) {
          return NextResponse.redirect(
            new URL(`${redirectPath}${slug}`, request.url),
            302 // Temporary redirect
          );
        }
      }
      
      // If article exists or no match found, continue
      return NextResponse.next();
      
    } catch (err) {
      console.error("Article middleware check failed:", err);
      return NextResponse.next(); // Continue on error
    }
  }

  /* ==================================================
     🌍 PART B — WORLDWIDE COUNTRY REDIRECT (SEO SAFE)
  ================================================== */

  // Skip for API routes and static files
  if (pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // If URL already has locale → DO NOTHING
  if (/^\/(uk|cn|fr|de|es)(\/|$)/.test(pathname)) {
    return NextResponse.next();
  }

  // Never redirect bots (SEO critical)
  if (isBot) {
    return NextResponse.next();
  }

  // Detect country from Vercel/Cloudflare headers
  const country = request.headers.get("x-vercel-ip-country") ||
                 request.headers.get("cf-ipcountry") ||
                 request.geo?.country ||
                 null;

  if (!country) {
    return NextResponse.next();
  }

  const localePrefix = COUNTRY_LOCALE_MAP[country];

  // Rest of world → default
  if (!localePrefix) {
    return NextResponse.next();
  }

  // Don't redirect if it's the root path (to avoid redirect loops)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 302 redirect (SEO safe) with locale prefix
  const url = request.nextUrl.clone();
  url.pathname = `${localePrefix}${pathname}`;
  
  // Preserve query parameters
  url.search = request.nextUrl.search;

  return NextResponse.redirect(url, 302);
}

/* 🎯 Apply middleware globally */
export const config = {
  matcher: [
    "/articles/:path*",
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};