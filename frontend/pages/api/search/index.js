export const runtime = "edge";
const allArticles = [
  {
    id: 1,
    title: 'COVID-19 Updates: What You Need to Know',
    slug: 'covid-19-updates',
    summary: 'Latest information on COVID-19 variants, vaccines, and prevention measures.',
    category: { name: 'Infectious Disease', slug: 'infectious-disease' },
    type: 'article'
  },
  {
    id: 2,
    title: 'Understanding Heart Health: Risk Factors and Prevention',
    slug: 'understanding-heart-health',
    summary: 'Learn about the key risk factors for heart disease and effective prevention strategies.',
    category: { name: 'Cardiology', slug: 'cardiology' },
    type: 'article'
  },
  {
    id: 3,
    title: 'Mental Health Awareness: Breaking the Stigma',
    slug: 'mental-health-awareness',
    summary: "Why it's important to discuss mental health openly and seek help when needed.",
    category: { name: 'Mental Health', slug: 'mental-health' },
    type: 'article'
  },
  {
    id: 4,
    title: 'Nutrition Myths: Separating Fact from Fiction',
    slug: 'nutrition-myths',
    summary: 'Debunking common misconceptions about diet and nutrition for better health.',
    category: { name: 'Nutrition', slug: 'nutrition' },
    type: 'article'
  },
  {
    id: 5,
    title: 'Sleep Hygiene: Tips for Better Rest',
    slug: 'sleep-hygiene-tips',
    summary: 'Simple changes to improve your sleep quality and overall health.',
    category: { name: 'Wellness', slug: 'wellness' },
    type: 'article'
  },
  {
    id: 6,
    title: 'Exercise for Beginners: Starting a Sustainable Routine',
    slug: 'exercise-for-beginners',
    summary: 'How to build an exercise habit that lasts without getting overwhelmed.',
    category: { name: 'Fitness', slug: 'fitness' },
    type: 'article'
  },
  {
    id: 7,
    title: 'Stress Management Techniques That Actually Work',
    slug: 'stress-management-techniques',
    summary: 'Practical approaches to reduce stress and improve your mental wellbeing.',
    category: { name: 'Mental Health', slug: 'mental-health' },
    type: 'article'
  },
  {
    id: 8,
    title: 'Healthy Eating on a Budget: Smart Shopping Guide',
    slug: 'healthy-eating-budget',
    summary: 'Tips for nutritious meals without breaking the bank.',
    category: { name: 'Nutrition', slug: 'nutrition' },
    type: 'article'
  }
];

const conditions = [
  { id: 101, title: 'Diabetes', slug: 'diabetes', summary: 'A metabolic disease that causes high blood sugar.', type: 'condition' },
  { id: 102, title: 'Hypertension', slug: 'hypertension', summary: 'High blood pressure that can lead to heart disease.', type: 'condition' },
  { id: 103, title: 'Asthma', slug: 'asthma', summary: 'A condition affecting the airways in the lungs.', type: 'condition' },
  { id: 104, title: 'Arthritis', slug: 'arthritis', summary: 'Inflammation of one or more joints.', type: 'condition' },
  { id: 105, title: 'Depression', slug: 'depression', summary: 'A mood disorder causing persistent feelings of sadness.', type: 'condition' }
];

const drugs = [
  { id: 201, title: 'Metformin', slug: 'metformin', summary: 'A medication used to treat type 2 diabetes.', type: 'drug' },
  { id: 202, title: 'Lisinopril', slug: 'lisinopril', summary: 'An ACE inhibitor used to treat high blood pressure.', type: 'drug' },
  { id: 203, title: 'Ibuprofen', slug: 'ibuprofen', summary: 'A nonsteroidal anti-inflammatory drug (NSAID).', type: 'drug' },
  { id: 204, title: 'Amoxicillin', slug: 'amoxicillin', summary: 'An antibiotic used to treat various bacterial infections.', type: 'drug' }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, type, limit = 20, lang = 'en' } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:8001';

    // Search across multiple content types
    const searchPromises = [];
    const contentTypes = type ? [type] : ['articles', 'conditions', 'drugs', 'news', 'wellness', 'remedies'];

    for (const contentType of contentTypes) {
      let endpoint = '';
      switch(contentType) {
        case 'articles':
          endpoint = `${API_BASE_URL}/api/articles/top-stories?lang=${lang}`;
          break;
        case 'conditions':
          endpoint = `${API_BASE_URL}/api/conditions/?lang=${lang}`;
          break;
        case 'drugs':
          endpoint = `${API_BASE_URL}/api/drugs/?lang=${lang}`;
          break;
        case 'news':
          endpoint = `${API_BASE_URL}/api/news/latest?limit=100&lang=${lang}`;
          break;
        case 'wellness':
          endpoint = `${API_BASE_URL}/api/wellness/topics?limit=100&lang=${lang}`;
          break;
        case 'remedies':
          endpoint = `${API_BASE_URL}/api/remedies/?lang=${lang}`;
          break;
        default:
          continue;
      }

      searchPromises.push(
        fetch(endpoint)
          .then(res => res.ok ? res.json() : { results: [] })
          .then(data => ({
            type: contentType,
            items: data.results || data.articles || data.conditions || data.topics || []
          }))
          .catch(() => ({ type: contentType, items: [] }))
      );
    }

    const results = await Promise.all(searchPromises);

    // Filter and combine results based on search query
    const searchLower = q.toLowerCase();
    const filteredResults = [];

    for (const result of results) {
      const filtered = result.items.filter(item => {
        const title = item.title || '';
        const subtitle = item.subtitle || '';
        const description = item.description || item.also_known_as || '';

        return title.toLowerCase().includes(searchLower) ||
               subtitle.toLowerCase().includes(searchLower) ||
               description.toLowerCase().includes(searchLower);
      }).slice(0, 10);

      filteredResults.push(...filtered.map(item => ({
        ...item,
        type: result.type
      })));
    }

    return res.status(200).json({
      results: filteredResults.slice(0, parseInt(limit)),
      total: filteredResults.length,
      query: q
    });
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch search results',
      message: error.message 
    });
  }
}