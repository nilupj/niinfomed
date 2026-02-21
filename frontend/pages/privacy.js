
import Layout from '../components/Layout';
import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <Layout>
      <SEO 
        title="Privacy Policy - How We Protect Your Data"
        description="Learn about how we collect, use, and protect your personal information. Read our comprehensive privacy policy."
      />
      
      <div className="bg-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-neutral-600 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Introduction</h2>
                <p className="text-neutral-700 mb-4">
                  We respect your privacy and are committed to protecting your personal data. This privacy policy 
                  explains how we collect, use, and safeguard your information when you visit our website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Information We Collect</h2>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Name and contact information when you subscribe to our newsletter</li>
                  <li>Email address for account creation and communication</li>
                  <li>Comments and feedback you provide on our articles</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-800 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>IP address and browser information</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website and search terms used</li>
                  <li>Device type and operating system</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">How We Use Your Information</h2>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>To provide and improve our health information services</li>
                  <li>To send you newsletters and updates (with your consent)</li>
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To analyze website usage and improve user experience</li>
                  <li>To detect and prevent fraudulent activity</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Cookies and Tracking</h2>
                <p className="text-neutral-700 mb-4">
                  We use cookies and similar tracking technologies to enhance your browsing experience. You can 
                  control cookie settings through your browser preferences. Our cookies include:
                </p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for site functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Data Sharing and Disclosure</h2>
                <p className="text-neutral-700 mb-4">
                  We do not sell your personal information. We may share your data with:
                </p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Service providers who help us operate our website</li>
                  <li>Analytics partners to improve our services</li>
                  <li>Law enforcement when required by law</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Your Rights</h2>
                <p className="text-neutral-700 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to data processing</li>
                  <li>Request data portability</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Data Security</h2>
                <p className="text-neutral-700 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal data 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Children's Privacy</h2>
                <p className="text-neutral-700 mb-4">
                  Our website is not directed to children under 13. We do not knowingly collect personal 
                  information from children under 13 years of age.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Changes to This Policy</h2>
                <p className="text-neutral-700 mb-4">
                  We may update this privacy policy from time to time. We will notify you of any changes by 
                  posting the new policy on this page with an updated revision date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Advertising</h2>
                <p className="text-neutral-700 mb-4">
                  We use third-party advertising companies to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
                </p>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">Google AdSense</h3>
                <p className="text-neutral-700 mb-4">
                  We use Google AdSense to display advertisements. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Third-Party Privacy Policies</h2>
                <p className="text-neutral-700 mb-4">
                  Our Privacy Policy does not apply to other advertisers or websites. We advise you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">GDPR and CCPA Compliance</h2>
                <p className="text-neutral-700 mb-4">
                  If you are a resident of the European Economic Area (EEA) or California, you have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your personal data.
                </p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>The right to access – You have the right to request copies of your personal data</li>
                  <li>The right to rectification – You have the right to request correction of inaccurate information</li>
                  <li>The right to erasure – You have the right to request deletion of your personal data</li>
                  <li>The right to restrict processing – You have the right to request restriction of processing</li>
                  <li>The right to object to processing – You have the right to object to our processing</li>
                  <li>The right to data portability – You have the right to request transfer of your data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h2>
                <p className="text-neutral-700 mb-4">
                  If you have questions about this privacy policy or how we handle your data, please contact us at:
                </p>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-neutral-700">
                    Email: privacy@niinfomed.com<br />
                    Phone: +1 (XXX) XXX-XXXX<br />
                    Address: [Your Business Address]
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
