import Head from 'next/head';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://niinfomed.com';
const SITE_NAME = 'HealthInfo';
export function OrganizationStructuredData({ name, url, logo, description, email, telephone }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": name || SITE_NAME,
    "url": url || SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": logo || `${SITE_URL}/logo.png`,
      "width": 600,
      "height": 60
    },
    "description": description || "Your trusted source for health information, news, and resources",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": email || "support@healthinfo.com",
      "telephone": telephone || "+1-800-555-0123",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://facebook.com/niinfomed",
      "https://twitter.com/niinfomed",
      "https://instagram.com/niinfomed",
      "https://linkedin.com/company/niinfomed"
    ]
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

export function NewsMediaOrganizationStructuredData({ name, url, logo, foundingDate }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#newsmediaorganization`,
    "name": name || SITE_NAME,
    "url": url || SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": logo || `${SITE_URL}/logo.png`
    },
    "foundingDate": foundingDate || "2020",
    "ethicsPolicy": `${SITE_URL}/ethics-policy`,
    "masthead": `${SITE_URL}/about`,
    "missionCoveragePrioritiesPolicy": `${SITE_URL}/editorial-policy`,
    "verificationFactCheckingPolicy": `${SITE_URL}/fact-checking-policy`,
    "actionableFeedbackPolicy": `${SITE_URL}/feedback-policy`,
    "correctionsPolicy": `${SITE_URL}/corrections-policy`
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

