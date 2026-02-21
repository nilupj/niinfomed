import { useState } from 'react';
import SEO from '../components/SEO';

export default function SymptomChecker() {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Comprehensive symptom database
  const symptomCategories = {
    'Head & Neck': [
      'Headache',
      'Dizziness',
      'Vision problems',
      'Hearing loss',
      'Sore throat',
      'Neck pain',
      'Earache',
      'Nosebleed',
      'Jaw pain'
    ],
    'Chest & Respiratory': [
      'Chest pain',
      'Shortness of breath',
      'Cough',
      'Wheezing',
      'Rapid heartbeat',
      'Chest tightness'
    ],
    'Digestive': [
      'Abdominal pain',
      'Nausea',
      'Vomiting',
      'Diarrhea',
      'Constipation',
      'Bloating',
      'Loss of appetite',
      'Blood in stool'
    ],
    'Skin': [
      'Rash',
      'Itching',
      'Skin discoloration',
      'Swelling',
      'Bruising',
      'Dry skin',
      'Hives'
    ],
    'Musculoskeletal': [
      'Joint pain',
      'Muscle pain',
      'Back pain',
      'Weakness',
      'Stiffness',
      'Limited mobility'
    ],
    'General': [
      'Fever',
      'Fatigue',
      'Weight loss',
      'Weight gain',
      'Night sweats',
      'Chills',
      'Insomnia'
    ],
    'Mental Health': [
      'Anxiety',
      'Depression',
      'Mood swings',
      'Difficulty concentrating',
      'Memory problems',
      'Irritability'
    ]
  };

  const riskFactors = [
    'Age over 60',
    'Age under 5',
    'Pregnancy',
    'Chronic illness (diabetes, heart disease, etc.)',
    'Weakened immune system',
    'Recent travel',
    'Smoking',
    'Alcohol consumption',
    'Family history of disease',
    'Recent injury or surgery',
    'Medication use',
    'Allergies'
  ];

  // Condition database with symptoms mapping
  const conditionDatabase = [
    {
      name: 'Common Cold',
      symptoms: ['Cough', 'Sore throat', 'Runny nose', 'Sneezing', 'Fatigue'],
      severity: 'Mild',
      urgency: 'Self-care',
      description: 'A viral infection of the upper respiratory tract',
      recommendations: [
        'Rest and stay hydrated',
        'Over-the-counter pain relievers',
        'Gargle with warm salt water',
        'Use a humidifier'
      ]
    },
    {
      name: 'Influenza (Flu)',
      symptoms: ['Fever', 'Cough', 'Fatigue', 'Muscle pain', 'Headache', 'Chills'],
      severity: 'Moderate',
      urgency: 'See doctor if severe',
      description: 'A viral infection that attacks the respiratory system',
      recommendations: [
        'Rest and drink plenty of fluids',
        'Antiviral medications if caught early',
        'Avoid contact with others',
        'Monitor for complications'
      ]
    },
    {
      name: 'Gastritis',
      symptoms: ['Abdominal pain', 'Nausea', 'Vomiting', 'Loss of appetite', 'Bloating'],
      severity: 'Moderate',
      urgency: 'Consult doctor',
      description: 'Inflammation of the stomach lining',
      recommendations: [
        'Avoid spicy and acidic foods',
        'Eat smaller, frequent meals',
        'Avoid alcohol and NSAIDs',
        'Consider antacids'
      ]
    },
    {
      name: 'Migraine',
      symptoms: ['Severe headache', 'Vision problems', 'Nausea', 'Light sensitivity'],
      severity: 'Moderate to Severe',
      urgency: 'Consult doctor if frequent',
      description: 'A neurological condition causing intense headaches',
      recommendations: [
        'Rest in a dark, quiet room',
        'Apply cold compress',
        'Take prescribed medications',
        'Identify and avoid triggers'
      ]
    },
    {
      name: 'Anxiety Disorder',
      symptoms: ['Anxiety', 'Rapid heartbeat', 'Shortness of breath', 'Difficulty concentrating', 'Insomnia'],
      severity: 'Variable',
      urgency: 'Seek professional help',
      description: 'Excessive worry and fear affecting daily life',
      recommendations: [
        'Practice relaxation techniques',
        'Regular exercise',
        'Cognitive behavioral therapy',
        'Consider medication if severe'
      ]
    },
    {
      name: 'Hypertension',
      symptoms: ['Headache', 'Dizziness', 'Chest pain', 'Shortness of breath'],
      severity: 'Serious',
      urgency: 'See doctor soon',
      description: 'High blood pressure that can lead to heart disease',
      recommendations: [
        'Monitor blood pressure regularly',
        'Reduce sodium intake',
        'Exercise regularly',
        'Take prescribed medications'
      ]
    },
    {
      name: 'Allergic Reaction',
      symptoms: ['Rash', 'Itching', 'Swelling', 'Shortness of breath', 'Hives'],
      severity: 'Variable (can be severe)',
      urgency: 'Seek emergency care if severe',
      description: 'Immune system reaction to allergens',
      recommendations: [
        'Avoid known allergens',
        'Take antihistamines',
        'Use epinephrine for severe reactions',
        'Identify triggers'
      ]
    },
    {
      name: 'Arthritis',
      symptoms: ['Joint pain', 'Stiffness', 'Swelling', 'Limited mobility'],
      severity: 'Chronic',
      urgency: 'Consult doctor',
      description: 'Inflammation of one or more joints',
      recommendations: [
        'Stay active with low-impact exercises',
        'Maintain healthy weight',
        'Use hot/cold therapy',
        'Consider physical therapy'
      ]
    }
  ];

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleFactorToggle = (factor) => {
    setSelectedFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const analyzeSymptoms = () => {
    const matches = conditionDatabase
      .map(condition => {
        const symptomMatches = selectedSymptoms.filter(symptom =>
          condition.symptoms.some(cs => cs.toLowerCase().includes(symptom.toLowerCase()))
        );

        const matchPercentage = (symptomMatches.length / selectedSymptoms.length) * 100;

        return {
          ...condition,
          matchCount: symptomMatches.length,
          matchPercentage,
          matchedSymptoms: symptomMatches
        };
      })
      .filter(condition => condition.matchCount > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    setResults(matches);
    setStep(4);
  };

  const filteredSymptoms = Object.entries(symptomCategories).reduce((acc, [category, symptoms]) => {
    const filtered = symptoms.filter(symptom =>
      symptom.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) acc[category] = filtered;
    return acc;
  }, {});

  return (
    <>
      <SEO
        title="Symptom Checker - Identify Possible Health Conditions"
        description="Use our interactive symptom checker to identify possible health conditions based on your symptoms. Get personalized health recommendations."
      />

      <div className="container-custom py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Symptom Checker</h1>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Important:</strong> This tool is for informational purposes only and does not provide medical advice.
                  Always consult a healthcare professional for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {num}
                </div>
                <div className={`flex-1 h-1 mx-2 ${num < 4 ? (step > num ? 'bg-primary' : 'bg-gray-200') : 'hidden'}`}></div>
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-sm text-gray-600 mb-8">
            <span className={step >= 1 ? 'font-semibold text-primary' : ''}>Choose Symptoms</span>
            <span className={step >= 2 ? 'font-semibold text-primary' : ''}>Risk Factors</span>
            <span className={step >= 3 ? 'font-semibold text-primary' : ''}>Review</span>
            <span className={step >= 4 ? 'font-semibold text-primary' : ''}>Results</span>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Select Your Symptoms</h2>
            <p className="text-gray-600 mb-6">Choose all symptoms you are experiencing</p>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search symptoms..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Selected Symptoms ({selectedSymptoms.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map(symptom => (
                    <span key={symptom} className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {symptom}
                      <button onClick={() => handleSymptomToggle(symptom)} className="hover:bg-red-600 rounded-full px-2">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {Object.entries(filteredSymptoms).map(([category, symptoms]) => (
                <div key={category} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4 text-primary">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {symptoms.map(symptom => (
                      <button
                        key={symptom}
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedSymptoms.includes(symptom)
                            ? 'border-primary bg-blue-50 font-semibold'
                            : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={selectedSymptoms.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Risk Factors →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Risk Factors (Optional)</h2>
            <p className="text-gray-600 mb-6">Select any factors that may be relevant to your health</p>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskFactors.map(factor => (
                  <button
                    key={factor}
                    onClick={() => handleFactorToggle(factor)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedFactors.includes(factor)
                        ? 'border-primary bg-blue-50 font-semibold'
                        : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                    }`}
                  >
                    {factor}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Review Selection →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Review Your Information</h2>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Symptoms ({selectedSymptoms.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map(symptom => (
                  <span key={symptom} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {selectedFactors.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-3">Risk Factors ({selectedFactors.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFactors.map(factor => (
                    <span key={factor} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={analyzeSymptoms} className="btn-primary">
                View Possible Conditions →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Possible Conditions</h2>
            <p className="text-gray-600 mb-6">
              Based on your symptoms, here are possible conditions. This is not a diagnosis - please consult a healthcare professional.
            </p>

            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((condition, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-2">{condition.name}</h3>
                        <div className="flex gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            condition.severity === 'Mild' ? 'bg-green-100 text-green-800' :
                            condition.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {condition.severity}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            {condition.urgency}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{Math.round(condition.matchPercentage)}%</div>
                        <div className="text-sm text-gray-500">Match</div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{condition.description}</p>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Matched Symptoms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {condition.matchedSymptoms.map(symptom => (
                          <span key={symptom} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            ✓ {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {condition.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-600">
                  No matching conditions found. Please consult a healthcare professional for proper evaluation.
                </p>
              </div>
            )}

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">When to Seek Emergency Care</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Severe chest pain or pressure</li>
                      <li>Difficulty breathing or shortness of breath</li>
                      <li>Sudden severe headache</li>
                      <li>Confusion or difficulty speaking</li>
                      <li>Uncontrolled bleeding</li>
                      <li>Signs of stroke or heart attack</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedSymptoms([]);
                  setSelectedFactors([]);
                  setResults([]);
                }}
                className="btn-secondary"
              >
                Start Over
              </button>
              <button onClick={() => window.print()} className="btn-primary">
                Print Results
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
