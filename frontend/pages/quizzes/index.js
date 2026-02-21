import QuizCard from '../../components/QuizCard';

export default function QuizzesPage() {
  const quizzes = [
    {
      title: 'How Much Do You Know About Heart Health?',
      slug: 'heart-health-quiz',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&h=500',
      description: 'Test your knowledge about cardiovascular health and learn important facts about your heart.'
    },
    {
      title: 'Mental Health Myths vs Facts',
      slug: 'mental-health-quiz',
      image: 'https://images.unsplash.com/photo-1547561091-3d985041d42f?auto=format&fit=crop&w=800&h=500',
      description: 'Can you separate fact from fiction when it comes to mental health?'
    },
    {
      title: 'Nutrition IQ Quiz',
      slug: 'nutrition-quiz',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=500',
      description: 'Challenge yourself with this comprehensive quiz about nutrition and healthy eating habits.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Health Knowledge Quizzes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.slug} quiz={quiz} />
        ))}
      </div>
    </div>
  );
}
