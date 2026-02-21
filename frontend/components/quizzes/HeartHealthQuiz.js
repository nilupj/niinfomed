
import { useState } from 'react';
import Layout from '../Layout';

export default function HeartHealthQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: "What is a normal resting heart rate for adults?",
      options: ["40-50 beats per minute", "60-100 beats per minute", "100-120 beats per minute", "120-140 beats per minute"],
      correctAnswer: 1
    },
    {
      question: "Which of these is a warning sign of heart attack?",
      options: ["Chest pain or discomfort", "Headache", "Stomach cramps", "Knee pain"],
      correctAnswer: 0
    },
    {
      question: "What is considered a healthy blood pressure reading?",
      options: ["160/100", "140/90", "120/80", "100/60"],
      correctAnswer: 2
    }
  ];

  const handleAnswer = (selectedOption) => {
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Heart Health Quiz</h1>
      
      {!showResults ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl mb-4">Question {currentQuestion + 1} of {questions.length}</h2>
          <p className="mb-4">{questions[currentQuestion].question}</p>
          <div className="space-y-2">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-3 rounded border hover:bg-primary hover:text-white transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl mb-4">Quiz Complete!</h2>
          <p className="text-2xl font-bold mb-4">Your Score: {score}/{questions.length}</p>
          <button
            onClick={() => {
              setCurrentQuestion(0);
              setScore(0);
              setShowResults(false);
            }}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
