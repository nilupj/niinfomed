
// Example usage of geo-location SEO features

export const geoSeoExamples = {
  // Example 1: Medical clinic with location
  medicalClinic: {
    title: "Best Medical Clinic in Mumbai",
    description: "Top-rated medical clinic offering comprehensive healthcare services in Mumbai, Maharashtra",
    geo: {
      latitude: 19.0760,
      longitude: 72.8777,
      elevation: "14m",
      region: "IN-MH",
      placename: "Mumbai, Maharashtra, India",
    },
    address: {
      streetAddress: "123 Health Street, Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400058",
      country: "IN",
    },
    additionalSchema: {
      medicalBusiness: {
        name: "Health Info Medical Center",
        description: "Comprehensive healthcare services",
        telephone: "+91-22-12345678",
        email: "info@healthinfo.com",
        specialties: ["General Medicine", "Cardiology", "Orthopedics"],
        isAcceptingNewPatients: true,
        geo: {
          latitude: 19.0760,
          longitude: 72.8777,
        },
        address: {
          streetAddress: "123 Health Street, Andheri West",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400058",
          country: "IN",
        },
        openingHours: [
          { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
          { dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
        ],
        serviceArea: {
          radius: "50 km",
        },
        areaServed: [
          { city: "Mumbai", state: "Maharashtra" },
          { city: "Navi Mumbai", state: "Maharashtra" },
          { city: "Thane", state: "Maharashtra" },
        ],
        rating: {
          value: 4.8,
          count: 250,
        },
      },
      // Service area coverage
      geoCircle: {
        center: {
          latitude: 19.0760,
          longitude: 72.8777,
        },
        radius: "50 km",
      },
    },
  },

  // Example 2: Healthcare service with multiple locations
  multiLocationService: {
    title: "24/7 Home Healthcare Services Across India",
    description: "Professional home healthcare services available in major cities across India",
    additionalSchema: {
      service: {
        name: "Home Healthcare Services",
        description: "Professional nursing and medical care at home",
        providerName: "Health Info Services",
        category: "Home Healthcare",
        areaServed: [
          "Mumbai, Maharashtra, India",
          "Delhi, India",
          "Bangalore, Karnataka, India",
          "Chennai, Tamil Nadu, India",
          "Kolkata, West Bengal, India",
        ],
        channels: [
          {
            url: "https://Niinfomed.com/contact",
            phone: "+91-1800-123-4567",
            languages: ["en", "hi", "mr", "ta", "te"],
          },
        ],
        offer: {
          name: "Home Healthcare Package",
          price: "2999",
          currency: "INR",
          availability: "https://schema.org/InStock",
        },
      },
    },
  },

  // Example 3: Hospital with detailed geo information
  hospital: {
    title: "Multi-Specialty Hospital in Delhi",
    description: "Leading multi-specialty hospital providing world-class healthcare in Delhi NCR",
    geo: {
      latitude: 28.7041,
      longitude: 77.1025,
      region: "IN-DL",
      placename: "New Delhi, Delhi, India",
    },
    address: {
      streetAddress: "456 Medical Avenue, Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110001",
      country: "IN",
    },
    additionalSchema: {
      place: {
        name: "Health Info Hospital",
        description: "300-bed multi-specialty hospital",
        address: {
          streetAddress: "456 Medical Avenue, Connaught Place",
          city: "New Delhi",
          state: "Delhi",
          postalCode: "110001",
          country: "IN",
        },
        geo: {
          latitude: 28.7041,
          longitude: 77.1025,
        },
        mapUrl: "https://maps.google.com/?q=28.7041,77.1025",
        telephone: "+91-11-98765432",
        openingHours: [
          { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
        ],
        amenities: [
          { name: "Emergency Services", value: "24/7" },
          { name: "ICU", value: "Available" },
          { name: "Pharmacy", value: "On-site" },
          { name: "Parking", value: "200 vehicles" },
        ],
        publicAccess: true,
        isAccessibleForFree: false,
      },
      localBusiness: {
        type: "Hospital",
        name: "Health Info Hospital",
        description: "Multi-specialty hospital with 300 beds",
        telephone: "+91-11-98765432",
        email: "contact@healthinfohospital.com",
        priceRange: "₹₹₹",
        paymentAccepted: ["Cash", "Credit Card", "Debit Card", "Insurance"],
        currenciesAccepted: "INR",
        geo: {
          latitude: 28.7041,
          longitude: 77.1025,
        },
        address: {
          streetAddress: "456 Medical Avenue, Connaught Place",
          city: "New Delhi",
          state: "Delhi",
          postalCode: "110001",
          country: "IN",
        },
        serviceArea: {
          radius: "100 km",
        },
        areaServed: [
          { city: "New Delhi", state: "Delhi" },
          { city: "Gurgaon", state: "Haryana" },
          { city: "Noida", state: "Uttar Pradesh" },
          { city: "Faridabad", state: "Haryana" },
        ],
        rating: {
          value: 4.7,
          count: 500,
        },
      },
    },
  },

  // Example 4: Telemedicine service with nationwide coverage
  telemedicine: {
    title: "Online Doctor Consultation - Pan India",
    description: "Consult certified doctors online from anywhere in India",
    additionalSchema: {
      service: {
        name: "Telemedicine Consultation",
        description: "24/7 online doctor consultation service",
        providerName: "Health Info Telehealth",
        category: "Telemedicine",
        areaServed: "India",
        channels: [
          {
            url: "https://Niinfomed.com/teleconsult",
            phone: "+91-1800-DOCTOR",
            languages: ["en", "hi", "mr", "gu", "bn", "ta", "te", "kn", "ml"],
          },
        ],
        offer: {
          name: "Online Consultation",
          price: "299",
          currency: "INR",
          availability: "https://schema.org/OnlineOnly",
          validUntil: "2026-12-31",
        },
      },
      geoShape: {
        // Covers entire India
        box: "8.4,68.7 35.5,97.4",
      },
    },
  },
};

// Usage in a page component:
// import SEO from '../components/SEO';
// import { geoSeoExamples } from '../utils/geoSeoExample';
//
// <SEO {...geoSeoExamples.medicalClinic} />
