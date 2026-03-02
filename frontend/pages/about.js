
import Layout from '../components/Layout';
import SEO from '../components/SEO';
export default function About() {
  return (
    <Layout>
      <SEO 
        title="About Us - Your Trusted Health Information Resource"
        description="Learn about our mission to provide accurate, accessible health information to everyone. Meet our team of medical experts and discover our commitment to health education."
      />
      
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 text-center">
              About Us
            </h1>
            <p className="text-xl text-neutral-600 text-center mb-12">
              Your trusted partner in health and wellness information
            </p>

            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Our Mission</h2>
              <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                We are dedicated to providing accurate, evidence-based health information that empowers 
                individuals to make informed decisions about their health and well-being. Our mission is 
                to bridge the gap between complex medical knowledge and everyday understanding.
              </p>

              <h2 className="text-3xl font-bold text-neutral-900 mb-4 mt-8">What We Do</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-neutral-900">Evidence-Based Content</h3>
                  </div>
                  <p className="text-neutral-700">
                    All our articles are reviewed by qualified medical professionals and backed by scientific research.
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-xl font-semibold text-neutral-900">Comprehensive Coverage</h3>
                  </div>
                  <p className="text-neutral-700">
                    From conditions and treatments to wellness and prevention, we cover all aspects of health.
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-neutral-900">Expert Contributors</h3>
                  </div>
                  <p className="text-neutral-700">
                    Our content is created and reviewed by doctors, researchers, and health professionals.
                  </p>
                </div>

                <div className="bg-amber-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <svg className="w-8 h-8 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-neutral-900">Multilingual Support</h3>
                  </div>
                  <p className="text-neutral-700">
                    We provide health information in multiple languages to reach diverse communities.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-neutral-900 mb-4 mt-8">Our Values</h2>
              <ul className="space-y-4 text-neutral-700">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong className="text-neutral-900">Accuracy:</strong> We prioritize factual, up-to-date medical information.
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong className="text-neutral-900">Accessibility:</strong> Health information should be easy to understand for everyone.
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong className="text-neutral-900">Integrity:</strong> We maintain editorial independence and transparency.
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong className="text-neutral-900">Empowerment:</strong> We believe informed individuals make better health decisions.
                  </div>
                </li>
              </ul>

              <div className="mt-12 p-6 bg-blue-50 rounded-lg border-l-4 border-primary">
                <p className="text-lg text-neutral-700 italic">
                  "Our goal is to make quality health information accessible to everyone, regardless of their 
                  background or location. We believe that knowledge is the first step toward better health."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
