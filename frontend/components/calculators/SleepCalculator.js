
import { useState } from 'react';

export default function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('');
  const [age, setAge] = useState('');
  const [cycles, setCycles] = useState([]);

  const calculateSleepCycles = (e) => {
    e.preventDefault();
    const wake = new Date(`2000/01/01 ${wakeTime}`);
    const recommendedSleep = getRecommendedSleep(age);
    
    let sleepCycles = [];
    for (let i = 1; i <= 6; i++) {
      const bedtime = new Date(wake.getTime() - (i * 90 + 15) * 60000);
      sleepCycles.push(bedtime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    }
    
    setCycles(sleepCycles);
  };

  const getRecommendedSleep = (age) => {
    if (age <= 12) return "9-12 hours";
    if (age <= 18) return "8-10 hours";
    if (age <= 64) return "7-9 hours";
    return "7-8 hours";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-primary mb-4">Sleep Calculator</h2>
      <form onSubmit={calculateSleepCycles} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Wake Up Time</label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          Calculate Bedtime
        </button>
      </form>
      {cycles.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm mb-2">Recommended sleep for age {age}: {getRecommendedSleep(age)}</p>
          <p className="font-medium mb-2">Suggested bedtimes for optimal sleep cycles:</p>
          <div className="grid grid-cols-2 gap-2">
            {cycles.map((time, index) => (
              <div key={index} className="bg-white p-2 rounded border text-center">
                {time}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
