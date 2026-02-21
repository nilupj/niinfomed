
import Layout from '../components/Layout';
import SEO from '../components/SEO';

export default function Disclaimer() {
  return (
    <Layout>
      <SEO 
        title="Medical Disclaimer - Important Health Information Notice"
        description="Read our medical disclaimer regarding the health information provided on our website. Understand the limitations and proper use of our content."
      />
      
      <div className="bg-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Medical Disclaimer
            </h1>
            <p className="text-neutral-600 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg max-w-none">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
                <p className="text-neutral-900 font-bold text-xl mb-3">
                  ⚠️ IMPORTANT NOTICE
                </p>
                <p className="text-neutral-700 mb-2">
                  The information provided on NiiInfoMed is for educational and informational purposes only. It is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Doctor-Patient Relationship</h2>
                <p className="text-neutral-700 mb-4">
                  The content on this website does not create a doctor-patient relationship between you and NiiInfoMed or any of our content contributors. You should not rely on information from this website as an alternative to medical advice from your doctor or other professional healthcare provider.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Always Seek Professional Medical Advice</h2>
                <ul className="list-disc pl-6 mb-4 text-neutral-700 space-y-2">
                  <li>Always seek the advice of your physician or qualified health provider with any questions regarding a medical condition</li>
                  <li>Never disregard professional medical advice or delay seeking it because of something you have read on this website</li>
                  <li>If you think you may have a medical emergency, call your doctor or emergency services immediately</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Guarantees or Warranties</h2>
                <p className="text-neutral-700 mb-4">
                  While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Limitation of Liability</h2>
                <p className="text-neutral-700 mb-4">
                  NiiInfoMed will not be liable for any loss or damage including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">External Links Disclaimer</h2>
                <p className="text-neutral-700 mb-4">
                  Our website may contain links to external websites that are not provided or maintained by or in any way affiliated with NiiInfoMed. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Advertising Disclaimer</h2>
                <p className="text-neutral-700 mb-4">
                  This website may display advertisements and receive compensation from third-party advertisers. The presence of advertising does not constitute an endorsement, guarantee, or approval of the advertised products or services. We are not responsible for the content of advertisements or the practices of advertisers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Information</h2>
                <p className="text-neutral-700 mb-4">
                  If you have any questions about this disclaimer, please contact us:
                </p>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-neutral-700">
                    Email: info@niinfomed.com<br />
                    Phone: +1 (XXX) XXX-XXXX
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
