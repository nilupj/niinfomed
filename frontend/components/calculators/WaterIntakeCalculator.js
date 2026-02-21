
import { useState } from 'react';

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('light');
  const [climate, setClimate] = useState('moderate');
  const [waterIntake, setWaterIntake] = useState(null);

  const calculateWaterIntake = (e) => {
    e.preventDefault();
    let baseIntake = weight * 0.033; // Base: 33ml per kg
    
    const activityFactors = {
      sedentary: 1,
      light: 1.1,
      moderate: 1.2,
      intense: 1.4
    };
    
    const climateFactors = {
      cold: 0.9,
      moderate: 1,
      hot: 1.1
    };

    const total = baseIntake * activityFactors[activity] * climateFactors[climate];
    setWaterIntake(Math.round(total * 10) / 10);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-primary mb-4">Water Intake Calculator</h2>
      <form onSubmit={calculateWaterIntake} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Level</label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light Activity</option>
            <option value="moderate">Moderate Activity</option>
            <option value="intense">Intense Activity</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Climate</label>
          <select
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="cold">Cold</option>
            <option value="moderate">Moderate</option>
            <option value="hot">Hot</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          Calculate Water Intake
        </button>
      </form>
      {waterIntake && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-lg">Daily Water Intake: <span className="font-bold">{waterIntake} liters</span></p>
        </div>
      )}
    </div>
  );
}
