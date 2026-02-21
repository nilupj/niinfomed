
import { useState } from 'react';
import Layout from '../Layout';

export default function MentalHealthQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: "Mental health problems are uncommon",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "False - Mental health problems are actually very common. 1 in 4 people will experience a mental health problem in any given year."
    },
    {
      question: "People with mental health problems can't work",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "False - Many people with mental health problems have successful careers while managing their condition."
    },
    {
      question: "Mental health problems are always treatable",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "True - With proper support and treatment, many people recover from mental health problems."
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
      <h1 className="text-2xl font-bold mb-6">Mental Health Myths vs Facts</h1>
      
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