export function ContactPointStructuredData({ telephone, email, contactType, areaServed, availableLanguage }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    "telephone": telephone || "+1-800-555-0123",
    "email": email || "contact@healthinfo.com",
    "contactType": contactType || "customer service",
    "areaServed": areaServed || ["IN", "US", "GB"],
    "availableLanguage": availableLanguage || ["English", "Hindi"]
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

export function PersonStructuredData({ name, image, jobTitle, credentials, url, worksFor, description, sameAs }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    ...(image && { "image": image }),
    ...(jobTitle && { "jobTitle": jobTitle }),
    ...(credentials && { 
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": credentials
      }
    }),
    ...(url && { "url": url }),
    ...(description && { "description": description }),
    ...(worksFor && {
      "worksFor": {
        "@type": "Organization",
        "name": worksFor
      }
    }),
    ...(sameAs && { "sameAs": sameAs })
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

export function PostalAddressStructuredData({ streetAddress, city, state, postalCode, country }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PostalAddress",
    "streetAddress": streetAddress || "123 Health Street",
    "addressLocality": city || "Mumbai",
    "addressRegion": state || "Maharashtra",
    "postalCode": postalCode || "400001",
    "addressCountry": country || "IN"
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

export function CreativeWorkStructuredData({ title, description, author, datePublished, dateModified, image, url, keywords }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "headline": title,
    "name": title,
    "description": description,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    ...(image && { "image": image }),
    "url": url || SITE_URL,
    ...(keywords && { "keywords": keywords }),
    ...(author && {
      "author": {
        "@type": "Person",
        "name": author.name,
        ...(author.credentials && { 
          "hasCredential": {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": author.credentials
          }
        }),
        ...(author.image && { "image": author.image })
      }
    }),
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
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

export function MedicalWebPageStructuredData({ 
  title, 
  description, 
  url, 
  image,
  datePublished, 
  dateModified,
  author,
  reviewer,
  lastReviewed,
  medicalAudience,
  specialty,
  keywords
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": title,
    "headline": title,
    "description": description,
    "url": url || SITE_URL,
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image,
        "width": 1200,
        "height": 675
      }
    }),
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "lastReviewed": lastReviewed || dateModified || datePublished,
    ...(keywords && { "keywords": keywords }),
    "medicalAudience": {
      "@type": "MedicalAudience",
      "audienceType": medicalAudience || "Patient"
    },
    ...(specialty && {
      "specialty": {
        "@type": "MedicalSpecialty",
        "name": specialty
      }
    }),
    ...(author && {
      "author": {
        "@type": "Person",
        "name": author.name,
        ...(author.credentials && { "jobTitle": author.credentials }),
        ...(author.image && { "image": author.image })
      }
    }),
    ...(reviewer && {
      "reviewedBy": {
        "@type": "Person",
        "name": reviewer.name,
        ...(reviewer.credentials && { "jobTitle": reviewer.credentials }),
        ...(reviewer.image && { "image": reviewer.image })
      }
    }),
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "mainContentOfPage": {
      "@type": "WebPageElement",
      "cssSelector": "article"
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

export function FAQPageStructuredData({ faqs, url, title }) {
  if (!faqs || faqs.length === 0) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(title && { "name": title }),
    ...(url && { "url": url }),
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
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

export function MedicalConditionStructuredData({ 
  name, 
  alternateName,
  description, 
  url, 
  image,
  code,
  symptoms,
  causes,
  riskFactors,
  possibleTreatment,
  prevention,
  associatedAnatomy,
  relevantSpecialty,
  typicalAgeRange
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    "name": name,
    ...(alternateName && { "alternateName": alternateName }),
    "description": description,
    "url": url,
    ...(image && { "image": image }),
    ...(code && {
      "code": {
        "@type": "MedicalCode",
        "code": code,
        "codingSystem": "ICD-10"
      }
    }),
    ...(symptoms && symptoms.length > 0 && {
      "signOrSymptom": symptoms.map(symptom => ({
        "@type": "MedicalSymptom",
        "name": typeof symptom === 'string' ? symptom : symptom.name
      }))
    }),
    ...(causes && causes.length > 0 && {
      "cause": causes.map(cause => ({
        "@type": "MedicalCause",
        "name": typeof cause === 'string' ? cause : cause.name
      }))
    }),
    ...(riskFactors && riskFactors.length > 0 && {
      "riskFactor": riskFactors.map(factor => ({
        "@type": "MedicalRiskFactor",
        "name": typeof factor === 'string' ? factor : factor.name
      }))
    }),
    ...(possibleTreatment && possibleTreatment.length > 0 && {
      "possibleTreatment": possibleTreatment.map(treatment => ({
        "@type": "MedicalTherapy",
        "name": typeof treatment === 'string' ? treatment : treatment.name
      }))
    }),
    ...(prevention && {
      "primaryPrevention": {
        "@type": "MedicalTherapy",
        "name": prevention
      }
    }),
    ...(associatedAnatomy && {
      "associatedAnatomy": {
        "@type": "AnatomicalStructure",
        "name": associatedAnatomy
      }
    }),
    ...(relevantSpecialty && {
      "relevantSpecialty": {
        "@type": "MedicalSpecialty",
        "name": relevantSpecialty
      }
    }),
    ...(typicalAgeRange && { "typicalAgeRange": typicalAgeRange })
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

export function ReviewerStructuredData({ name, credentials, image, organization, specialty, url }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": "Medical Reviewer",
    ...(credentials && { 
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": credentials
      }
    }),
    ...(image && { "image": image }),
    ...(url && { "url": url }),
    ...(specialty && {
      "knowsAbout": {
        "@type": "MedicalSpecialty",
        "name": specialty
      }
    }),
    ...(organization && {
      "worksFor": {
        "@type": "MedicalOrganization",
        "name": organization
      }
    })
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

export function ArticleStructuredData({ 
  title, 
  description, 
  url, 
  image, 
  datePublished, 
  dateModified,
  author,
  reviewer,
  articleSection,
  wordCount,
  keywords,
  articleBody
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": url,
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image,
        "width": 1200,
        "height": 675,
        "caption": title
      }
    }),
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    ...(author && {
      "author": {
        "@type": "Person",
        "name": author.name,
        ...(author.credentials && { "jobTitle": author.credentials }),
        ...(author.image && { "image": author.image }),
        ...(author.url && { "url": author.url })
      }
    }),
    ...(reviewer && {
      "reviewedBy": {
        "@type": "Person",
        "name": reviewer.name,
        ...(reviewer.credentials && { "jobTitle": reviewer.credentials }),
        ...(reviewer.image && { "image": reviewer.image })
      }
    }),
    ...(articleSection && { "articleSection": articleSection }),
    ...(wordCount && { "wordCount": wordCount }),
    ...(keywords && { "keywords": keywords }),
    ...(articleBody && { "articleBody": articleBody }),
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
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

export function DrugStructuredData({
  name,
  description,
  url,
  image,
  activeIngredient,
  drugClass,
  dosageForm,
  manufacturer,
  warning,
  sideEffects,
  interactions,
  prescriptionStatus,
  administrationRoute
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Drug",
    "name": name,
    "description": description,
    "url": url,
    ...(image && { "image": image }),
    ...(activeIngredient && { "activeIngredient": activeIngredient }),
    ...(drugClass && {
      "drugClass": {
        "@type": "DrugClass",
        "name": drugClass
      }
    }),
    ...(dosageForm && { "dosageForm": dosageForm }),
    ...(administrationRoute && { "administrationRoute": administrationRoute }),
    ...(prescriptionStatus && { "prescriptionStatus": prescriptionStatus }),
    ...(manufacturer && {
      "manufacturer": {
        "@type": "Organization",
        "name": manufacturer
      }
    }),
    ...(warning && { "warning": warning }),
    ...(sideEffects && sideEffects.length > 0 && {
      "adverseOutcome": sideEffects.map(effect => ({
        "@type": "MedicalEntity",
        "name": effect
      }))
    }),
    ...(interactions && interactions.length > 0 && {
      "interactingDrug": interactions.map(drug => ({
        "@type": "Drug",
        "name": drug
      }))
    })
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

export function BreadcrumbStructuredData({ items }) {
  if (!items || items.length === 0) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
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

export function WebSiteStructuredData({ name, url, searchUrl }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name || SITE_NAME,
    "url": url || SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": searchUrl || `${SITE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
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

export function VideoStructuredData({ 
  title, 
  description, 
  thumbnailUrl, 
  uploadDate, 
  duration, 
  contentUrl, 
  embedUrl,
  author 
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": uploadDate,
    ...(duration && { "duration": `PT${duration}M` }),
    ...(contentUrl && { "contentUrl": contentUrl }),
    ...(embedUrl && { "embedUrl": embedUrl }),
    ...(author && {
      "author": {
        "@type": "Person",
        "name": author.name
      }
    }),
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
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

export function HowToStructuredData({ title, description, image, totalTime, supplies, steps }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    ...(image && { "image": image }),
    ...(totalTime && { "totalTime": `PT${totalTime}M` }),
    ...(supplies && supplies.length > 0 && {
      "supply": supplies.map(supply => ({
        "@type": "HowToSupply",
        "name": supply
      }))
    }),
    ...(steps && steps.length > 0 && {
      "step": steps.map((step, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "text": typeof step === 'string' ? step : step.text,
        "name": typeof step === 'string' ? `Step ${index + 1}` : step.name || `Step ${index + 1}`
      }))
    })
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

export function PhysicianStructuredData({ name, credentials, description, image, specialties, hospitalAffiliation }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": name,
    ...(credentials && { "jobTitle": credentials }),
    ...(description && { "description": description }),
    ...(image && { "image": image }),
    ...(specialties && { "medicalSpecialty": specialties }),
    ...(hospitalAffiliation && {
      "hospitalAffiliation": {
        "@type": "Hospital",
        "name": hospitalAffiliation
      }
    })
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

export function MedicalOrganizationStructuredData({ name, url, logo, description, address, telephone, email }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": name || SITE_NAME,
    "url": url || SITE_URL,
    "logo": logo || `${SITE_URL}/logo.png`,
    "description": description || "Your trusted source for health information",
    ...(address && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": address.street,
        "addressLocality": address.city,
        "addressRegion": address.state,
        "postalCode": address.postalCode,
        "addressCountry": address.country || "IN"
      }
    }),
    ...(telephone && { "telephone": telephone }),
    ...(email && { "email": email }),
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": email || "support@healthinfo.com",
      "availableLanguage": ["English", "Hindi"]
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

export {
  OrganizationStructuredData as OrganizationSchema,
  NewsMediaOrganizationStructuredData as NewsMediaOrganizationSchema,
  ContactPointStructuredData as ContactPointSchema,
  PersonStructuredData as PersonSchema,
  PostalAddressStructuredData as PostalAddressSchema,
  CreativeWorkStructuredData as CreativeWorkSchema,
  MedicalWebPageStructuredData as MedicalWebPageSchema,
  FAQPageStructuredData as FAQPageSchema,
  MedicalConditionStructuredData as MedicalConditionSchema,
  ReviewerStructuredData as ReviewerSchema,
  ArticleStructuredData as ArticleSchema,
  DrugStructuredData as DrugSchema,
  BreadcrumbStructuredData as BreadcrumbSchema,
  WebSiteStructuredData as WebSiteSchema,
  VideoStructuredData as VideoSchema,
  HowToStructuredData as HowToSchema,
  PhysicianStructuredData as PhysicianSchema,
  MedicalOrganizationStructuredData as MedicalOrganizationSchema
};
