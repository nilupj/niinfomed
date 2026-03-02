import { Html, Head, Main, NextScript } from "next/document";

/**
 * Locale → HTML lang mapping
 * Must match hreflang + middleware
 */
const LOCALE_LANG_MAP = {
  "/uk": "en-GB",
  "/cn": "zh-CN",
  "/fr": "fr-FR",
  "/de": "de-DE",
  "/es": "es-ES",
};


export default function Document(props) {
  const { __NEXT_DATA__ } = props;
  const pathname = __NEXT_DATA__?.page || "";

  // Default language (India / Global)
  let htmlLang = "en-IN";

  // Detect locale from URL path
  for (const prefix in LOCALE_LANG_MAP) {
    if (pathname.startsWith(prefix)) {
      htmlLang = LOCALE_LANG_MAP[prefix];
      break;
    }
  }

  return (
    <Html lang={htmlLang}>
      <Head>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Feather Icons */}
        <script src="https://unpkg.com/feather-icons"></script>

        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Google Discover: allow large previews */}
        <meta name="robots" content="max-image-preview:large" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}