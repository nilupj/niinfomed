const articles = {
  'covid-19-updates': {
    id: 1,
    title: 'COVID-19 Updates: What You Need to Know',
    slug: 'covid-19-updates',
    summary: 'Latest information on COVID-19 variants, vaccines, and prevention measures.',
    content: `
      <h2>Understanding COVID-19 in 2025</h2>
      <p>As we navigate through 2025, COVID-19 continues to evolve. Here's what you need to know about the current state of the pandemic, new variants, and updated prevention strategies.</p>
      
      <h3>Current Variants</h3>
      <p>Health authorities continue to monitor new variants as they emerge. The good news is that current vaccines remain effective at preventing severe illness, hospitalization, and death.</p>
      
      <h3>Prevention Measures</h3>
      <p>Basic prevention measures remain effective:</p>
      <ul>
        <li>Stay up to date with vaccinations and boosters</li>
        <li>Practice good hand hygiene</li>
        <li>Consider wearing masks in crowded indoor spaces</li>
        <li>Stay home when you're sick</li>
        <li>Ensure good ventilation in indoor spaces</li>
      </ul>
      
      <h3>Testing and Treatment</h3>
      <p>If you develop symptoms, testing is still recommended. Antiviral treatments are available and most effective when started early in the course of illness.</p>
      
      <h3>Looking Ahead</h3>
      <p>Researchers continue to study COVID-19 and develop improved vaccines and treatments. Staying informed through reliable sources is key to protecting yourself and your community.</p>
    `,
    image: 'https://images.unsplash.com/photo-1584118624012-df056829fbd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
    published_date: '2025-03-15T08:00:00Z',
    author: { name: 'Dr. Sarah Johnson', credentials: 'MD, MPH' },
    category: { name: 'Infectious Disease', slug: 'infectious-disease' },
    reading_time: 5
  },
  'understanding-heart-health': {
    id: 2,
    title: 'Understanding Heart Health: Risk Factors and Prevention',
    slug: 'understanding-heart-health',
    summary: 'Learn about the key risk factors for heart disease and effective prevention strategies.',
    content: `
      <h2>Heart Health Fundamentals</h2>
      <p>Heart disease remains one of the leading causes of death worldwide, but many risk factors are modifiable through lifestyle changes. Understanding these factors is the first step toward prevention.</p>
      
      <h3>Major Risk Factors</h3>
      <ul>
        <li><strong>High Blood Pressure:</strong> Often called the "silent killer" because it usually has no symptoms</li>
        <li><strong>High Cholesterol:</strong> Excess LDL cholesterol can build up in artery walls</li>
        <li><strong>Smoking:</strong> Damages blood vessels and significantly increases heart disease risk</li>
        <li><strong>Diabetes:</strong> High blood sugar can damage blood vessels over time</li>
        <li><strong>Obesity:</strong> Increases strain on the heart and associated conditions</li>
      </ul>
      
      <h3>Prevention Strategies</h3>
      <p>The good news is that heart disease is largely preventable through healthy lifestyle choices:</p>
      <ul>
        <li>Eat a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins</li>
        <li>Exercise regularly - aim for at least 150 minutes of moderate activity per week</li>
        <li>Maintain a healthy weight</li>
        <li>Don't smoke, and avoid secondhand smoke</li>
        <li>Manage stress through healthy coping mechanisms</li>
        <li>Get regular health screenings</li>
      </ul>
      
      <h3>When to See a Doctor</h3>
      <p>Regular check-ups are important for monitoring heart health. See your doctor immediately if you experience chest pain, shortness of breath, or unusual fatigue.</p>
    `,
    image: 'https://images.unsplash.com/photo-1559757175-7b21671c7e96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-14T10:30:00Z',
    author: { name: 'Dr. Robert Chen', credentials: 'MD, FACC' },
    category: { name: 'Cardiology', slug: 'cardiology' },
    reading_time: 7
  },
  'mental-health-awareness': {
    id: 3,
    title: 'Mental Health Awareness: Breaking the Stigma',
    slug: 'mental-health-awareness',
    summary: "Why it's important to discuss mental health openly and seek help when needed.",
    content: `
      <h2>The Importance of Mental Health Awareness</h2>
      <p>Mental health is just as important as physical health, yet stigma often prevents people from seeking the help they need. Breaking down these barriers starts with open conversations and education.</p>
      
      <h3>Common Mental Health Conditions</h3>
      <ul>
        <li><strong>Depression:</strong> More than just feeling sad - a serious condition that affects daily functioning</li>
        <li><strong>Anxiety Disorders:</strong> Excessive worry that interferes with normal activities</li>
        <li><strong>PTSD:</strong> A condition that can develop after experiencing traumatic events</li>
        <li><strong>Bipolar Disorder:</strong> Extreme mood swings that affect energy and activity levels</li>
      </ul>
      
      <h3>Signs You or Someone You Know May Need Help</h3>
      <ul>
        <li>Persistent feelings of sadness or hopelessness</li>
        <li>Withdrawal from friends, family, and activities</li>
        <li>Changes in eating or sleeping patterns</li>
        <li>Difficulty concentrating or making decisions</li>
        <li>Thoughts of self-harm or suicide</li>
      </ul>
      
      <h3>Getting Help</h3>
      <p>If you or someone you know is struggling, help is available. Reach out to a mental health professional, your primary care doctor, or a crisis hotline. Remember, seeking help is a sign of strength, not weakness.</p>
    `,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-13T09:45:00Z',
    author: { name: 'Dr. Emily Watson', credentials: 'Ph.D, Clinical Psychology' },
    category: { name: 'Mental Health', slug: 'mental-health' },
    reading_time: 6
  },
  'nutrition-myths': {
    id: 4,
    title: 'Nutrition Myths: Separating Fact from Fiction',
    slug: 'nutrition-myths',
    summary: 'Debunking common misconceptions about diet and nutrition for better health.',
    content: `
      <h2>Busting Common Nutrition Myths</h2>
      <p>In the age of information, nutrition myths spread quickly. Let's examine some of the most common misconceptions and what science actually tells us.</p>
      
      <h3>Myth 1: Carbs Are Bad for You</h3>
      <p><strong>Fact:</strong> Carbohydrates are an essential macronutrient. The key is choosing complex carbs like whole grains, fruits, and vegetables over refined carbs and added sugars.</p>
      
      <h3>Myth 2: Fat Makes You Fat</h3>
      <p><strong>Fact:</strong> Healthy fats are important for nutrient absorption, brain health, and hormone production. Focus on unsaturated fats from sources like olive oil, nuts, and fish.</p>
      
      <h3>Myth 3: You Need to Detox Your Body</h3>
      <p><strong>Fact:</strong> Your liver and kidneys already do an excellent job of removing toxins. Most "detox" products have no scientific backing.</p>
      
      <h3>Myth 4: Eating Late at Night Causes Weight Gain</h3>
      <p><strong>Fact:</strong> Total calorie intake matters more than timing. However, late-night snacking can contribute to overeating if you're eating out of boredom rather than hunger.</p>
      
      <h3>The Bottom Line</h3>
      <p>Focus on a balanced diet with plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Be skeptical of quick fixes and extreme diets.</p>
    `,
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-12T14:20:00Z',
    author: { name: 'Lisa Martinez', credentials: 'RD, LDN' },
    category: { name: 'Nutrition', slug: 'nutrition' },
    reading_time: 5
  },
  'sleep-hygiene-tips': {
    id: 5,
    title: 'Sleep Hygiene: Tips for Better Rest',
    slug: 'sleep-hygiene-tips',
    summary: 'Simple changes to improve your sleep quality and overall health.',
    content: `
      <h2>The Science of Better Sleep</h2>
      <p>Quality sleep is essential for physical health, mental well-being, and cognitive function. Here are evidence-based strategies to improve your sleep.</p>
      
      <h3>Create the Right Environment</h3>
      <ul>
        <li>Keep your bedroom cool (65-68°F is ideal)</li>
        <li>Make it dark - use blackout curtains or a sleep mask</li>
        <li>Reduce noise or use white noise</li>
        <li>Reserve the bed for sleep and intimacy only</li>
      </ul>
      
      <h3>Establish a Routine</h3>
      <ul>
        <li>Go to bed and wake up at the same time every day</li>
        <li>Create a relaxing pre-sleep routine</li>
        <li>Avoid screens for 1-2 hours before bed</li>
        <li>Limit caffeine after noon</li>
      </ul>
      
      <h3>Lifestyle Factors</h3>
      <ul>
        <li>Exercise regularly, but not too close to bedtime</li>
        <li>Avoid large meals and alcohol before bed</li>
        <li>Get exposure to natural light during the day</li>
        <li>Manage stress through relaxation techniques</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-10T16:15:00Z',
    author: { name: 'Dr. Sarah Thompson', credentials: 'MD, Sleep Medicine' },
    category: { name: 'Wellness', slug: 'wellness' },
    reading_time: 4
  },
  'exercise-for-beginners': {
    id: 6,
    title: 'Exercise for Beginners: Starting a Sustainable Routine',
    slug: 'exercise-for-beginners',
    summary: 'How to build an exercise habit that lasts without getting overwhelmed.',
    content: `
      <h2>Starting Your Fitness Journey</h2>
      <p>Beginning an exercise routine can feel overwhelming, but with the right approach, you can build a sustainable habit that improves your health for years to come.</p>
      
      <h3>Start Small</h3>
      <p>The biggest mistake beginners make is doing too much too soon. Start with just 10-15 minutes of activity a day and gradually increase.</p>
      
      <h3>Choose Activities You Enjoy</h3>
      <ul>
        <li>Walking - the simplest and most accessible exercise</li>
        <li>Swimming - low impact and works the whole body</li>
        <li>Dancing - fun way to get cardio exercise</li>
        <li>Cycling - can be done indoors or outdoors</li>
        <li>Yoga - builds strength, flexibility, and mindfulness</li>
      </ul>
      
      <h3>Set Realistic Goals</h3>
      <p>Rather than vague goals like "get in shape," set specific, measurable targets like "walk for 20 minutes, 3 times a week."</p>
      
      <h3>Building the Habit</h3>
      <ul>
        <li>Schedule your workouts like appointments</li>
        <li>Find an accountability partner</li>
        <li>Track your progress</li>
        <li>Celebrate small wins</li>
        <li>Be patient with yourself</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-09T11:30:00Z',
    author: { name: 'Mike Johnson', credentials: 'CPT, CSCS' },
    category: { name: 'Fitness', slug: 'fitness' },
    reading_time: 5
  },
  'stress-management-techniques': {
    id: 7,
    title: 'Stress Management Techniques That Actually Work',
    slug: 'stress-management-techniques',
    summary: 'Practical approaches to reduce stress and improve your mental wellbeing.',
    content: `
      <h2>Understanding and Managing Stress</h2>
      <p>Chronic stress can have serious effects on your physical and mental health. Learning effective stress management techniques is essential for overall well-being.</p>
      
      <h3>Immediate Stress Relief</h3>
      <ul>
        <li><strong>Deep Breathing:</strong> Take slow, deep breaths to activate your body's relaxation response</li>
        <li><strong>Progressive Muscle Relaxation:</strong> Systematically tense and relax muscle groups</li>
        <li><strong>Grounding Techniques:</strong> Use your senses to bring yourself back to the present moment</li>
      </ul>
      
      <h3>Long-term Strategies</h3>
      <ul>
        <li>Regular exercise</li>
        <li>Adequate sleep</li>
        <li>Healthy social connections</li>
        <li>Mindfulness meditation</li>
        <li>Time management skills</li>
        <li>Setting boundaries</li>
      </ul>
      
      <h3>When to Seek Help</h3>
      <p>If stress is significantly impacting your daily life, relationships, or health, consider talking to a mental health professional. They can provide personalized strategies and support.</p>
    `,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-08T09:45:00Z',
    author: { name: 'Dr. Emily Watson', credentials: 'Ph.D, Clinical Psychology' },
    category: { name: 'Mental Health', slug: 'mental-health' },
    reading_time: 5
  },
  'healthy-eating-budget': {
    id: 8,
    title: 'Healthy Eating on a Budget: Smart Shopping Guide',
    slug: 'healthy-eating-budget',
    summary: 'Tips for nutritious meals without breaking the bank.',
    content: `
      <h2>Eating Well Without Overspending</h2>
      <p>Contrary to popular belief, eating healthy doesn't have to be expensive. With some planning and smart strategies, you can nourish your body while staying within budget.</p>
      
      <h3>Planning and Preparation</h3>
      <ul>
        <li>Plan your meals for the week before shopping</li>
        <li>Make a shopping list and stick to it</li>
        <li>Check what you already have at home</li>
        <li>Look for sales and use coupons</li>
      </ul>
      
      <h3>Budget-Friendly Nutritious Foods</h3>
      <ul>
        <li><strong>Beans and Lentils:</strong> Excellent source of protein and fiber</li>
        <li><strong>Eggs:</strong> Versatile and nutrient-dense</li>
        <li><strong>Frozen Vegetables:</strong> Often cheaper and just as nutritious as fresh</li>
        <li><strong>Whole Grains:</strong> Brown rice, oats, and whole wheat pasta</li>
        <li><strong>Seasonal Produce:</strong> Buy what's in season for best prices</li>
      </ul>
      
      <h3>Smart Shopping Tips</h3>
      <ul>
        <li>Buy in bulk when it makes sense</li>
        <li>Compare unit prices, not just total prices</li>
        <li>Shop the perimeter of the store first</li>
        <li>Don't shop hungry</li>
        <li>Consider store brands</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-07T10:20:00Z',
    author: { name: 'Lisa Martinez', credentials: 'RD, LDN' },
    category: { name: 'Nutrition', slug: 'nutrition' },
    reading_time: 6
  }
};
export const runtime = "edge";
export default function handler(req, res) {
  const { slug } = req.query;
  const article = articles[slug];
  
  if (article) {
    res.status(200).json(article);
  } else {
    res.status(404).json({ error: 'Article not found' });
  }
}
