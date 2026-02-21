import Head from "next/head";
import { useRouter } from "next/router";

/**
 * Global SEO Component
 * - hreflang (worldwide)
 * - canonical
 * - OpenGraph basic
 * - Twitter basic
 */

const SITE_URL = "https://yourdomain.com"; // 🔴 CHANGE ONLY THIS

// Locale → hreflang mapping
const LOCALES = [
  { prefix: "", hreflang: "en-IN" },   // Default (India / Global)
  { prefix: "/uk", hreflang: "en-GB" },
  { prefix: "/us", hreflang: "en-US" },
  { prefix: "/fr", hreflang: "fr-FR" },
  { prefix: "/de", hreflang: "de-DE" },
  { prefix: "/es", hreflang: "es-ES" },
  { prefix: "/cn", hreflang: "zh-CN" },
];

export default function GlobalSEO({
  title,
  description,
  image = "/og-default.jpg",
  noindex = false,
}) {
  const router = useRouter();

  // Remove query params
  const cleanPath = router.asPath.split("?")[0];

  // Canonical = default language
  const canonicalUrl = `${SITE_URL}${cleanPath}`;

  return (
    <Head>
      {/* Title & Description */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* hreflang for all countries */}
      {LOCALES.map(({ prefix, hreflang }) => (
        <link
          key={hreflang}
          rel="alternate"
          hrefLang={hreflang}
          href={`${SITE_URL}${prefix}${cleanPath}`}
        />
      ))}

      {/* x-default */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE_URL}${cleanPath}`}
      />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${image}`} />
    </Head>
  );
}
