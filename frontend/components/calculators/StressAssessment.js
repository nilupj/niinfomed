
import { useState } from 'react';

export default function StressAssessment() {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const questions = [
    { 
      id: 1, 
      text: "How often have you felt overwhelmed or unable to cope?",
      category: 'emotional'
    },
    { 
      id: 2, 
      text: "How often have you had difficulty sleeping or staying asleep?",
      category: 'physical'
    },
    { 
      id: 3, 
      text: "How often have you felt irritable, angry, or on edge?",
      category: 'emotional'
    },
    { 
      id: 4, 
      text: "How often have you had difficulty concentrating or making decisions?",
      category: 'cognitive'
    },
    { 
      id: 5, 
      text: "How often have you experienced physical tension (headaches, muscle pain)?",
      category: 'physical'
    },
    { 
      id: 6, 
      text: "How often have you felt nervous, anxious, or worried?",
      category: 'emotional'
    },
    { 
      id: 7, 
      text: "How often have you felt fatigued or lacking in energy?",
      category: 'physical'
    },
    { 
      id: 8, 
      text: "How often have you withdrawn from social activities or relationships?",
      category: 'behavioral'
    },
    { 
      id: 9, 
      text: "How often have you experienced changes in appetite (eating too much/little)?",
      category: 'physical'
    },
    { 
      id: 10, 
      text: "How often have you felt hopeless about the future?",
      category: 'emotional'
    }
  ];

  const calculateScore = (e) => {
    e.preventDefault();
    const total = Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0);
    const maxScore = questions.length * 4;
    const percentage = Math.round((total / maxScore) * 100);
    
    // Calculate category scores
    const categoryScores = {};
    questions.forEach(q => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { total: 0, count: 0 };
      }
      if (answers[q.id]) {
        categoryScores[q.category].total += parseInt(answers[q.id]);
        categoryScores[q.category].count += 1;
      }
    });

    const categoryAverages = {};
    Object.keys(categoryScores).forEach(cat => {
      categoryAverages[cat] = Math.round((categoryScores[cat].total / (categoryScores[cat].count * 4)) * 100);
    });

    let level, color, description, recommendations;
    if (percentage < 20) {
      level = 'Minimal Stress';
      color = 'text-green-600';
      description = 'You appear to be managing stress well. Your stress levels are within a healthy range.';
      recommendations = [
        'Continue your current stress management practices',
        'Maintain regular exercise and healthy sleep habits',
        'Practice preventive self-care to stay resilient',
        'Consider mindfulness or meditation to maintain balance'
      ];
    } else if (percentage < 40) {
      level = 'Mild Stress';
      color = 'text-blue-600';
      description = 'You are experiencing some stress, but it appears manageable with appropriate strategies.';
      recommendations = [
        'Identify specific stressors and work on addressing them',
        'Practice deep breathing exercises (5-10 minutes daily)',
        'Ensure 7-9 hours of quality sleep each night',
        'Engage in regular physical activity (30 min/day)',
        'Connect with supportive friends or family members'
      ];
    } else if (percentage < 60) {
      level = 'Moderate Stress';
      color = 'text-yellow-600';
      description = 'You are experiencing moderate stress levels that may be affecting your daily functioning.';
      recommendations = [
        'Consider speaking with a counselor or therapist',
        'Practice stress-reduction techniques (yoga, meditation)',
        'Set clear boundaries between work and personal time',
        'Break large tasks into smaller, manageable steps',
        'Limit caffeine and avoid alcohol as coping mechanisms',
        'Join a support group or stress management workshop'
      ];
    } else if (percentage < 80) {
      level = 'High Stress';
      color = 'text-orange-600';
      description = 'You are experiencing high stress levels that are likely impacting your health and wellbeing.';
      recommendations = [
        'Seek professional help from a mental health provider',
        'Consider taking a temporary break if possible',
        'Practice daily relaxation techniques (progressive muscle relaxation)',
        'Evaluate and modify major stressors in your life',
        'Ensure proper nutrition and avoid skipping meals',
        'Consider stress management counseling or therapy',
        'Explore workplace accommodations if work-related'
      ];
    } else {
      level = 'Severe Stress';
      color = 'text-red-600';
      description = 'You are experiencing severe stress that requires immediate attention. Please seek professional help.';
      recommendations = [
        '🚨 Consult a healthcare provider or mental health professional immediately',
        'Consider calling a mental health crisis line if feeling overwhelmed',
        'Inform trusted friends or family members about your situation',
        'Explore short-term therapy options (CBT, MBSR)',
        'Discuss medication options with a psychiatrist if appropriate',
        'Consider a medical leave or temporary work adjustment',
        'Emergency Resources: National Suicide Prevention Lifeline: 988'
      ];
    }

    setResults({
      score: percentage,
      level,
      color,
      description,
      recommendations,
      categoryAverages
    });
  };

  const getFrequencyLabel = (value) => {
    const labels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'];
    return labels[value] || '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-primary mb-2">Comprehensive Stress Assessment</h2>
      <p className="text-sm text-gray-600 mb-6">
        This assessment evaluates your stress levels across emotional, physical, cognitive, and behavioral domains. 
        Answer based on your experiences over the past 2 weeks.
      </p>
      
      <form onSubmit={calculateScore} className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {q.id}. {q.text}
              <span className="ml-2 text-xs text-gray-500 italic">({q.category})</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((value) => (
                <label key={value} className="flex flex-col items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={value}
                    checked={answers[q.id] === String(value)}
                    onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                    className="mb-2"
                    required
                  />
                  <span className="text-xs text-center text-gray-600">
                    {getFrequencyLabel(value)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors font-semibold"
        >
          Calculate Stress Level
        </button>
      </form>
      
      {results && (
        <div className="mt-6 space-y-4">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Your Stress Level</h3>
                <p className={`text-3xl font-bold ${results.color} mt-2`}>{results.level}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">{results.score}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className={`h-4 rounded-full ${
                  results.score < 20 ? 'bg-green-500' :
                  results.score < 40 ? 'bg-blue-500' :
                  results.score < 60 ? 'bg-yellow-500' :
                  results.score < 80 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${results.score}%` }}
              ></div>
            </div>
            <p className="text-gray-700 mt-4">{results.description}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Stress by Category</h4>
            <div className="space-y-3">
              {Object.entries(results.categoryAverages).map(([category, score]) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className="text-sm font-semibold">{score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        score < 40 ? 'bg-green-500' :
                        score < 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-3">📋 Personalized Recommendations</h4>
            <ul className="space-y-2">
              {results.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <span className="mr-2">{rec.includes('🚨') ? '🚨' : '•'}</span>
                  <span className={rec.includes('🚨') ? 'font-semibold text-red-700' : ''}>
                    {rec.replace('🚨', '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3">💡 Quick Stress Relief Techniques</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-white rounded">
                <p className="font-medium text-gray-800">4-7-8 Breathing</p>
                <p className="text-gray-600">Inhale (4s) → Hold (7s) → Exhale (8s)</p>
              </div>
              <div className="p-3 bg-white rounded">
                <p className="font-medium text-gray-800">Progressive Relaxation</p>
                <p className="text-gray-600">Tense & release muscle groups</p>
              </div>
              <div className="p-3 bg-white rounded">
                <p className="font-medium text-gray-800">Grounding (5-4-3-2-1)</p>
                <p className="text-gray-600">5 things you see, 4 hear, 3 touch, 2 smell, 1 taste</p>
              </div>
              <div className="p-3 bg-white rounded">
                <p className="font-medium text-gray-800">Mindful Walking</p>
                <p className="text-gray-600">10-minute walk focusing on surroundings</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            ⚠️ This assessment is for informational purposes only and does not replace professional mental health evaluation. 
            If you're experiencing severe stress or mental health concerns, please consult a healthcare provider.
          </p>
        </div>
      )}
    </div>
  );
}
