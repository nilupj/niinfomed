
import { useState } from 'react';
import Layout from '../Layout';

export default function NutritionQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: "Which of these is the best source of protein?",
      options: ["White bread", "Eggs", "Apple", "Rice"],
      correctAnswer: 1
    },
    {
      question: "What is the recommended daily water intake for adults?",
      options: ["2-3 liters", "1 liter", "4-5 liters", "0.5 liters"],
      correctAnswer: 0
    },
    {
      question: "Which vitamin is produced when skin is exposed to sunlight?",
      options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
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
      <h1 className="text-2xl font-bold mb-6">Nutrition IQ Quiz</h1>
      
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
