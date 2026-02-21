const topStories = [
  {
    id: 1,
    title: 'COVID-19 Updates: What You Need to Know',
    slug: 'covid-19-updates',
    summary: 'Latest information on COVID-19 variants, vaccines, and prevention measures.',
    image: 'https://images.unsplash.com/photo-1584118624012-df056829fbd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
    published_date: '2025-03-15T08:00:00Z',
    author: { name: 'Dr. Sarah Johnson', credentials: 'MD, MPH' },
    category: { name: 'Infectious Disease', slug: 'infectious-disease' }
  },
  {
    id: 2,
    title: 'Understanding Heart Health: Risk Factors and Prevention',
    slug: 'understanding-heart-health',
    summary: 'Learn about the key risk factors for heart disease and effective prevention strategies.',
    image: 'https://images.unsplash.com/photo-1559757175-7b21671c7e96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-14T10:30:00Z',
    author: { name: 'Dr. Robert Chen', credentials: 'MD, FACC' },
    category: { name: 'Cardiology', slug: 'cardiology' }
  },
  {
    id: 3,
    title: 'Mental Health Awareness: Breaking the Stigma',
    slug: 'mental-health-awareness',
    summary: "Why it's important to discuss mental health openly and seek help when needed.",
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-13T09:45:00Z',
    author: { name: 'Dr. Emily Watson', credentials: 'Ph.D, Clinical Psychology' },
    category: { name: 'Mental Health', slug: 'mental-health' }
  },
  {
    id: 4,
    title: 'Nutrition Myths: Separating Fact from Fiction',
    slug: 'nutrition-myths',
    summary: 'Debunking common misconceptions about diet and nutrition for better health.',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-12T14:20:00Z',
    author: { name: 'Lisa Martinez', credentials: 'RD, LDN' },
    category: { name: 'Nutrition', slug: 'nutrition' }
  }
];

export default function handler(req, res) {
  res.status(200).json(topStories);
}
