
const relatedArticles = {
  'covid-19-updates': [
    {
      id: 2,
      title: 'Understanding Heart Health: Risk Factors and Prevention',
      slug: 'understanding-heart-health',
      summary: 'Learn about the key risk factors for heart disease.',
      image: 'https://images.unsplash.com/photo-1559757175-7b21671c7e96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80'
    },
    {
      id: 3,
      title: 'Mental Health Awareness: Breaking the Stigma',
      slug: 'mental-health-awareness',
      summary: "Why it's important to discuss mental health openly.",
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80'
    }
  ],
  'understanding-heart-health': [
    {
      id: 6,
      title: 'Exercise for Beginners: Starting a Sustainable Routine',
      slug: 'exercise-for-beginners',
      summary: 'How to build an exercise habit that lasts.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80'
    },
    {
      id: 4,
      title: 'Nutrition Myths: Separating Fact from Fiction',
      slug: 'nutrition-myths',
      summary: 'Debunking common misconceptions about diet.',
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80'
    }
  ],
  'mental-health-awareness': [
    {
      id: 7,
      title: 'Stress Management Techniques That Actually Work',
      slug: 'stress-management-techniques',
      summary: 'Practical approaches to reduce stress.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80'
    },
    {
      id: 5,
      title: 'Sleep Hygiene: Tips for Better Rest',
      slug: 'sleep-hygiene-tips',
      summary: 'Simple changes to improve your sleep quality.',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80'
    }
  ]
};

const defaultRelated = [
  {
    id: 1,
    title: 'COVID-19 Updates: What You Need to Know',
    slug: 'covid-19-updates',
    summary: 'Latest information on COVID-19.',
    image: 'https://images.unsplash.com/photo-1584118624012-df056829fbd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80'
  },
  {
    id: 4,
    title: 'Nutrition Myths: Separating Fact from Fiction',
    slug: 'nutrition-myths',
    summary: 'Debunking common misconceptions about diet.',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80'
  }
];
export const runtime = "edge";
export default function handler(req, res) {
  const { slug } = req.query;
  const related = relatedArticles[slug] || defaultRelated;
  res.status(200).json(related);
}
