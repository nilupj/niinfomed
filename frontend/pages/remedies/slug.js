
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import { fetchRemedyBySlug } from '../../utils/api';
import ShareButton from '../../components/ShareButton';
export default function RemedyDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [remedy, setRemedy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      loadRemedy();
    }
  }, [slug]);

  const loadRemedy = async () => {
    try {
      setLoading(true);
      const data = await fetchRemedyBySlug(slug);
      setRemedy(data);
    } catch (err) {
      console.error('Error loading remedy:', err);
      setError('Failed to load remedy');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-neutral-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !remedy) {
    return (
      <div className="container-custom py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Remedy Not Found</h1>
          <p className="text-neutral-600 mb-8">{error || 'The remedy you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${remedy.title} - Natural Remedies`}
        description={remedy.subtitle || remedy.also_known_as || 'Learn about this natural remedy'}
        image={remedy.image}
      />

      <article className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4">
              {remedy.remedy_type && (
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {remedy.remedy_type.name}
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-bold text-neutral-800 flex-1">{remedy.title}</h1>
              <ShareButton title={remedy.title} url={`https://healthinfo.com/remedies/${slug}`} />
            </div>
            
            {remedy.subtitle && (
              <p className="text-xl text-neutral-600 mb-4">{remedy.subtitle}</p>
            )}
            
            {remedy.also_known_as && (
              <p className="text-sm text-neutral-500 italic">
                Also known as: {remedy.also_known_as}
              </p>
            )}
          </header>

          {/* Medical Reviewer */}
          {remedy.reviewer && (
            <div className="flex items-center gap-3 mb-6 bg-blue-50 rounded-lg p-4">
              {remedy.reviewer.image && (
                <img 
                  src={remedy.reviewer.image} 
                  alt={remedy.reviewer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="text-sm">
                <span className="text-gray-600">Medically Reviewed by </span>
                <span className="font-semibold text-gray-800">{remedy.reviewer.name}</span>
                {remedy.reviewer.credentials && <span className="text-gray-600">, {remedy.reviewer.credentials}</span>}
              </div>
            </div>
          )}

          {/* Featured Image */}
          {remedy.image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={remedy.image}
                alt={remedy.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Overview */}
          {remedy.overview && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Overview</h2>
              <div 
                className="prose prose-lg max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: remedy.overview }}
              />
            </section>
          )}

          {/* Uses */}
          {remedy.uses && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Uses & Benefits</h2>
              <div 
                className="prose prose-lg max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: remedy.uses }}
              />
            </section>
          )}

          {/* Dosage */}
          {remedy.dosage && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Dosage & Usage</h2>
              <div 
                className="prose prose-lg max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: remedy.dosage }}
              />
            </section>
          )}

          {/* Benefits */}
          {remedy.benefits && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Health Benefits</h2>
              <div 
                className="prose prose-lg max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: remedy.benefits }}
              />
            </section>
          )}

          {/* Side Effects */}
          {remedy.side_effects && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Possible Side Effects</h2>
              <div 
                className="prose prose-lg max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: remedy.side_effects }}
              />
            </section>
          )}

          {/* Precautions */}
          {remedy.precautions && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Precautions</h2>
              <div 
                className="prose prose-lg max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: remedy.precautions }}
              />
            </section>
          )}

          {/* Medical Disclaimer */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm">
              <strong>Medical Disclaimer:</strong> The information provided in this article is for educational and
              informational purposes only. Always consult with a qualified healthcare provider before using any
              natural remedies or alternative treatments.
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
