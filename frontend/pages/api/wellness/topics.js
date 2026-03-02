export const runtime = "edge";
const wellnessTopics = [
  {
    id: 201,
    title: 'Mindfulness Meditation for Beginners',
    slug: 'mindfulness-meditation-beginners',
    summary: 'Learn the basics of mindfulness meditation and how to start a daily practice.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-10T08:00:00Z',
    category: { name: 'Wellness', slug: 'wellness' }
  },
  {
    id: 202,
    title: 'The Science of Hydration: How Much Water Do You Really Need?',
    slug: 'hydration-science-water-needs',
    summary: 'Understanding your body hydration needs and debunking common myths about water intake.',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-09T10:30:00Z',
    category: { name: 'Nutrition', slug: 'nutrition' }
  },
  {
    id: 203,
    title: 'Building Healthy Sleep Habits: A Complete Guide',
    slug: 'healthy-sleep-habits-guide',
    summary: 'Comprehensive strategies for improving your sleep quality and establishing a consistent routine.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-08T14:00:00Z',
    category: { name: 'Wellness', slug: 'wellness' }
  },
  {
    id: 204,
    title: 'Yoga for Stress Relief: Simple Poses for Busy People',
    slug: 'yoga-stress-relief-simple-poses',
    summary: 'Quick and effective yoga poses you can do anywhere to reduce stress and tension.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-07T09:15:00Z',
    category: { name: 'Fitness', slug: 'fitness' }
  }
];

export default function handler(req, res) {
  res.status(200).json(wellnessTopics);
}
