
import Head from 'next/head';

export function ArticleStructuredData({ article }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.published_date,
    "dateModified": article.last_updated,
    "author": {
      "@type": "Organization",
      "name": "Health Information Portal"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Health Information Portal",
      "logo": {
        "@type": "ImageObject",
        "url": "https://Niinfomed.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://Niinfomed.com/articles/${article.slug}`
    }
  };

  if (article.image) {
    structuredData.image = article.image;
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "Niinfomed",
    "url": "https://Niinfomed.com",
    "logo": "https://Niinfomed.com/logo.png",
    "description": "Your trusted source for health information, news, and resources",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@Niinfomed.com"
    }
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}

export function MedicalConditionStructuredData({ condition }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    "name": condition.title,
    "alternateName": condition.also_known_as,
    "description": condition.description,
    "code": {
      "@type": "MedicalCode",
      "code": condition.icd_code,
      "codingSystem": "ICD-10"
    }
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}
