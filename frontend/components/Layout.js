import Head from 'next/head';
import Script from 'next/script';
import Navbar from './Navbar';
import Footer from './Footer';
import { useEffect } from 'react';
import {
  OrganizationStructuredData,
  WebSiteStructuredData,
  NewsMediaOrganizationStructuredData
} from './StructuredData';

export default function Layout({
  children,
  title = 'Niinfomed - Trusted Medical Information & Resources',
  hideNavbar = false
}) {

  const baseUrl = "https://niinfomed.com"; // change to your real domain

  useEffect(() => {
    if (typeof window !== 'undefined' && window.feather) {
      window.feather.replace({
        'stroke-width': 1.5,
        width: 24,
        height: 24
      });
    }
  }, []);

  return (
    <>
      <Head>

        {/* Title */}
        <title>{title}</title>

        {/* Meta */}
        <meta
          name="description"
          content="Trusted source for medical information, health conditions, symptoms, treatments, and wellness advice."
        />

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* hreflang START */}

        {/* English global */}
        <link rel="alternate" href={`${baseUrl}/`} hrefLang="en" />

        {/* Hindi */}
        <link rel="alternate" href={`${baseUrl}/hi/`} hrefLang="hi" />

        {/* English US */}
        <link rel="alternate" href={`${baseUrl}/us/`} hrefLang="en-us" />

        {/* English India */}
        <link rel="alternate" href={`${baseUrl}/in/`} hrefLang="en-in" />

        {/* Default */}
        <link rel="alternate" href={`${baseUrl}/`} hrefLang="x-default" />

        {/* hreflang END */}

      </Head>

      {/* Structured Data */}
      <OrganizationStructuredData />
      <WebSiteStructuredData />
      <NewsMediaOrganizationStructuredData />

      <div className="flex flex-col min-h-screen bg-gray-50">

        {!hideNavbar && <Navbar />}

        <main className="flex-grow">
          {children}
        </main>

        <Footer />

      </div>

      {/* Feather Icons */}
      <Script
        src="https://unpkg.com/feather-icons"
        strategy="afterInteractive"
        onLoad={() => window.feather && window.feather.replace()}
      />

      {/* Google Translate */}
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      <Script id="google-translate-init">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,hi,bn,te,ta,mr,gu,kn,ml,pa,ur',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }
        `}
      </Script>

      <div
        id="google_translate_element"
        className="fixed bottom-4 right-4 z-50"
      />

    </>
  );
}
