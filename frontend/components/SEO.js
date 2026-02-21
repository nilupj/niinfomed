import Head from 'next/head';

export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'article',
  publishedTime,
  modifiedTime,
  author,
  tags = [],
  schemaType = 'Article',
  additionalSchema = {},
  faqs = [],
  breadcrumbs = [],
  medicalCondition = null,
  treatmentType = null,
  medicalSpecialty = null,
  reviewedBy = null,
  contactInfo = null,
  address = null,
  clinic = null,
  physician = null,
  reviews = [],
  rating = null,
  geo = null,
  mapInfo = null,
  offer = null,
  openingHours = [],
}) {
  const siteUrl = 'https://niinfomed.com';
  const siteName = 'NiinfoMed';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Trusted Medical Information`;
  const fullCanonical = canonical || siteUrl;
  const fullOgImage = ogImage || `${siteUrl}/og-default.jpg`;

  // Generate dynamic tags based on content
  const generateDynamicTags = () => {
    const dynamicTags = [...tags];

    // Add medical condition as tag
    if (medicalCondition) {
      dynamicTags.push(medicalCondition);
    }

    // Add treatment type as tag
    if (treatmentType) {
      dynamicTags.push(treatmentType);
    }

    // Add medical specialty as tag
    if (medicalSpecialty) {
      dynamicTags.push(medicalSpecialty);
    }

    // Remove duplicates
    return [...new Set(dynamicTags)];
  };

  const allTags = generateDynamicTags();

  // Generate schema markup
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      headline: title,
      description: description,
      url: fullCanonical,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      image: fullOgImage,
      author: {
        '@type': 'Person',
        name: author?.name || `${siteName} Team`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'NiinfoMed',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullCanonical,
      },
    };

    if (allTags.length > 0) {
      baseSchema.keywords = allTags.join(', ');
    }

    return { ...baseSchema, ...additionalSchema };
  };

  // Enhanced Medical schema for health articles
  const generateMedicalSchema = () => {
    if (schemaType !== 'MedicalWebPage') return null;

    const medicalSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: title,
      description: description,
      url: fullCanonical,
      lastReviewed: modifiedTime || publishedTime,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      mainContentOfPage: {
        '@type': 'WebPageElement',
        cssSelector: '.article-content',
      },
      specialty: {
        '@type': 'MedicalSpecialty',
        name: medicalSpecialty || tags[0] || 'General Health',
      },
      audience: {
        '@type': 'MedicalAudience',
        audienceType: 'Patient',
      },
    };

    // Add medical condition if provided
    if (medicalCondition) {
      medicalSchema.about = {
        '@type': 'MedicalCondition',
        name: medicalCondition,
      };
    }

    // Add reviewed by if provided
    if (reviewedBy) {
      medicalSchema.reviewedBy = {
        '@type': 'Person',
        name: reviewedBy.name,
        jobTitle: reviewedBy.credentials || 'Medical Reviewer',
      };
    }

    return medicalSchema;
  };

  // Breadcrumb schema
  const generateBreadcrumbSchema = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.url}`,
      })),
    };
  };

  // Enhanced FAQ schema with medical context
  const generateFAQSchema = () => {
    if (!faqs || faqs.length === 0) return null;

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => {
        const answer = {
          '@type': 'Answer',
          text: faq.answer,
        };

        // Add medical review information if available
        if (faq.reviewedBy) {
          answer.author = {
            '@type': 'Person',
            name: faq.reviewedBy,
          };
        }

        return {
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: answer,
        };
      }),
    };

    // Add medical webpage properties if it's a medical FAQ
    if (schemaType === 'MedicalWebPage') {
      faqSchema.about = {
        '@type': 'MedicalWebPage',
        name: title,
      };
    }

    return faqSchema;
  };

  // HowTo schema for medical procedures
  const generateHowToSchema = (steps = []) => {
    if (!steps || steps.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: title,
      description: description,
      totalTime: steps.totalTime,
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        image: step.image,
      })),
    };
  };

  // ContactPoint Schema
  const generateContactPointSchema = (contactInfo) => {
    if (!contactInfo) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPoint',
      telephone: contactInfo.telephone,
      contactType: contactInfo.contactType || 'customer service',
      email: contactInfo.email,
      availableLanguage: contactInfo.languages || ['English', 'Hindi'],
      areaServed: contactInfo.areaServed || 'IN',
    };
  };

  // PostalAddress Schema
  const generatePostalAddressSchema = (address) => {
    if (!address) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: address.country || 'IN',
    };
  };

  // MedicalClinic Schema
  const generateMedicalClinicSchema = (clinic) => {
    if (!clinic) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: clinic.name,
      description: clinic.description,
      url: clinic.url || fullCanonical,
      image: clinic.image || fullOgImage,
      address: clinic.address ? generatePostalAddressSchema(clinic.address) : null,
      geo: clinic.geo ? {
        '@type': 'GeoCoordinates',
        latitude: clinic.geo.latitude,
        longitude: clinic.geo.longitude,
      } : null,
      openingHoursSpecification: clinic.openingHours ? clinic.openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.dayOfWeek,
        opens: hours.opens,
        closes: hours.closes,
      })) : null,
      telephone: clinic.telephone,
      priceRange: clinic.priceRange,
      medicalSpecialty: clinic.specialties,
      aggregateRating: clinic.rating ? {
        '@type': 'AggregateRating',
        ratingValue: clinic.rating.value,
        reviewCount: clinic.rating.count,
        bestRating: '5',
        worstRating: '1',
      } : null,
    };
  };

  // Physician Schema
  const generatePhysicianSchema = (physician) => {
    if (!physician) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Physician',
      name: physician.name,
      description: physician.bio,
      image: physician.image,
      url: physician.url,
      medicalSpecialty: physician.specialty,
      alumniOf: physician.education ? {
        '@type': 'EducationalOrganization',
        name: physician.education,
      } : null,
      memberOf: physician.affiliation ? {
        '@type': 'MedicalOrganization',
        name: physician.affiliation,
      } : null,
      availableService: physician.services ? physician.services.map(service => ({
        '@type': 'MedicalProcedure',
        name: service,
      })) : null,
      aggregateRating: physician.rating ? {
        '@type': 'AggregateRating',
        ratingValue: physician.rating.value,
        reviewCount: physician.rating.count,
        bestRating: '5',
        worstRating: '1',
      } : null,
    };
  };

  // Review Schema
  const generateReviewSchema = (reviews) => {
    if (!reviews || reviews.length === 0) return null;

    return reviews.map(review => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.authorName,
      },
      datePublished: review.date,
      reviewBody: review.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1',
      },
    }));
  };

  // AggregateRating Schema
  const generateAggregateRatingSchema = (rating) => {
    if (!rating) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'AggregateRating',
      ratingValue: rating.value,
      reviewCount: rating.count,
      bestRating: '5',
      worstRating: '1',
    };
  };

  // GeoCoordinates Schema
  const generateGeoCoordinatesSchema = (geo) => {
    if (!geo) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
      elevation: geo.elevation,
      address: geo.address ? generatePostalAddressSchema(geo.address) : null,
    };
  };

  // GeoShape Schema for service areas
  const generateGeoShapeSchema = (geoShape) => {
    if (!geoShape) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'GeoShape',
      circle: geoShape.circle,
      polygon: geoShape.polygon,
      box: geoShape.box,
    };
  };

  // Place Schema with geo information
  const generatePlaceSchema = (place) => {
    if (!place) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: place.name,
      description: place.description,
      address: place.address ? generatePostalAddressSchema(place.address) : null,
      geo: place.geo ? generateGeoCoordinatesSchema(place.geo) : null,
      hasMap: place.mapUrl,
      url: place.url || fullCanonical,
      image: place.image || fullOgImage,
      telephone: place.telephone,
      openingHoursSpecification: place.openingHours ? generateOpeningHoursSchema(place.openingHours) : null,
      additionalProperty: place.amenities ? place.amenities.map(amenity => ({
        '@type': 'PropertyValue',
        name: amenity.name,
        value: amenity.value,
      })) : null,
      smokingAllowed: place.smokingAllowed,
      publicAccess: place.publicAccess,
      isAccessibleForFree: place.isAccessibleForFree,
    };
  };

  // LocalBusiness Schema with geo
  const generateLocalBusinessSchema = (business) => {
    if (!business) return null;

    return {
      '@context': 'https://schema.org',
      '@type': business.type || 'LocalBusiness',
      name: business.name,
      description: business.description,
      url: business.url || fullCanonical,
      image: business.image || fullOgImage,
      address: business.address ? generatePostalAddressSchema(business.address) : null,
      geo: business.geo ? generateGeoCoordinatesSchema(business.geo) : null,
      hasMap: business.mapUrl,
      areaServed: business.areaServed ? (Array.isArray(business.areaServed) ? business.areaServed.map(area => ({
        '@type': 'City',
        name: area.city,
        containedInPlace: {
          '@type': 'State',
          name: area.state,
        },
      })) : business.areaServed) : null,
      serviceArea: business.serviceArea ? {
        '@type': 'GeoCircle',
        geoMidpoint: business.geo ? generateGeoCoordinatesSchema(business.geo) : null,
        geoRadius: business.serviceArea.radius,
      } : null,
      telephone: business.telephone,
      email: business.email,
      priceRange: business.priceRange,
      paymentAccepted: business.paymentAccepted,
      currenciesAccepted: business.currenciesAccepted || 'INR',
      openingHoursSpecification: business.openingHours ? generateOpeningHoursSchema(business.openingHours) : null,
      aggregateRating: business.rating ? generateAggregateRatingSchema(business.rating) : null,
      review: business.reviews ? generateReviewSchema(business.reviews) : null,
      contactPoint: business.contactInfo ? generateContactPointSchema(business.contactInfo) : null,
    };
  };

  // MedicalBusiness Schema with geo
  const generateMedicalBusinessSchema = (medicalBusiness) => {
    if (!medicalBusiness) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      '@id': medicalBusiness.id || fullCanonical,
      name: medicalBusiness.name,
      description: medicalBusiness.description,
      url: medicalBusiness.url || fullCanonical,
      image: medicalBusiness.image || fullOgImage,
      address: medicalBusiness.address ? generatePostalAddressSchema(medicalBusiness.address) : null,
      geo: medicalBusiness.geo ? generateGeoCoordinatesSchema(medicalBusiness.geo) : null,
      hasMap: medicalBusiness.mapUrl,
      areaServed: medicalBusiness.areaServed,
      telephone: medicalBusiness.telephone,
      email: medicalBusiness.email,
      priceRange: medicalBusiness.priceRange,
      openingHoursSpecification: medicalBusiness.openingHours ? generateOpeningHoursSchema(medicalBusiness.openingHours) : null,
      medicalSpecialty: medicalBusiness.specialties,
      availableService: medicalBusiness.services ? medicalBusiness.services.map(service => ({
        '@type': 'MedicalProcedure',
        name: service.name,
        description: service.description,
      })) : null,
      aggregateRating: medicalBusiness.rating ? generateAggregateRatingSchema(medicalBusiness.rating) : null,
      isAcceptingNewPatients: medicalBusiness.isAcceptingNewPatients,
      healthPlanNetworkTier: medicalBusiness.networkTier,
    };
  };

  // GeoCircle for service radius
  const generateGeoCircleSchema = (geoCircle) => {
    if (!geoCircle) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'GeoCircle',
      geoMidpoint: geoCircle.center ? generateGeoCoordinatesSchema(geoCircle.center) : null,
      geoRadius: geoCircle.radius,
    };
  };

  // Service with geo coverage
  const generateServiceSchema = (service) => {
    if (!service) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'Organization',
        name: service.providerName || siteName,
      },
      areaServed: service.areaServed ? (Array.isArray(service.areaServed) ? service.areaServed : [service.areaServed]) : null,
      availableChannel: service.channels ? service.channels.map(channel => ({
        '@type': 'ServiceChannel',
        serviceUrl: channel.url,
        servicePhone: channel.phone,
        availableLanguage: channel.languages || ['en', 'hi'],
      })) : null,
      category: service.category,
      offers: service.offer ? generateOfferSchema(service.offer) : null,
    };
  };

  // Map Schema
  const generateMapSchema = (mapInfo) => {
    if (!mapInfo) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Map',
      name: mapInfo.name || 'Location Map',
      url: mapInfo.url,
      mapType: mapInfo.type || 'VenueMap',
    };
  };

  // Offer Schema (for services/treatments)
  const generateOfferSchema = (offer) => {
    if (!offer) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      name: offer.name,
      description: offer.description,
      price: offer.price,
      priceCurrency: offer.currency || 'INR',
      availability: offer.availability || 'https://schema.org/InStock',
      url: offer.url || fullCanonical,
      priceValidUntil: offer.validUntil,
      seller: {
        '@type': 'Organization',
        name: siteName,
      },
    };
  };

  // CreativeWork Schema
  const generateCreativeWorkSchema = (work) => {
    if (!work) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: work.name || title,
      description: work.description || description,
      url: fullCanonical,
      author: work.author ? {
        '@type': 'Person',
        name: work.author.name,
        jobTitle: work.author.jobTitle,
      } : null,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullCanonical,
      },
    };
  };

  // OpeningHoursSpecification Schema
  const generateOpeningHoursSchema = (hours) => {
    if (!hours || hours.length === 0) return null;

    return hours.map(schedule => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: schedule.dayOfWeek,
      opens: schedule.opens,
      closes: schedule.closes,
    }));
  };

  const breadcrumbSchema = generateBreadcrumbSchema();
  const faqSchema = generateFAQSchema();
  const medicalSchema = generateMedicalSchema();

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content={siteName} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author.name} />}
      {allTags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

      {/* Medical Content Tags */}
      {schemaType === 'MedicalWebPage' && (
        <>
          <meta name="health-topics" content={allTags.join(', ')} />
          <meta name="medical-review-date" content={modifiedTime || publishedTime} />
          {medicalCondition && <meta name="medical-condition" content={medicalCondition} />}
          {treatmentType && <meta name="treatment-type" content={treatmentType} />}
          {medicalSpecialty && <meta name="medical-specialty" content={medicalSpecialty} />}
        </>
      )}

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
      />

      {/* Medical WebPage Schema */}
      {medicalSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalSchema) }}
        />
      )}

      {/* FAQ Schema */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            url: siteUrl,
            logo: `${siteUrl}/logo.png`,
            sameAs: [
              `https://twitter.com/${siteName.toLowerCase()}`,
              `https://facebook.com/${siteName.toLowerCase()}`,
            ],
          }),
        }}
      />

      {/* WebSite Schema with SiteNavigationElement */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: siteUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* ContactPoint Schema */}
      {contactInfo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateContactPointSchema(contactInfo)),
          }}
        />
      )}

      {/* PostalAddress Schema */}
      {address && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generatePostalAddressSchema(address)),
          }}
        />
      )}

      {/* MedicalClinic Schema */}
      {clinic && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateMedicalClinicSchema(clinic)),
          }}
        />
      )}

      {/* Physician Schema */}
      {physician && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generatePhysicianSchema(physician)),
          }}
        />
      )}

      {/* Review Schemas */}
      {reviews && reviews.length > 0 && reviews.map((review, index) => (
        <script
          key={`review-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateReviewSchema([review])[0]),
          }}
        />
      ))}

      {/* AggregateRating Schema */}
      {rating && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateAggregateRatingSchema(rating)),
          }}
        />
      )}

      {/* GeoCoordinates Schema */}
      {geo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateGeoCoordinatesSchema(geo)),
          }}
        />
      )}

      {/* Map Schema */}
      {mapInfo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateMapSchema(mapInfo)),
          }}
        />
      )}

      {/* Offer Schema */}
      {offer && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOfferSchema(offer)),
          }}
        />
      )}

      {/* Place Schema */}
      {additionalSchema.place && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generatePlaceSchema(additionalSchema.place)),
          }}
        />
      )}

      {/* LocalBusiness Schema */}
      {additionalSchema.localBusiness && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema(additionalSchema.localBusiness)),
          }}
        />
      )}

      {/* MedicalBusiness Schema */}
      {additionalSchema.medicalBusiness && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateMedicalBusinessSchema(additionalSchema.medicalBusiness)),
          }}
        />
      )}

      {/* GeoCircle Schema */}
      {additionalSchema.geoCircle && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateGeoCircleSchema(additionalSchema.geoCircle)),
          }}
        />
      )}

      {/* GeoShape Schema */}
      {additionalSchema.geoShape && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateGeoShapeSchema(additionalSchema.geoShape)),
          }}
        />
      )}

      {/* Service Schema */}
      {additionalSchema.service && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateServiceSchema(additionalSchema.service)),
          }}
        />
      )}

      {/* Geographic Meta Tags */}
      {geo && (
        <>
          <meta name="geo.position" content={`${geo.latitude};${geo.longitude}`} />
          <meta name="ICBM" content={`${geo.latitude}, ${geo.longitude}`} />
          {geo.region && <meta name="geo.region" content={geo.region} />}
          {geo.placename && <meta name="geo.placename" content={geo.placename} />}
        </>
      )}

      {/* Location-specific Open Graph tags */}
      {address && (
        <>
          <meta property="business:contact_data:street_address" content={address.streetAddress} />
          <meta property="business:contact_data:locality" content={address.city} />
          <meta property="business:contact_data:region" content={address.state} />
          <meta property="business:contact_data:postal_code" content={address.postalCode} />
          <meta property="business:contact_data:country_name" content={address.country || 'India'} />
        </>
      )}

      {/* Service area tags */}
      {additionalSchema.serviceArea && (
        <meta name="coverage" content={JSON.stringify(additionalSchema.serviceArea)} />
      )}
    </Head>
  );
}