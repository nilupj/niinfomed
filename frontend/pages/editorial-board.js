import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { NextSeo } from 'next-seo';

// Server-side data fetching
export async function getServerSideProps(context) {
  try {
    // Determine base URL for API calls
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const host = context.req.headers.host;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    
    // Try to fetch authors from CMS API
    const apiUrl = `${baseUrl}/cms-api/authors/`;
    console.log('Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for server-side fetch
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      throw new Error(`Failed to fetch authors: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const allAuthors = data.authors || data || [];
    console.log('Fetched authors:', allAuthors.length);
    
    // Categorize authors
    const editorsList = allAuthors.filter(a => 
      a.role === 'editor' || 
      a.role === 'section_editor' || 
      a.is_editor === true
    );
    
    const reviewersList = allAuthors.filter(a => 
      a.role === 'reviewer' || 
      a.is_reviewer === true ||
      (a.credentials && (
        a.credentials.toLowerCase().includes('md') ||
        a.credentials.toLowerCase().includes('mbbs') ||
        a.credentials.toLowerCase().includes('dr') ||
        a.credentials.toLowerCase().includes('phd')
      ))
    );
    
    // If no specific roles found, split all authors
    if (editorsList.length === 0 && reviewersList.length === 0 && allAuthors.length > 0) {
      return {
        props: {
          initialEditors: allAuthors.slice(0, Math.ceil(allAuthors.length / 2)),
          initialReviewers: allAuthors.slice(Math.ceil(allAuthors.length / 2)),
          hasData: true,
          apiError: false,
        }
      };
    }
    
    return {
      props: {
        initialEditors: editorsList,
        initialReviewers: reviewersList.length > 0 ? reviewersList : allAuthors,
        hasData: allAuthors.length > 0,
        apiError: false,
      }
    };
    
  } catch (error) {
    console.error('Error in getServerSideProps:', error.message);
    return {
      props: {
        initialEditors: [],
        initialReviewers: [],
        hasData: false,
        apiError: true,
        errorMessage: error.message,
      }
    };
  }
}

const getProxiedImageUrl = (url) => {
  if (!url) return null;
  
  // Handle various CMS URL formats
  if (url.startsWith('http://0.0.0.0:8001')) {
    return url
      .replace('http://0.0.0.0:8001', '/cms-media')
      .replace('/cms-media/media/', '/cms-media/');
  }
  if (url.startsWith('http://127.0.0.1:8001')) {
    return url
      .replace('http://127.0.0.1:8001', '/cms-media')
      .replace('/cms-media/media/', '/cms-media/');
  }
  if (url.startsWith('/media/')) {
    return `/cms-media${url.replace('/media/', '/')}`;
  }
  return url;
};

// Default fallback team members
const FALLBACK_TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Dr. Sunil Shroff',
    credentials: 'MBBS, MS, FRCS (UK), D. Urol (Lond)',
    title: 'Editorial Director, Chief Medical Officer',
    role: 'Section Editor - Urology & Kidney Transplantation',
    bio: 'Dr. Sunil Shroff is the Editorial Director and Chief Medical Officer at HealthInfo and heads its Medical Review and Editorial Teams. Dr. Shroff is a visiting consultant Urologist & Kidney Transplant Surgeon with the Madras Medical Mission & Chennai, India. He has extensive experience in kidney transplantation and urological surgeries.',
    slug: 'dr-sunil-shroff',
    image: null,
    specialization: 'Urology, Kidney Transplantation'
  },
  {
    id: 2,
    name: 'Dr. Chandra Shekar Annamalai',
    credentials: 'MBBS, MD (Internal Medicine), DNB (Nephrology), Fellowship of the American Society of Nephrology (FASN), MSc Organ Transplantation',
    role: 'Section Editor - Nephrology & Transplantation',
    bio: 'Dr. Chandra Shekar Annamalai is a nephrologist and transplant physician from Bangalore. He has considerable expertise in dialysis, renal transplantation involving both living and deceased donors, and preventative nephrology. He also actively engages in teaching and medical education.',
    slug: 'dr-chandra-shekar-annamalai',
    image: null,
    specialization: 'Nephrology, Organ Transplantation'
  },
  {
    id: 3,
    name: 'Dr. Jasmine Sethi',
    credentials: 'MBBS, MD (Medicine), DM Nephrology',
    role: 'Section Editor',
    bio: 'Dr. Jasmine Sethi is working as Consultant Nephrologist (Assistant Professor) in PGIMER Chandigarh. Her area of interest include Glomerulonephritis/Onconephrology/ Acute Kidney injury and Transplantation. She is also actively involved in online social media education for medical professionals.',
    slug: 'dr-jasmine-sethi',
    image: null,
    specialization: 'Nephrology, Kidney Diseases'
  },
  {
    id: 4,
    name: 'Dr. Avinash Ramani',
    credentials: 'BTech, MS (By Research-Engg) & PhD',
    role: 'Section Editor - Immunology & Bioinformatics',
    bio: 'Dr. Avinash Ramani earned his BTech and Master\'s in Bioinformatics from Anna University and conducted significant research at IIT Madras. His innovations in cfDNA-based diagnostics have led to a US Patent, multiple government grants, and advancements in early cancer detection.',
    slug: 'dr-avinash-ramani',
    image: null,
    specialization: 'Bioinformatics, Immunology, Cancer Research'
  },
  {
    id: 5,
    name: 'Dr. Pavan Kumar Bapatla',
    credentials: 'M.Sc, Ph.D (Biotechnology)',
    role: 'Section Editor - Immunology & Bioinformatics',
    bio: 'Dr. Pavan Kumar Bapatla holds a Ph.D. in Biotechnology, with postdoctoral research at the Volcani Center in Israel. He specializes in epi-genetics and molecular biology. He has keen interest in genomic technologies and their applications in personalized medicine.',
    slug: 'dr-pavan-kumar-bapatla',
    image: null,
    specialization: 'Biotechnology, Genetics, Molecular Biology'
  },
  {
    id: 6,
    name: 'Dr. Arun Narayanaswamy',
    credentials: 'MBBS, MS(Gen Surg), DNB(Gen Surg), MCh(Urol), DNB(Urol)',
    role: 'Section Editor - Urologist',
    bio: 'Dr. Arun Narayanaswamy completed his bachelor\'s degree in medicine, masters in surgery, and super specialisation in urology. He has 27 years of experience in Urology and has been involved in teaching undergraduates, surgical postgraduates, urology postgraduates.',
    slug: 'dr-arun-narayanaswamy',
    image: null,
    specialization: 'Urology, Surgery'
  },
  {
    id: 7,
    name: 'Dr. Bhavani Gunasekaran',
    credentials: 'M.Sc, Ph.D (Bio Medical Genetics)',
    role: 'Section Editor - Genetics',
    bio: 'Dr. Bhavani Gunasekaran specializes in biomedical genetics. She earned her Ph.D. in Biomedical Genetics from the University of Madras. Dr. Bhavani is also a Level 1 BSGI-approved Genetic Counsellor. As the Quality Manager for NABL Medical Testing, she ensures the highest standards in genetic testing.',
    slug: 'dr-bhavani-gunasekaran',
    image: null,
    specialization: 'Genetics, Genetic Counseling'
  }
];

export default function EditorialBoard({ 
  initialEditors = [], 
  initialReviewers = [], 
  hasData = false,
  apiError = false,
  errorMessage = ''
}) {
  const [editors, setEditors] = useState(initialEditors);
  const [reviewers, setReviewers] = useState(initialReviewers);
  const [loading, setLoading] = useState(!hasData);
  const [error, setError] = useState(apiError ? errorMessage : '');

  useEffect(() => {
    // Only fetch client-side if server-side failed
    if (!hasData && !apiError) {
      const fetchEditorialTeam = async () => {
        try {
          console.log('Fetching editorial team client-side...');
          const response = await fetch('/cms-api/authors/', {
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          const allAuthors = data.authors || data || [];
          
          if (allAuthors.length === 0) {
            setEditors(FALLBACK_TEAM_MEMBERS.slice(0, Math.ceil(FALLBACK_TEAM_MEMBERS.length / 2)));
            setReviewers(FALLBACK_TEAM_MEMBERS.slice(Math.ceil(FALLBACK_TEAM_MEMBERS.length / 2)));
            setLoading(false);
            return;
          }
          
          const editorsList = allAuthors.filter(a => 
            a.role === 'editor' || 
            a.role === 'section_editor' || 
            a.is_editor === true
          );
          
          const reviewersList = allAuthors.filter(a => 
            a.role === 'reviewer' || 
            a.is_reviewer === true ||
            (a.credentials && (
              a.credentials.toLowerCase().includes('md') ||
              a.credentials.toLowerCase().includes('mbbs') ||
              a.credentials.toLowerCase().includes('dr') ||
              a.credentials.toLowerCase().includes('phd')
            ))
          );
          
          if (editorsList.length === 0 && reviewersList.length === 0) {
            setEditors(allAuthors.slice(0, Math.ceil(allAuthors.length / 2)));
            setReviewers(allAuthors.slice(Math.ceil(allAuthors.length / 2)));
          } else {
            setEditors(editorsList);
            setReviewers(reviewersList.length > 0 ? reviewersList : allAuthors);
          }
          
          setError('');
          setLoading(false);
          
        } catch (error) {
          console.error('Error fetching editorial team:', error);
          setError('Unable to load editorial team data. Showing sample team members.');
          setEditors(FALLBACK_TEAM_MEMBERS.slice(0, Math.ceil(FALLBACK_TEAM_MEMBERS.length / 2)));
          setReviewers(FALLBACK_TEAM_MEMBERS.slice(Math.ceil(FALLBACK_TEAM_MEMBERS.length / 2)));
          setLoading(false);
        }
      };

      fetchEditorialTeam();
    } else if (apiError) {
      // Use fallback if API error occurred on server
      setEditors(FALLBACK_TEAM_MEMBERS.slice(0, Math.ceil(FALLBACK_TEAM_MEMBERS.length / 2)));
      setReviewers(FALLBACK_TEAM_MEMBERS.slice(Math.ceil(FALLBACK_TEAM_MEMBERS.length / 2)));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [hasData, apiError]);

  const TeamMemberCard = ({ member, role }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300" data-testid={`card-member-${member.slug || member.id}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 relative">
          <div className="w-1 h-full bg-blue-600 rounded-l absolute -left-6 top-0 bottom-0"></div>
          {member.image ? (
            <img
              src={getProxiedImageUrl(member.image)}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
              {member.name?.charAt(0) || 'M'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <Link 
            href={`/authors/${member.slug || 'staff'}`}
            className="text-lg font-bold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
            data-testid={`link-author-${member.slug || member.id}`}
          >
            {member.name}
          </Link>
          {member.credentials && (
            <span className="text-gray-600 ml-1 text-sm">, {member.credentials}</span>
          )}
          
          {member.title && (
            <p className="text-blue-600 font-medium text-sm mt-1">{member.title}</p>
          )}
          
          {role && (
            <p className="text-gray-700 font-medium text-sm mt-1 bg-blue-50 px-2 py-1 rounded inline-block">
              {role}
            </p>
          )}
          
          {member.bio && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">
              {member.bio}
              {member.bio.length > 150 && (
                <Link href={`/authors/${member.slug || 'staff'}`} className="text-blue-600 hover:underline ml-1">
                  view more...
                </Link>
              )}
            </p>
          )}
          
          {member.specialization && (
            <p className="text-sm text-gray-500 mt-2">
              <span className="font-medium">Specialty:</span> {member.specialization}
            </p>
          )}
          
          <div className="flex gap-2 mt-3">
            {member.linkedin && (
              <a 
                href={member.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
                aria-label={`${member.name}'s LinkedIn profile`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
            {member.twitter && (
              <a 
                href={member.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-500 hover:text-blue-400 transition-colors"
                aria-label={`${member.name}'s Twitter profile`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const allMembers = [...editors, ...reviewers];
  const uniqueMembers = allMembers.filter((member, index, self) => 
    index === self.findIndex(m => m.slug === member.slug || m.id === member.id)
  );

  // Use fallback if no members
  const displayMembers = uniqueMembers.length > 0 ? uniqueMembers : FALLBACK_TEAM_MEMBERS;

  return (
    <Layout>
      <NextSeo
        title="Editorial Board & Medical Review Team | HealthInfo"
        description="Meet HealthInfo's Editorial Board & Medical Review Team - highly qualified medical doctors, specialists, and healthcare professionals who ensure all health content is trustworthy, accurate, and evidence-based."
        canonical="https://healthinfo.com/editorial-board"
        openGraph={{
          title: 'Editorial Board & Medical Review Team | HealthInfo',
          description: 'Meet our team of medical experts who review and validate all health content.',
          type: 'website',
          url: 'https://healthinfo.com/editorial-board',
          site_name: 'HealthInfo',
        }}
      />

      <div className="bg-gradient-to-r from-blue-50 to-gray-50 py-4 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  HealthInfo
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-800 font-medium">Editorial Board</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-blue-800 mb-4" data-testid="text-page-title">
              HealthInfo Editorial Board & Medical Review Team
            </h1>
            <p className="text-gray-600 text-lg">
              Our team of medical experts ensures the accuracy and reliability of all health information
            </p>
          </header>

          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-blue-600">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The <strong>Editorial Board & Medical Review Team</strong> of HealthInfo consists of highly qualified medical doctors, specialists, experts and healthcare professionals. They work closely to ensure that all published health content on the site is trustworthy, accurate, and backed by the latest medical research and clinical studies.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Every article undergoes a rigorous review process where content is validated with references, citations, and evidence-based guidelines. Our editorial board is an integral part of <Link href="/about" className="text-blue-600 hover:underline font-medium">HealthInfo's content development process</Link>, contributing their expertise to maintain the highest standards of medical accuracy.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link 
                  href="/about" 
                  className="inline-block bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition text-sm font-medium shadow-sm"
                  data-testid="link-health-insurance"
                >
                  About HealthInfo
                </Link>
                <Link 
                  href="/conditions" 
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition text-sm font-medium shadow-sm"
                >
                  Browse Medical Conditions
                </Link>
                <Link 
                  href="/contact" 
                  className="inline-block border border-blue-500 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition text-sm font-medium"
                >
                  Contact Our Team
                </Link>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                HealthInfo's Editorial Board & Review Team
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {displayMembers.length} {displayMembers.length === 1 ? 'Member' : 'Members'}
              </span>
            </div>

            {displayMembers.length > 0 ? (
              <div className="space-y-6">
                {displayMembers.map((member, index) => (
                  <div key={member.slug || member.id || index} className="relative">
                    <TeamMemberCard 
                      member={member} 
                      role={member.role === 'editor' ? 'Editorial Director' : 
                            member.role === 'section_editor' ? 'Section Editor' : 
                            member.credentials?.includes('MD') ? 'Medical Reviewer' :
                            member.credentials?.includes('MBBS') ? 'Medical Reviewer' :
                            member.credentials?.includes('Dr.') ? 'Medical Expert' :
                            'Content Contributor'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Team Members Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Our editorial team information is currently being updated. Please check back soon or contact us for more information.
                </p>
              </div>
            )}
          </section>

          <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8 border border-blue-100">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Join Our Editorial Team</h3>
              <p className="text-gray-700 mb-6 text-lg">
                Are you a qualified healthcare professional interested in contributing to evidence-based health information? 
                We're always looking for expert medical reviewers, content contributors, and specialists to join our team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-lg hover:shadow-xl"
                  data-testid="link-join-team"
                >
                  Contact Us to Join
                </Link>
                <Link 
                  href="/careers" 
                  className="inline-block border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  View Career Opportunities
                </Link>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                We welcome medical doctors, researchers, nurses, pharmacists, and healthcare specialists.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-2">Content Review Process</h4>
                <p className="text-gray-600 text-sm">
                  All medical content undergoes multiple review stages by qualified professionals before publication.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-2">Evidence-Based Guidelines</h4>
                <p className="text-gray-600 text-sm">
                  We follow the latest clinical guidelines and research from reputable medical institutions.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-2">Regular Updates</h4>
                <p className="text-gray-600 text-sm">
                  Medical content is regularly reviewed and updated to reflect new research and guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}