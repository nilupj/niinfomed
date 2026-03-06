// pages/drugs/[slug].js
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import {
  DrugStructuredData,
  BreadcrumbStructuredData,
  MedicalWebPageStructuredData,
} from '../../components/StructuredData';
import CommentSection from '../../components/CommentSection';
import ReferencesSection from '../../components/ReferencesSection';
import {
  fetchDrugBySlug,
  fetchDrugPaths,
  getProxiedImageUrl,
  fixWagtailInternalLinks,
  replaceEmbedImages,
  tryEndpoints,
  getSafeCMSUrl,
  parseDateSafe,
  formatDateDisplay,
  getTimeAgo
} from '../../utils/api';

/* =========================================================
   ✅ DATE FUNCTIONS
========================================================= */

const createFallbackDates = () => {
  const now = new Date();
  const publishedDate = new Date(now);
  publishedDate.setDate(now.getDate() - 60);
  const updatedDate = new Date(now);
  updatedDate.setDate(now.getDate() - 30);
  const lastReviewedDate = new Date(now);
  lastReviewedDate.setDate(now.getDate() - 45);

  return {
    published: publishedDate,
    updated: updatedDate,
    lastReviewed: lastReviewedDate,
    isFallback: true
  };
};

const extractDatesFromDrug = (drug) => {
  if (!drug) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true
    };
  }

  const dateFieldGroups = {
    published: [
      'first_published_at', 'first_published_date', 'published_date',
      'publish_date', 'published_at', 'publication_date', 'created_at',
      'created_date', 'date_published', 'date', 'approval_date'
    ],
    updated: [
      'last_published_at', 'last_published_date', 'updated_at',
      'updated_date', 'modified_at', 'modified_date', 'last_updated',
      'last_modified', 'update_date', 'last_revised'
    ],
    reviewed: [
      'last_reviewed', 'last_reviewed_date', 'reviewed_at',
      'review_date', 'medical_review_date', 'last_medical_review'
    ]
  };

  const findDateFromFields = (fields) => {
    for (const field of fields) {
      if (drug[field]) {
        const date = parseDateSafe(drug[field]);
        if (date) return date;
      }
    }
    return null;
  };

  const publishedDate = findDateFromFields(dateFieldGroups.published);
  const updatedDate = findDateFromFields(dateFieldGroups.updated);
  const lastReviewedDate = findDateFromFields(dateFieldGroups.reviewed);

  if (!publishedDate && !updatedDate && !lastReviewedDate) {
    const fallback = createFallbackDates();
    return {
      publishedDate: fallback.published,
      updatedDate: fallback.updated,
      lastReviewedDate: fallback.lastReviewed,
      isFallback: true
    };
  }

  const finalPublishedDate = publishedDate || updatedDate || lastReviewedDate;
  const finalUpdatedDate = updatedDate || publishedDate || lastReviewedDate;
  const finalReviewedDate = lastReviewedDate || updatedDate || publishedDate;

  return {
    publishedDate: finalPublishedDate,
    updatedDate: finalUpdatedDate,
    lastReviewedDate: finalReviewedDate,
    isFallback: false
  };
};

