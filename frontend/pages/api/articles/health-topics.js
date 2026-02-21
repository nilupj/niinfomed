const healthTopics = [
  {
    id: 5,
    title: 'Sleep Hygiene: Tips for Better Rest',
    slug: 'sleep-hygiene-tips',
    summary: 'Simple changes to improve your sleep quality and overall health.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-10T16:15:00Z',
    category: { name: 'Wellness', slug: 'wellness' }
  },
  {
    id: 6,
    title: 'Exercise for Beginners: Starting a Sustainable Routine',
    slug: 'exercise-for-beginners',
    summary: 'How to build an exercise habit that lasts without getting overwhelmed.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-09T11:30:00Z',
    category: { name: 'Fitness', slug: 'fitness' }
  },
  {
    id: 7,
    title: 'Stress Management Techniques That Actually Work',
    slug: 'stress-management-techniques',
    summary: 'Practical approaches to reduce stress and improve your mental wellbeing.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-08T09:45:00Z',
    category: { name: 'Mental Health', slug: 'mental-health' }
  },
  {
    id: 8,
    title: 'Healthy Eating on a Budget: Smart Shopping Guide',
    slug: 'healthy-eating-budget',
    summary: 'Tips for nutritious meals without breaking the bank.',
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-07T10:20:00Z',
    category: { name: 'Nutrition', slug: 'nutrition' }
  }
];

export default function handler(req, res) {
  res.status(200).json(healthTopics);
}
