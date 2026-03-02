
import { useState } from 'react';
import Layout from '../../components/Layout';
import BMICalculator from '../../components/calculators/BMICalculator';
import CalorieCalculator from '../../components/calculators/CalorieCalculator';
import WaterIntakeCalculator from '../../components/calculators/WaterIntakeCalculator';
import StressAssessment from '../../components/calculators/StressAssessment';
import SleepCalculator from '../../components/calculators/SleepCalculator';
export default function Tools() {
  const [activeTool, setActiveTool] = useState('bmi');

  const tools = {
    bmi: { 
      name: 'BMI Calculator', 
      component: BMICalculator,
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="45" fill="#E3F2FD" opacity="0.5"/>
          <rect x="35" y="25" width="30" height="50" rx="15" fill="#64B5F6"/>
          <circle cx="50" cy="20" r="8" fill="#42A5F5"/>
          <text x="50" y="52" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">BMI</text>
        </svg>
      )
    },
    calories: { 
      name: 'Calorie Calculator', 
      component: CalorieCalculator,
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="45" fill="#FFF3E0" opacity="0.5"/>
          <path d="M50 20 L55 35 L70 35 L58 45 L63 60 L50 50 L37 60 L42 45 L30 35 L45 35 Z" fill="#FF9800"/>
          <circle cx="50" cy="45" r="3" fill="#F57C00"/>
        </svg>
      )
    },
    water: { 
      name: 'Water Intake Calculator', 
      component: WaterIntakeCalculator,
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="45" fill="#E0F7FA" opacity="0.5"/>
          <path d="M50 20 Q35 40 35 55 Q35 70 50 70 Q65 70 65 55 Q65 40 50 20" fill="#00BCD4"/>
          <ellipse cx="50" cy="55" rx="10" ry="8" fill="#80DEEA" opacity="0.6"/>
        </svg>
      )
    },
    stress: { 
      name: 'Stress Assessment', 
      component: StressAssessment,
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="45" fill="#F3E5F5" opacity="0.5"/>
          <circle cx="50" cy="45" r="20" fill="#9C27B0"/>
          <circle cx="42" cy="40" r="3" fill="#7B1FA2"/>
          <circle cx="58" cy="40" r="3" fill="#7B1FA2"/>
          <path d="M40 50 Q50 45 60 50" stroke="#7B1FA2" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    sleep: { 
      name: 'Sleep Calculator', 
      component: SleepCalculator,
      icon: (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="45" fill="#E8EAF6" opacity="0.5"/>
          <path d="M50 25 Q35 35 40 50 Q45 65 60 60 Q75 55 70 40 Q65 25 50 25" fill="#5C6BC0"/>
          <circle cx="55" cy="42" r="3" fill="#3F51B5"/>
          <path d="M65 30 L70 28 M70 40 L75 38 M65 50 L70 48" stroke="#9FA8DA" strokeWidth="2"/>
        </svg>
      )
    }
  };

  const ActiveComponent = tools[activeTool].component;

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Health Tools & Calculators</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use our interactive health tools to track your wellness journey and make informed decisions
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {Object.entries(tools).map(([key, tool]) => (
            <button
              key={key}
              onClick={() => setActiveTool(key)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                activeTool === key
                  ? 'bg-primary text-white shadow-xl scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              <div className={`mb-2 ${activeTool === key ? 'opacity-90' : ''}`}>
                {tool.icon}
              </div>
              <span className="text-sm font-semibold text-center">{tool.name}</span>
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <ActiveComponent />
        </div>
      </div>
    </Layout>
  );
}
