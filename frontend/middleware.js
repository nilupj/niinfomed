import { NextResponse } from "next/server";

/* 🌍 Country → locale mapping (only where content exists) */
const COUNTRY_LOCALE_MAP = {
  GB: "/uk",
  CN: "/cn",
  FR: "/fr",
  DE: "/de",
  ES: "/es",
};

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
  const isBot = /bot|crawler|spider|google|bing|yandex|baidu/i.test(userAgent);

  /* ==================================================
     🔁 PART A — ARTICLE FALLBACK REDIRECT (EXISTING)
     Applies ONLY to /articles/*
  ================================================== */
  if (pathname.startsWith("/articles/")) {
    const slug = pathname.replace("/articles/", "").replace(/\/$/, "");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_CMS_API_URL || "http://0.0.0.0:8001";

      // 1️⃣ Articles
      const articleRes = await fetch(
        `${apiUrl}/api/articles/${slug}/`,
        { method: "HEAD" }
      );

      if (!articleRes.ok) {
        // 2️⃣ News
        const newsRes = await fetch(
          `${apiUrl}/api/news/${slug}/`,
          { method: "HEAD" }
        );
        if (newsRes.ok) {
          return NextResponse.redirect(
            new URL(`/news/${slug}`, request.url),
            302
          );
        }

        // 3️⃣ Wellness
        const wellnessRes = await fetch(
          `${apiUrl}/api/wellness/topics/${slug}/`,
          { method: "HEAD" }
        );
        if (wellnessRes.ok) {
          return NextResponse.redirect(
            new URL(`/wellness/${slug}`, request.url),
            302
          );
        }

        // 4️⃣ Yoga
        const yogaRes = await fetch(
          `${apiUrl}/api/yoga/topics/${slug}/`,
          { method: "HEAD" }
        );
        if (yogaRes.ok) {
          return NextResponse.redirect(
            new URL(`/yoga-exercise/${slug}`, request.url),
            302
          );
        }

        // 5️⃣ Videos (HEAD not allowed)
        try {
          const videoRes = await fetch(
            `${apiUrl}/api/videos/${slug}/`
          );
          if (videoRes.ok) {
            return NextResponse.redirect(
              new URL(`/videos/${slug}`, request.url),
              302
            );
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error("Article middleware check failed:", err);
    }

    // If article logic matched or failed → STOP here
    return NextResponse.next();
  }

  /* ==================================================
     🌍 PART B — WORLDWIDE COUNTRY REDIRECT (SEO SAFE)
  ================================================== */

  // If URL already has locale → DO NOTHING
  if (/^\/(uk|cn|fr|de|es)(\/|$)/.test(pathname)) {
    return NextResponse.next();
  }

  // Never redirect bots
  if (isBot) {
    return NextResponse.next();
  }

  // Detect country
  const country =
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

  // 302 redirect (SEO safe)
  const url = request.nextUrl.clone();
  url.pathname = `${localePrefix}${pathname}`;

  return NextResponse.redirect(url, 302);
}

/* 🎯 Apply middleware globally */
export const config = {
  matcher: [
    "/articles/:path*",
    "/((?!_next|api|favicon.ico).*)",
  ],
};
