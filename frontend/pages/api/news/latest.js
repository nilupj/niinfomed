export const runtime = "edge";
const latestNews = [
  {
    id: 101,
    title: 'New Study Links Mediterranean Diet to Longer Life',
    slug: 'mediterranean-diet-longevity-study',
    summary: 'Research shows significant health benefits from following a Mediterranean-style diet rich in vegetables, olive oil, and fish.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-15T12:00:00Z',
    author: { name: 'Dr. Michael Brown', credentials: 'MD, MPH' },
    category: { name: 'Nutrition', slug: 'nutrition' }
  },
  {
    id: 102,
    title: 'FDA Approves New Treatment for Chronic Migraines',
    slug: 'fda-migraine-treatment-approval',
    summary: 'A breakthrough medication offers hope for millions suffering from chronic migraines with fewer side effects.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-14T15:30:00Z',
    author: { name: 'Dr. Rachel Kim', credentials: 'MD, Neurology' },
    category: { name: 'Medical News', slug: 'medical-news' }
  },
  {
    id: 103,
    title: 'Walking Just 30 Minutes Daily Reduces Heart Disease Risk',
    slug: 'walking-heart-disease-prevention',
    summary: 'New research confirms that moderate daily exercise can significantly lower cardiovascular disease risk.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-13T09:00:00Z',
    author: { name: 'Dr. James Wilson', credentials: 'MD, FACC' },
    category: { name: 'Cardiology', slug: 'cardiology' }
  },
  {
    id: 104,
    title: 'Mental Health Apps Show Promise in Managing Anxiety',
    slug: 'mental-health-apps-anxiety-study',
    summary: 'A comprehensive study finds digital mental health tools can be effective supplements to traditional therapy.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-12T14:45:00Z',
    author: { name: 'Dr. Amanda Lee', credentials: 'Ph.D, Psychology' },
    category: { name: 'Mental Health', slug: 'mental-health' }
  },
  {
    id: 105,
    title: 'Sleep Quality More Important Than Duration, Study Finds',
    slug: 'sleep-quality-vs-duration-study',
    summary: 'Researchers discover that the quality of sleep matters more than the number of hours for overall health.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-11T11:20:00Z',
    author: { name: 'Dr. Sarah Thompson', credentials: 'MD, Sleep Medicine' },
    category: { name: 'Wellness', slug: 'wellness' }
  }
];

export default function handler(req, res) {
  const limit = parseInt(req.query.limit) || 10;
  res.status(200).json(latestNews.slice(0, limit));
}
