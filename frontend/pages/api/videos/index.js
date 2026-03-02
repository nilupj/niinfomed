export const runtime = "edge";
export default function handler(req, res) {
  const videos = [
    {
      id: 1,
      slug: 'yoga-for-beginners',
      title: 'Yoga for Beginners: 20 Minute Home Workout',
      summary: 'Start your yoga journey with this beginner-friendly routine designed for home practice.',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&h=500',
      duration: 1200,
      category: 'Yoga',
      views: 45000,
      published_date: '2026-01-20'
    },
    {
      id: 2,
      slug: 'healthy-heart-tips',
      title: 'Heart Health: 5 Daily Habits for a Healthy Heart',
      summary: 'Cardiologist shares essential daily habits to keep your heart strong and healthy.',
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&h=500',
      duration: 900,
      category: 'Cardiology',
      views: 32000,
      published_date: '2026-01-18'
    },
    {
      id: 3,
      slug: 'meditation-basics',
      title: 'Meditation for Stress Relief: 10 Minute Guide',
      summary: 'Learn simple meditation techniques to reduce stress and improve mental clarity.',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&h=500',
      duration: 600,
      category: 'Mental Health',
      views: 28000,
      published_date: '2026-01-15'
    },
    {
      id: 4,
      slug: 'nutrition-myths',
      title: 'Top 10 Nutrition Myths Debunked by Experts',
      summary: 'Nutritionists reveal the truth behind common diet and nutrition misconceptions.',
      thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&h=500',
      duration: 1500,
      category: 'Nutrition',
      views: 52000,
      published_date: '2026-01-12'
    },
    {
      id: 5,
      slug: 'better-sleep-habits',
      title: 'Sleep Better Tonight: Expert Sleep Tips',
      summary: 'Sleep specialist explains how to improve your sleep quality with simple changes.',
      thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&h=500',
      duration: 720,
      category: 'Wellness',
      views: 41000,
      published_date: '2026-01-10'
    },
    {
      id: 6,
      slug: 'home-workout-routine',
      title: 'Full Body Workout: No Equipment Needed',
      summary: 'Get fit at home with this effective 30-minute full body workout routine.',
      thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&h=500',
      duration: 1800,
      category: 'Fitness',
      views: 67000,
      published_date: '2026-01-08'
    }
  ];

  const limit = parseInt(req.query.limit) || 6;
  res.status(200).json(videos.slice(0, limit));
}
