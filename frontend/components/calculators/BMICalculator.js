
import { useState } from 'react';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [results, setResults] = useState(null);

  const calculateBMI = (e) => {
    e.preventDefault();
    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    // Calculate ideal weight range
    const idealWeightMin = (18.5 * heightInMeters * heightInMeters).toFixed(1);
    const idealWeightMax = (24.9 * heightInMeters * heightInMeters).toFixed(1);
    
    // Calculate BMR (Basal Metabolic Rate)
    let bmr;
    if (gender === 'male') {
      bmr = Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
    } else {
      bmr = Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
    }
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    const tdee = Math.round(bmr * activityFactors[activityLevel]);
    
    // Calculate body fat percentage (rough estimate)
    let bodyFat;
    if (gender === 'male') {
      bodyFat = (1.20 * parseFloat(bmiValue) + 0.23 * parseInt(age) - 16.2).toFixed(1);
    } else {
      bodyFat = (1.20 * parseFloat(bmiValue) + 0.23 * parseInt(age) - 5.4).toFixed(1);
    }
    
    // Determine category and health risk
    let category, risk, color, advice;
    if (bmiValue < 16) {
      category = 'Severe Underweight';
      risk = 'High Risk';
      color = 'text-red-600';
      advice = 'Consult a healthcare provider immediately. Severe underweight can lead to malnutrition and weakened immune system.';
    } else if (bmiValue < 18.5) {
      category = 'Underweight';
      risk = 'Moderate Risk';
      color = 'text-orange-600';
      advice = 'Consider gaining weight through a balanced diet rich in nutrients. Consult a nutritionist for personalized advice.';
    } else if (bmiValue < 25) {
      category = 'Normal Weight';
      risk = 'Low Risk';
      color = 'text-green-600';
      advice = 'Maintain your healthy weight through balanced nutrition and regular exercise.';
    } else if (bmiValue < 30) {
      category = 'Overweight';
      risk = 'Moderate Risk';
      color = 'text-orange-600';
      advice = 'Consider a balanced diet and increase physical activity. Small lifestyle changes can make a big difference.';
    } else if (bmiValue < 35) {
      category = 'Obese Class I';
      risk = 'High Risk';
      color = 'text-red-600';
      advice = 'Consult a healthcare provider for weight management strategies. Combined diet and exercise programs are recommended.';
    } else if (bmiValue < 40) {
      category = 'Obese Class II';
      risk = 'Very High Risk';
      color = 'text-red-700';
      advice = 'Seek medical advice. You may be at risk for serious health conditions like diabetes, heart disease, and hypertension.';
    } else {
      category = 'Obese Class III';
      risk = 'Extremely High Risk';
      color = 'text-red-800';
      advice = 'Immediate medical consultation recommended. Comprehensive weight management program needed.';
    }
    
    setResults({
      bmi: bmiValue,
      category,
      risk,
      color,
      advice,
      idealWeightMin,
      idealWeightMax,
      bmr,
      tdee,
      bodyFat,
      weightToLose: weight > idealWeightMax ? (weight - idealWeightMax).toFixed(1) : 0,
      weightToGain: weight < idealWeightMin ? (idealWeightMin - weight).toFixed(1) : 0
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-primary mb-4">Advanced BMI & Body Composition Calculator</h2>
      <form onSubmit={calculateBMI} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Height (cm) *</label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age (years) *</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Activity Level *</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Lightly Active (1-3 days/week)</option>
              <option value="moderate">Moderately Active (3-5 days/week)</option>
              <option value="active">Very Active (6-7 days/week)</option>
              <option value="veryActive">Extremely Active (physical job + exercise)</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors font-semibold"
        >
          Calculate Complete Analysis
        </button>
      </form>
      
      {results && (
        <div className="mt-6 space-y-4">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Your BMI</h3>
                <p className="text-4xl font-bold text-primary mt-2">{results.bmi}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${results.color}`}>{results.category}</p>
                <p className="text-sm text-gray-600">{results.risk}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full ${results.bmi < 18.5 ? 'bg-orange-500' : results.bmi < 25 ? 'bg-green-500' : results.bmi < 30 ? 'bg-orange-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min((results.bmi / 40) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>16</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Ideal Weight Range</h4>
              <p className="text-2xl font-bold text-green-600">{results.idealWeightMin} - {results.idealWeightMax} kg</p>
              {results.weightToLose > 0 && (
                <p className="text-sm text-gray-600 mt-2">Weight to lose: {results.weightToLose} kg</p>
              )}
              {results.weightToGain > 0 && (
                <p className="text-sm text-gray-600 mt-2">Weight to gain: {results.weightToGain} kg</p>
              )}
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Estimated Body Fat</h4>
              <p className="text-2xl font-bold text-purple-600">{results.bodyFat}%</p>
              <p className="text-sm text-gray-600 mt-2">
                {gender === 'male' 
                  ? 'Healthy range: 10-20%' 
                  : 'Healthy range: 18-28%'}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Basal Metabolic Rate</h4>
              <p className="text-2xl font-bold text-blue-600">{results.bmr} cal/day</p>
              <p className="text-sm text-gray-600 mt-2">Calories burned at rest</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Daily Calorie Needs</h4>
              <p className="text-2xl font-bold text-orange-600">{results.tdee} cal/day</p>
              <p className="text-sm text-gray-600 mt-2">To maintain current weight</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Personalized Advice</h4>
            <p className="text-gray-700">{results.advice}</p>
            
            <div className="mt-4 space-y-2">
              <h5 className="font-semibold text-gray-800">Recommendations:</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {results.bmi < 18.5 ? (
                  <>
                    <li>Increase calorie intake with nutrient-dense foods</li>
                    <li>Include protein-rich foods in every meal</li>
                    <li>Consider strength training to build muscle mass</li>
                  </>
                ) : results.bmi < 25 ? (
                  <>
                    <li>Maintain balanced diet with variety of nutrients</li>
                    <li>Continue regular physical activity (150 min/week)</li>
                    <li>Monitor weight monthly to catch any changes early</li>
                  </>
                ) : (
                  <>
                    <li>Create a calorie deficit of 500-750 cal/day for gradual weight loss</li>
                    <li>Combine cardio and strength training exercises</li>
                    <li>Focus on whole foods, limit processed foods</li>
                    <li>Stay hydrated and get adequate sleep (7-9 hours)</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            ⚠️ This calculator provides estimates based on standard formulas. For personalized medical advice, please consult a healthcare professional.
          </p>
        </div>
      )}
    </div>
  );
}
