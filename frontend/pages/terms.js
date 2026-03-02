
import Layout from '../components/Layout';
import SEO from '../components/SEO';
export default function Terms() {
  return (
    <Layout>
      <SEO 
        title="Terms of Service - Legal Terms and Conditions"
        description="Read our terms of service to understand the rules and regulations for using our health information platform."
      />
      
      <div className="bg-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-neutral-600 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Agreement to Terms</h2>
                <p className="text-neutral-700 mb-4">
                  By accessing and using this website, you accept and agree to be bound by the terms and provisions 
                  of this agreement. If you do not agree to these terms, please do not use this website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Medical Disclaimer</h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-4">
                  <p className="text-neutral-700 font-semibold mb-2">
                    IMPORTANT: The information provided on this website is for educational purposes only.
                  </p>
                  <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                    <li>This website does not provide medical advice, diagnosis, or treatment</li>
                    <li>Always seek the advice of your physician or qualified health provider</li>
                    <li>Never disregard professional medical advice or delay seeking it</li>
                    <li>This information is not intended to replace professional medical care</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Use License</h2>
                <p className="text-neutral-700 mb-4">
                  Permission is granted to temporarily download one copy of the materials on our website for 
                  personal, non-commercial transitory viewing only. This license shall automatically terminate if 
                  you violate any of these restrictions.
                </p>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">You may not:</h3>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for commercial purposes</li>
                  <li>Attempt to reverse engineer any software</li>
                  <li>Remove copyright or proprietary notations</li>
                  <li>Transfer the materials to another person</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">User Conduct</h2>
                <p className="text-neutral-700 mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Post false, inaccurate, or misleading information</li>
                  <li>Impersonate any person or entity</li>
                  <li>Post content that is illegal, harmful, or offensive</li>
                  <li>Violate any intellectual property rights</li>
                  <li>Transmit viruses or malicious code</li>
                  <li>Harvest or collect user information</li>
                  <li>Interfere with the website's operation</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Intellectual Property</h2>
                <p className="text-neutral-700 mb-4">
                  All content on this website, including text, graphics, logos, images, and software, is the 
                  property of our organization or its content suppliers and is protected by copyright laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">User Content</h2>
                <p className="text-neutral-700 mb-4">
                  By posting content on our website (comments, reviews, etc.), you grant us a non-exclusive, 
                  royalty-free, perpetual license to use, reproduce, modify, and display such content.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Disclaimer of Warranties</h2>
                <p className="text-neutral-700 mb-4">
                  The materials on our website are provided on an 'as is' basis. We make no warranties, expressed 
                  or implied, and hereby disclaim all other warranties including, without limitation, implied 
                  warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Limitation of Liability</h2>
                <p className="text-neutral-700 mb-4">
                  We shall not be liable for any damages arising out of the use or inability to use the materials 
                  on our website, even if we have been notified of the possibility of such damage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Links to Third-Party Sites</h2>
                <p className="text-neutral-700 mb-4">
                  Our website may contain links to third-party websites. We have no control over and assume no 
                  responsibility for the content, privacy policies, or practices of any third-party sites.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Modifications</h2>
                <p className="text-neutral-700 mb-4">
                  We reserve the right to revise these terms of service at any time. By continuing to use this 
                  website, you agree to be bound by the current version of these terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Governing Law</h2>
                <p className="text-neutral-700 mb-4">
                  These terms shall be governed by and construed in accordance with applicable laws, without 
                  regard to its conflict of law provisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Advertising and Sponsored Content</h2>
                <p className="text-neutral-700 mb-4">
                  Our website displays advertisements from third-party advertising networks, including Google AdSense. We may also feature sponsored content, which will be clearly labeled as such.
                </p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Advertisers are solely responsible for the content of their advertisements</li>
                  <li>We do not endorse any advertised products or services</li>
                  <li>Clicking on advertisements may result in you leaving our website</li>
                  <li>We are not responsible for the privacy practices of advertisers</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Prohibited Activities</h2>
                <p className="text-neutral-700 mb-4">You must not:</p>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Click on advertisements fraudulently or encourage others to do so</li>
                  <li>Manipulate ad impressions or clicks</li>
                  <li>Use automated means to interact with advertisements</li>
                  <li>Attempt to circumvent ad-blocking detection</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Information</h2>
                <p className="text-neutral-700 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-neutral-700">
                    Email: legal@niinfomed.com<br />
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
