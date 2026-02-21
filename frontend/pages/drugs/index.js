
import { useState, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function DrugsIndex({ initialDrugs }) {
  const [drugs, setDrugs] = useState(initialDrugs || []);
  const [filteredDrugs, setFilteredDrugs] = useState(initialDrugs || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    let filtered = drugs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(drug =>
        drug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drug.generic_name && drug.generic_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (drug.brand_names && drug.brand_names.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by letter
    if (selectedLetter !== 'All') {
      filtered = filtered.filter(drug =>
        drug.title.toUpperCase().startsWith(selectedLetter)
      );
    }

    setFilteredDrugs(filtered);
  }, [searchTerm, selectedLetter, drugs]);

  // Group drugs by first letter
  const groupedDrugs = filteredDrugs.reduce((acc, drug) => {
    const firstLetter = drug.title[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(drug);
    return acc;
  }, {});

  return (
    <Layout>
      <NextSeo
        title="Drugs & Supplements A-Z - Complete Drug Information"
        description="Browse our comprehensive database of drugs and supplements. Find information on uses, dosage, side effects, and more."
      />

      <div className="bg-primary/10 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-primary mb-4">Drugs & Supplements A-Z</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Find detailed information about medications, supplements, and over-the-counter drugs including uses, dosage, side effects, and precautions.
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search drugs by name, generic name, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Alphabet Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLetter('All')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedLetter === 'All'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedLetter === letter
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          Showing {filteredDrugs.length} of {drugs.length} drugs
        </p>

        {/* Drugs List */}
        {Object.keys(groupedDrugs).sort().map(letter => (
          <div key={letter} id={letter} className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4 border-b-2 border-primary pb-2">
              {letter}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedDrugs[letter].map(drug => (
                <Link
                  key={drug.id}
                  href={`/drugs/${drug.slug}`}
                  className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {drug.title}
                  </h3>
                  {drug.generic_name && (
                    <p className="text-sm text-gray-600 mb-1">
                      Generic: {drug.generic_name}
                    </p>
                  )}
                  {drug.drug_class && (
                    <p className="text-sm text-gray-500">
                      Class: {drug.drug_class}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filteredDrugs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No drugs found matching your search.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:8001';
    const response = await fetch(`${apiUrl}/api/drugs/`);
    
    if (!response.ok) {
      console.error('Failed to fetch drugs:', response.status);
      return {
        props: {
          initialDrugs: [],
        },
        revalidate: 3600,
      };
    }

    const data = await response.json();
    // Handle both array response and {results: []} format
    const drugs = Array.isArray(data) ? data : (data.results || []);

    return {
      props: {
        initialDrugs: drugs,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return {
      props: {
        initialDrugs: [],
      },
      revalidate: 3600,
    };
  }
}
