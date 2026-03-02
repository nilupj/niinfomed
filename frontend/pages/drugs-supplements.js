import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { fetchDrugsIndex } from '../utils/api';
export default function DrugsSupplements({ drugsByLetter }) {
  const [activeTab, setActiveTab] = useState('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  useEffect(() => {
    console.log('Drugs data:', drugsByLetter);
    console.log('Active tab:', activeTab);
    console.log('Drugs for active tab:', drugsByLetter[activeTab]);
  }, [drugsByLetter, activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(`/api/drugs/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data);
      } else {
        console.error('Error searching drugs:', data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching drugs:', error);
      setSearchResults([]);
    }
  };

  // Clear search results when changing tabs
  const handleTabChange = (letter) => {
    setActiveTab(letter);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <>
      <NextSeo
        title="Drugs & Supplements - Niinfomed"
        description="Browse medications, supplements, and vitamins. Find detailed information on usage, side effects, interactions, and more."
        canonical="https://niinfomed.com/drugs-supplements"
      />
    
      <div className="container-custom py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Drugs & Supplements</h1>
          <p className="text-neutral-600">
            Find comprehensive information about prescription drugs, over-the-counter medicines, supplements, and vitamins.
          </p>
        </div>
        
        {/* Search box */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search for a drug or supplement..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-r-md transition-colors"
            >
              Search
            </button>
          </form>
        </div>
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Results for "{searchQuery}"</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                {searchResults.map((drug) => (
                  <Link
                    key={drug.slug}
                    href={`/drugs/${drug.slug}`}
                    className="py-2 text-primary hover:text-primary-light transition-colors border-b border-neutral-100"
                  >
                    {drug.name}
                    {drug.type && <span className="text-sm text-neutral-500 ml-2">({drug.type})</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Alphabet navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {alphabet.map((letter) => (
              <button
                key={letter}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === letter
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                onClick={() => handleTabChange(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="h-1 bg-primary"></div>
        </div>
        
        {/* Drugs/Supplements list */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {alphabet.map((letter) => (
            <div
              key={letter}
              className={`${activeTab === letter ? 'block' : 'hidden'}`}
            >
              <h2 className="text-2xl font-bold text-primary mb-4">{letter}</h2>
              
              {drugsByLetter[letter] && drugsByLetter[letter].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                  {drugsByLetter[letter].map((drug) => (
                    <Link
                      key={drug.id}
                      href={`/drugs/${drug.slug || drug.meta?.slug}`}
                      className="py-2 text-primary hover:text-primary-light transition-colors border-b border-neutral-100"
                    >
                      {drug.title}
                      {drug.brand_names && (
                        <span className="text-sm text-neutral-500 ml-2">({drug.brand_names})</span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 italic">No drugs or supplements found starting with this letter. Please add content in the Wagtail CMS admin.</p>
              )}
            </div>
          ))}
        </div>
        
        {/* Information sections */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Understanding Medications</h2>
            <p className="text-neutral-600 mb-4">
              Medications are substances used to diagnose, cure, treat, or prevent disease. They can be prescription or over-the-counter.
            </p>
            <h3 className="text-lg font-semibold mb-2">Important to Know</h3>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li>Follow your healthcare provider's instructions for taking medications</li>
              <li>Be aware of potential side effects and interactions</li>
              <li>Inform your provider about all medications you're taking, including OTC products</li>
              <li>Store medications properly according to instructions</li>
              <li>Dispose of unused medications safely</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Dietary Supplements</h2>
            <p className="text-neutral-600 mb-4">
              Dietary supplements include vitamins, minerals, herbs, amino acids, and other substances intended to supplement the diet.
            </p>
            <h3 className="text-lg font-semibold mb-2">Important to Know</h3>
            <ul className="list-disc pl-5 space-y-1 text-neutral-700">
              <li>Supplements are not intended to treat, diagnose, prevent, or cure diseases</li>
              <li>Some supplements can interact with medications</li>
              <li>Not all supplements have been tested for safety or effectiveness</li>
              <li>Natural doesn't always mean safe</li>
              <li>Consult with your healthcare provider before taking supplements</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const drugsData = await fetchDrugsIndex();
    
    // Organize drugs by first letter and ensure all values are serializable
    const drugsByLetter = {};
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
      drugsByLetter[letter] = drugsData
        .filter(drug => {
          const title = (drug.title || '').toUpperCase();
          return title.startsWith(letter);
        })
        .map(drug => ({
          id: drug.id || null,
          title: drug.title || '',
          slug: drug.slug || drug.meta?.slug || '',
          meta: drug.meta || { slug: drug.slug || '' },
          generic_name: drug.generic_name || null,
          brand_names: drug.brand_names || null,
          drug_class: drug.drug_class || null
        }));
    });

    console.log('Drugs organized by letter:', Object.keys(drugsByLetter).map(k => `${k}: ${drugsByLetter[k].length}`));

    return {
      props: {
        drugsByLetter,
        error: null
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching drugs index:', error);
    return {
      props: {
        drugsByLetter: {},
        error: 'Failed to load drugs data. Please try again later.'
      },
      revalidate: 60,
    };
  }
}
