
import Layout from '../components/Layout';
import SEO from '../components/SEO';

export default function AboutAds() {
  return (
    <Layout>
      <SEO 
        title="About Our Advertising - How We Use Ads"
        description="Learn about how we use advertising to support our free health information service and maintain transparency with our users."
      />
      
      <div className="bg-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              About Our Advertising
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Why We Display Ads</h2>
                <p className="text-neutral-700 mb-4">
                  NiiInfoMed is committed to providing free, high-quality health information to everyone. To keep our content free and accessible, we display advertisements from trusted partners, including Google AdSense.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Advertising Partners</h2>
                <p className="text-neutral-700 mb-4">We work with the following advertising partners:</p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li><strong>Google AdSense:</strong> Our primary advertising partner that displays relevant ads based on content and user interests</li>
                  <li>Other third-party ad networks that meet our quality standards</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">How Ads Work on Our Site</h2>
                <p className="text-neutral-700 mb-4">
                  Advertisements on our website are served by third-party advertising companies. These companies may use information about your visits to this and other websites to provide advertisements about goods and services that may interest you.
                </p>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">Information Used for Advertising</h3>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Pages you visit on our website</li>
                  <li>Your general location (city/country level)</li>
                  <li>Device type and browser information</li>
                  <li>Previous browsing history across the web (via cookies)</li>
                </ul>
                <p className="text-neutral-700 mb-4">
                  <strong>Note:</strong> Advertisers do NOT receive your personal information such as name, email address, or phone number.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Editorial Independence</h2>
                <p className="text-neutral-700 mb-4">
                  Our editorial content is completely independent from our advertising. Advertisers have no influence over our health information, articles, or medical advice. We maintain a strict separation between advertising and editorial content.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Ad Quality Standards</h2>
                <p className="text-neutral-700 mb-4">We do our best to ensure ads meet these standards:</p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>No misleading or false health claims</li>
                  <li>No promotion of dangerous or unproven treatments</li>
                  <li>Compliance with medical advertising regulations</li>
                  <li>Appropriate content for a health information website</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Managing Your Ad Preferences</h2>
                <p className="text-neutral-700 mb-4">You have control over the ads you see:</p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>
                    <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      Google Ads Settings
                    </a> - Manage personalized ads from Google
                  </li>
                  <li>
                    <a href="https://optout.aboutads.info/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      Digital Advertising Alliance Opt-Out
                    </a> - Opt out of interest-based advertising
                  </li>
                  <li>Use browser settings to block third-party cookies</li>
                  <li>Use browser extensions to manage ads</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Reporting Inappropriate Ads</h2>
                <p className="text-neutral-700 mb-4">
                  If you see an advertisement that you believe is inappropriate or violates our advertising policies, please report it to us at: <a href="mailto:ads@niinfomed.com" className="text-primary hover:underline">ads@niinfomed.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