const isDrugUpdated = (publishedDate, updatedDate) => {
  if (!publishedDate || !updatedDate) return false;

  try {
    if (publishedDate.getTime() === updatedDate.getTime()) return false;
    
    const diffTime = Math.abs(updatedDate - publishedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 7;
  } catch (error) {
    return false;
  }
};

/* =========================================================
   ✅ DateDisplay Component
========================================================= */

const DateDisplay = ({
  publishedDate,
  updatedDate,
  lastReviewedDate,
  isFallback = false,
  compact = false,
  className = ""
}) => {
  const isUpdated = isDrugUpdated(publishedDate, updatedDate);

  if (compact) {
    return (
      <div 
        className={`flex flex-wrap items-center gap-2 text-sm text-gray-600 ${className}`}
        aria-label="Publication dates"
      >
        <svg 
          className="w-4 h-4 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>

        <span className="font-medium">Published:</span>
        <time 
          dateTime={publishedDate?.toISOString() || ''}
          className="whitespace-nowrap"
        >
          {formatDateDisplay(publishedDate)}
        </time>

        {isUpdated && (
          <span 
            className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200"
            aria-label="This information has been updated"
          >
            Updated
          </span>
        )}

        {isFallback && (
          <span 
            className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
            aria-label="Estimated dates based on typical publication timelines"
          >
            Estimated
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Drug information timeline">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Published Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Publication information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Information Published</h4>
              <p className="text-xs text-gray-500">When this drug info was first published</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={publishedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(publishedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(publishedDate)}
            </span>
          </div>
        </div>

        {/* Updated Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Update information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className={`w-10 h-10 rounded-full ${isUpdated ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}
              aria-hidden="true"
            >
              <svg 
                className={`w-5 h-5 ${isUpdated ? 'text-green-600' : 'text-gray-600'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {isUpdated ? 'Updated' : 'Last Updated'}
              </h4>
              <p className="text-xs text-gray-500">
                {isUpdated ? 'Most recent update' : 'Last modification'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={updatedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(updatedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(updatedDate)}
            </span>
          </div>
        </div>

        {/* Reviewed Date */}
        <div 
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          role="article"
          aria-label="Medical review information"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Medically Reviewed</h4>
              <p className="text-xs text-gray-500">Last medical review date</p>
            </div>
          </div>

          <div className="text-center">
            <time
              dateTime={lastReviewedDate?.toISOString() || ''}
              className="text-lg font-bold text-gray-800 block"
            >
              {formatDateDisplay(lastReviewedDate)}
            </time>
            <span className="text-sm text-gray-500 mt-1 block">
              {getTimeAgo(lastReviewedDate)}
            </span>
          </div>
        </div>
      </div>

      {isFallback && (
        <div 
          className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
          role="alert"
          aria-label="Estimated dates notice"
        >
          <div className="flex items-start gap-3">
            <svg 
              className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-yellow-800 mb-1">Estimated Dates</h5>
              <p className="text-sm text-yellow-700">
                This drug information was recently added to our database. The dates shown are estimated
                based on typical publication timelines for drug information.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   ✅ Loading Skeleton Component
========================================================= */
const DrugPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-6xl animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
    
    <div className="mb-8">
      <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   ✅ Table of Contents Component
========================================================= */
const TableOfContents = ({ sections }) => {
  if (!sections || sections.length === 0) return null;

  const scrollToSection = useCallback((id) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 90;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
      <h3 className="text-lg font-bold mb-3">On this page</h3>
      <nav aria-label="Table of contents">
        <ul className="space-y-2 text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className="text-gray-700 hover:text-blue-600 hover:underline text-left w-full transition-colors"
                aria-label={`Scroll to ${section.title}`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

/* =========================================================
   ✅ MAIN COMPONENT
========================================================= */

export default function DrugPage({ drug: initialDrug, error: initialError }) {
  const router = useRouter();
  const { slug } = router.query;

  const [drug, setDrug] = useState(initialDrug || null);
  const [loading, setLoading] = useState(!initialDrug);
  const [error, setError] = useState(initialError || null);
  const [fixedContent, setFixedContent] = useState({
    overview: '',
    uses: '',
    dosage: '',
    sideEffects: '',
    warnings: ''
  });

  const safeApiUrl = useMemo(() => getSafeCMSUrl(), []);

  const { publishedDate, updatedDate, lastReviewedDate, isFallback } = useMemo(
    () => extractDatesFromDrug(drug),
    [drug]
  );

  const drugName = useMemo(() => {
    if (!drug) return 'Drug Information';
    
    const parts = [];
    if (drug.generic_name) parts.push(drug.generic_name);
    if (drug.brand_names) parts.push(`(${drug.brand_names})`);
    
    return parts.length > 0 ? parts.join(' ') : drug.title || 'Unnamed Drug';
  }, [drug]);

  // Define content sections for TOC
  const contentSections = useMemo(() => {
    const sections = [
      { id: "overview", title: "Overview", content: fixedContent.overview },
      { id: "uses", title: "Uses & Indications", content: fixedContent.uses },
      { id: "dosage", title: "Dosage & Administration", content: fixedContent.dosage },
      { id: "side-effects", title: "Side Effects & Precautions", content: fixedContent.sideEffects },
    ];
    
    if (fixedContent.warnings) {
      sections.push({ id: "warnings", title: "Important Warnings", content: fixedContent.warnings });
    }
    
    return sections.filter(section => section.content && section.content.trim() !== '');
  }, [fixedContent]);

  const seoData = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://niinfomed.com';
    
    const description = drug?.overview 
      ? drug.overview.replace(/<[^>]*>/g, '').substring(0, 155) + '...'
      : `Complete information about ${drugName} including uses, dosage, side effects, precautions, and warnings. Consult your healthcare provider for medical advice.`;

    return {
      title: `${drugName} - Comprehensive Drug Information, Dosage, Side Effects | Niinfomed`,
      description,
      canonical: `${baseUrl}/drugs/${slug}`,
      openGraph: {
        url: `${baseUrl}/drugs/${slug}`,
        title: `${drugName} - Drug Information | Niinfomed`,
        description,
        images: drug?.image ? [
          {
            url: getProxiedImageUrl(drug.image),
            width: 1200,
            height: 630,
            alt: drugName,
          },
        ] : [],
        siteName: 'Niinfomed',
        type: 'article',
        article: {
          publishedTime: publishedDate?.toISOString(),
          modifiedTime: updatedDate?.toISOString(),
          authors: drug?.author ? [drug.author.name] : [],
          tags: ['drug', 'medication', 'pharmacy', ...(drug?.drug_class ? [drug.drug_class] : [])],
        },
      }
    };
  }, [drug, drugName, slug, publishedDate, updatedDate]);

  // Fetch drug data if not provided
  useEffect(() => {
    if (!initialDrug && slug) {
      const loadDrug = async () => {
        setLoading(true);
        try {
          console.log("📡 Fetching drug data from Oracle CMS...");
          const drugData = await fetchDrugBySlug(slug);
          
          if (drugData) {
            setDrug(drugData);
            setError(null);
          } else {
            throw new Error('Drug not found');
          }
        } catch (err) {
          console.error('Error fetching drug:', err);
          setError(`Failed to load drug information: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      loadDrug();
    }
  }, [slug, initialDrug]);

  // Fix content links and media
  useEffect(() => {
    if (!drug) return;

    const fixContent = async () => {
      try {
        const contentSections = {
          overview: drug.overview || '',
          uses: drug.uses || '',
          dosage: drug.dosage || '',
          sideEffects: drug.side_effects || '',
          warnings: drug.warnings || ''
        };

        const fixedSections = await Promise.all(
          Object.entries(contentSections).map(async ([key, content]) => {
            const withImages = await replaceEmbedImages(content, safeApiUrl);
            const withLinks = await fixWagtailInternalLinks(withImages, safeApiUrl);
            return [key, withLinks];
          })
        );

        setFixedContent(Object.fromEntries(fixedSections));
      } catch (error) {
        console.error('Error fixing content:', error);
        // Fallback to raw content
        setFixedContent({
          overview: drug.overview || '',
          uses: drug.uses || '',
          dosage: drug.dosage || '',
          sideEffects: drug.side_effects || '',
          warnings: drug.warnings || ''
        });
      }
    };

    fixContent();
  }, [drug, safeApiUrl]);

  if (loading) {
    return <DrugPageSkeleton />;
  }

  if (error || !drug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <svg 
              className="w-16 h-16 text-red-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              {error ? 'Error Loading Drug Information' : 'Drug Not Found'}
            </h1>
            <p className="text-red-700 mb-6 max-w-md mx-auto">
              {error || 'The drug information you\'re looking for is not available or may have been removed.'}
            </p>
            <Link 
              href="/drugs" 
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse All Drugs & Supplements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.canonical}
        openGraph={seoData.openGraph}
        additionalMetaTags={[
          {
            name: 'article:published_time',
            content: publishedDate?.toISOString() || '',
          },
          {
            name: 'article:modified_time',
            content: updatedDate?.toISOString() || '',
          },
          {
            name: 'robots',
            content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        ]}
      />

      <BreadcrumbStructuredData items={[
        { name: 'Home', url: '/' },
        { name: 'Drugs & Supplements', url: '/drugs' },
        { name: drugName, url: `/drugs/${drug.slug}` },
      ]} />

      <DrugStructuredData
        name={drug.generic_name || drug.title}
        description={drug.overview?.replace(/<[^>]*>/g, '').substring(0, 300)}
        url={seoData.canonical}
        activeIngredient={drug.generic_name}
        drugClass={drug.drug_class}
        dosageForm={drug.dosage_form}
        manufacturer={drug.manufacturer}
        warning={drug.warnings}
        datePublished={publishedDate?.toISOString()}
        dateModified={updatedDate?.toISOString()}
      />

      <MedicalWebPageStructuredData
        title={drugName}
        description={seoData.description}
        url={seoData.canonical}
        image={getProxiedImageUrl(drug.image)}
        datePublished={publishedDate?.toISOString()}
        dateModified={updatedDate?.toISOString()}
        author={drug.author}
        reviewer={drug.reviewer}
        lastReviewed={lastReviewedDate?.toISOString()}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 flex-wrap">
              <li>
                <Link 
                  href="/" 
                  className="hover:text-gray-800 transition-colors"
                  aria-label="Go to homepage"
                >
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link 
                  href="/drugs" 
                  className="hover:text-gray-800 transition-colors"
                  aria-label="Browse all drugs and supplements"
                >
                  Drugs & Supplements
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700 font-medium truncate max-w-[200px]" aria-current="page">
                {drugName}
              </li>
            </ol>
          </nav>

          {/* Main Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-gray-900">
              {drugName}
            </h1>

            {/* Drug Class & Type */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {drug.drug_class && (
                <span 
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                  aria-label={`Drug class: ${drug.drug_class}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  {drug.drug_class}
                </span>
              )}

              {drug.dosage_form && (
                <span 
                  className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium"
                  aria-label={`Dosage form: ${drug.dosage_form}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {drug.dosage_form}
                </span>
              )}

              {/* Compact Date Display */}
              <DateDisplay
                publishedDate={publishedDate}
                updatedDate={updatedDate}
                lastReviewedDate={lastReviewedDate}
                isFallback={isFallback}
                compact={true}
                className="ml-auto hidden sm:flex"
              />
            </div>
            
            {/* Mobile Compact Date Display */}
            <div className="sm:hidden mb-4">
              <DateDisplay
                publishedDate={publishedDate}
                updatedDate={updatedDate}
                lastReviewedDate={lastReviewedDate}
                isFallback={isFallback}
                compact={true}
              />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Left Column */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="space-y-6 lg:sticky lg:top-24">
                <TableOfContents sections={contentSections} />
                
                {/* Quick Facts Card (Mobile/Desktop) */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2">Quick Facts</h3>
                  <div className="space-y-3">
                    {drug.generic_name && (
                      <div>
                        <h4 className="font-medium text-gray-700 text-sm">Generic Name</h4>
                        <p className="text-gray-900">{drug.generic_name}</p>
                      </div>
                    )}
                    {drug.brand_names && (
                      <div>
                        <h4 className="font-medium text-gray-700 text-sm">Brand Names</h4>
                        <p className="text-gray-900">{drug.brand_names}</p>
                      </div>
                    )}
                    {drug.drug_class && (
                      <div>
                        <h4 className="font-medium text-gray-700 text-sm">Drug Class</h4>
                        <p className="text-gray-900">{drug.drug_class}</p>
                      </div>
                    )}
                    {drug.dosage_form && (
                      <div>
                        <h4 className="font-medium text-gray-700 text-sm">Dosage Form</h4>
                        <p className="text-gray-900">{drug.dosage_form}</p>
                      </div>
                    )}
                    {drug.manufacturer && (
                      <div>
                        <h4 className="font-medium text-gray-700 text-sm">Manufacturer</h4>
                        <p className="text-gray-900">{drug.manufacturer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content - Middle Columns */}
            <main className="lg:col-span-2 order-1 lg:order-2 space-y-8" id="main-content">
              {/* Author & Reviewer Info */}
              {(drug.author || drug.reviewer) && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {drug.author && (
                      <div className="flex items-start gap-4">
                        {drug.author.image && (
                          <img
                            src={getProxiedImageUrl(drug.author.image)}
                            alt={drug.author.name}
                            className="w-14 h-14 rounded-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Written by</p>
                          <Link
                            href={`/authors/${drug.author.slug || 'staff'}`}
                            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline block"
                          >
                            {drug.author.name}
                          </Link>
                          {drug.author.credentials && (
                            <p className="text-sm text-gray-600">
                              {drug.author.credentials}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {drug.reviewer && (
                      <div className="flex items-start gap-4">
                        {drug.reviewer.image && (
                          <img
                            src={getProxiedImageUrl(drug.reviewer.image)}
                            alt={drug.reviewer.name}
                            className="w-14 h-14 rounded-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Medically Reviewed by</p>
                          <Link
                            href={`/reviewers/${drug.reviewer.slug || 'staff'}`}
                            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline block"
                          >
                            {drug.reviewer.name}
                          </Link>
                          {drug.reviewer.credentials && (
                            <p className="text-sm text-gray-600">
                              {drug.reviewer.credentials}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date Timeline Section (Desktop) */}
              <div className="hidden lg:block">
                <section className="bg-white rounded-xl shadow-md p-6" aria-label="Information timeline">
                  <h2 className="text-xl font-semibold mb-4">Information Timeline</h2>
                  <DateDisplay
                    publishedDate={publishedDate}
                    updatedDate={updatedDate}
                    lastReviewedDate={lastReviewedDate}
                    isFallback={isFallback}
                  />
                </section>
              </div>

              {/* Content Sections */}
              {contentSections.map((section) => (
                <section 
                  key={section.id} 
                  id={section.id}
                  className="bg-white rounded-xl shadow-md p-6 scroll-mt-24"
                >
                  <h2 className="text-2xl font-bold mb-6 border-b pb-3">
                    {section.title}
                  </h2>
                  <div
                    className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </section>
              ))}

              {/* Mobile Timeline Section */}
              <div className="lg:hidden">
                <section className="bg-white rounded-xl shadow-md p-6" aria-label="Information timeline">
                  <h2 className="text-xl font-semibold mb-4">Information Timeline</h2>
                  <DateDisplay
                    publishedDate={publishedDate}
                    updatedDate={updatedDate}
                    lastReviewedDate={lastReviewedDate}
                    isFallback={isFallback}
                  />
                </section>
              </div>
            </main>

            {/* Right Sidebar - Additional Info */}
            <aside className="lg:col-span-1 order-3 space-y-6">
              {/* Warnings Card */}
              {fixedContent.warnings && (
                <div 
                  className="bg-red-50 border border-red-200 rounded-xl p-6"
                  role="alert"
                  aria-label="Important warnings"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-red-800">Important Warnings</h3>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-red-700"
                    dangerouslySetInnerHTML={{ __html: fixedContent.warnings }}
                  />
                </div>
              )}

              {/* References Section */}
              {drug.references && drug.references.length > 0 && (
                <ReferencesSection references={drug.references} />
              )}

              {/* Disclaimer Card */}
              <div className="bg-gray-100 border border-gray-300 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Disclaimer</h3>
                <p className="text-sm text-gray-600">
                  This drug information is for educational purposes only and is not medical advice.
                  Always consult with a healthcare professional before using any medication.
                  Do not stop or change any medication without consulting your doctor.
                </p>
              </div>
            </aside>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentSection
              contentType="drug"
              contentSlug={drug.slug}
              pageTitle={drugName}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .prose a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose a:hover {
          color: #1d4ed8;
        }
        .scroll-mt-24 {
          scroll-margin-top: 6rem;
        }
      `}</style>
    </>
  );
}

/* =========================================================
   ✅ STATIC GENERATION WITH MULTIPLE ENDPOINTS
========================================================= */

export async function getStaticPaths() {
  try {
    const paths = await fetchDrugPaths();
    
    const formattedPaths = paths
      .filter(slug => slug && typeof slug === 'string')
      .map(slug => ({
        params: { slug },
      }));

    console.log(`✅ Generated ${formattedPaths.length} static paths for drugs`);
    return {
      paths: formattedPaths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching drug paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  if (!params?.slug) {
    return { notFound: true };
  }

  try {
    console.log(`📡 Fetching drug ${params.slug} from Oracle CMS`);
    const drug = await fetchDrugBySlug(params.slug);

    if (!drug) {
      console.warn(`Drug not found for slug: ${params.slug}`);
      return { notFound: true, revalidate: 60 };
    }

    return {
      props: {
        drug,
        error: null,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error(`Error fetching drug ${params.slug}:`, error);
    return { 
      props: { 
        drug: null, 
        error: 'Network error loading drug information' 
      },
      revalidate: 60
    };
  }
}
