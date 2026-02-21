const conditions = {
  'diabetes': {
    id: 1,
    name: 'Diabetes',
    slug: 'diabetes',
    subtitle: 'A metabolic disease that causes high blood sugar levels when your body cannot properly process glucose.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    reviewer: {
      name: 'Dr. Sarah Chen',
      credentials: 'MD, Endocrinology',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    },
    overview: `
      <p>Diabetes is a chronic health condition that affects how your body turns food into energy. When you have diabetes, your body either doesn't make enough insulin or can't use the insulin it makes as well as it should.</p>
      <p>There are three main types of diabetes:</p>
      <ul>
        <li><strong>Type 1 Diabetes:</strong> An autoimmune condition where the body attacks insulin-producing cells</li>
        <li><strong>Type 2 Diabetes:</strong> The most common form, where the body doesn't use insulin properly</li>
        <li><strong>Gestational Diabetes:</strong> Develops during pregnancy</li>
      </ul>
    `,
    treatments: `
      <p>Diabetes management involves a combination of lifestyle changes, monitoring, and medication:</p>
      <ul>
        <li><strong>Insulin Therapy:</strong> Essential for Type 1 and sometimes Type 2 diabetes</li>
        <li><strong>Oral Medications:</strong> Metformin and other drugs to help control blood sugar</li>
        <li><strong>Blood Sugar Monitoring:</strong> Regular testing to track glucose levels</li>
        <li><strong>Diet Management:</strong> Controlling carbohydrate intake and eating balanced meals</li>
        <li><strong>Exercise:</strong> Regular physical activity to improve insulin sensitivity</li>
      </ul>
    `,
    symptoms: `
      <h3>Common Symptoms</h3>
      <ul>
        <li>Frequent urination</li>
        <li>Increased thirst and hunger</li>
        <li>Unexplained weight loss</li>
        <li>Extreme fatigue</li>
        <li>Blurry vision</li>
        <li>Slow-healing sores</li>
        <li>Frequent infections</li>
      </ul>
    `,
    causes: `
      <h3>Causes and Risk Factors</h3>
      <ul>
        <li>Family history and genetics</li>
        <li>Being overweight or obese</li>
        <li>Physical inactivity</li>
        <li>Age (45 or older increases risk)</li>
        <li>High blood pressure</li>
        <li>Abnormal cholesterol levels</li>
      </ul>
    `,
    prevention: `
      <p>Living well with diabetes is possible with proper management:</p>
      <ul>
        <li>Work closely with your healthcare team</li>
        <li>Monitor your blood sugar regularly</li>
        <li>Take medications as prescribed</li>
        <li>Maintain a healthy weight</li>
        <li>Stay physically active</li>
        <li>Eat a balanced, nutritious diet</li>
        <li>Manage stress effectively</li>
        <li>Get regular health checkups</li>
      </ul>
    `
  },
  'hypertension': {
    id: 2,
    name: 'Hypertension',
    slug: 'hypertension',
    subtitle: 'High blood pressure that can lead to serious heart and artery problems if left untreated.',
    image: 'https://images.unsplash.com/photo-1559757175-7b21671c7e96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    reviewer: {
      name: 'Dr. Michael Torres',
      credentials: 'MD, Cardiology',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    },
    overview: `
      <p>Hypertension, or high blood pressure, is a common condition where the force of blood against your artery walls is consistently too high. Over time, this can lead to serious health problems including heart disease and stroke.</p>
      <p>Blood pressure is measured in two numbers: systolic (when the heart beats) and diastolic (between beats). Normal blood pressure is less than 120/80 mm Hg.</p>
    `,
    treatments: `
      <p>Treatment typically includes lifestyle changes and medications:</p>
      <ul>
        <li><strong>ACE Inhibitors:</strong> Help relax blood vessels</li>
        <li><strong>Diuretics:</strong> Help the body eliminate excess sodium and water</li>
        <li><strong>Beta-Blockers:</strong> Reduce heart rate and workload</li>
        <li><strong>Calcium Channel Blockers:</strong> Relax blood vessel muscles</li>
        <li><strong>Lifestyle Modifications:</strong> Diet, exercise, stress management</li>
      </ul>
    `,
    symptoms: `
      <h3>Symptoms</h3>
      <p>Hypertension is often called the "silent killer" because it usually has no obvious symptoms. Some people may experience:</p>
      <ul>
        <li>Headaches</li>
        <li>Shortness of breath</li>
        <li>Nosebleeds</li>
        <li>Dizziness</li>
      </ul>
      <p>However, these symptoms often don't occur until blood pressure reaches dangerously high levels.</p>
    `,
    causes: `
      <h3>Risk Factors</h3>
      <ul>
        <li>Age (risk increases with age)</li>
        <li>Family history</li>
        <li>Being overweight or obese</li>
        <li>Lack of physical activity</li>
        <li>High sodium diet</li>
        <li>Excessive alcohol consumption</li>
        <li>Stress</li>
        <li>Certain chronic conditions</li>
      </ul>
    `,
    prevention: `
      <p>Managing hypertension involves maintaining healthy habits:</p>
      <ul>
        <li>Maintain a healthy weight</li>
        <li>Exercise regularly (at least 150 minutes per week)</li>
        <li>Eat a balanced diet low in sodium (DASH diet)</li>
        <li>Limit alcohol consumption</li>
        <li>Don't smoke</li>
        <li>Manage stress</li>
        <li>Monitor blood pressure regularly</li>
        <li>Take medications as prescribed</li>
      </ul>
    `
  },
  'asthma': {
    id: 3,
    name: 'Asthma',
    slug: 'asthma',
    subtitle: 'A chronic respiratory condition affecting the airways in the lungs.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    reviewer: {
      name: 'Dr. Emily Watson',
      credentials: 'MD, Pulmonology',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    },
    overview: `
      <p>Asthma is a chronic condition that affects the airways in your lungs. The airways become inflamed and narrowed, making it difficult to breathe. This inflammation causes recurring periods of wheezing, breathlessness, chest tightness, and coughing.</p>
    `,
    treatments: `
      <p>Asthma treatment focuses on controlling symptoms and preventing attacks:</p>
      <ul>
        <li><strong>Quick-Relief Inhalers:</strong> Short-acting bronchodilators for immediate relief</li>
        <li><strong>Long-Term Control Medications:</strong> Inhaled corticosteroids to reduce inflammation</li>
        <li><strong>Combination Inhalers:</strong> Both long-acting bronchodilators and corticosteroids</li>
        <li><strong>Leukotriene Modifiers:</strong> Oral medications that help prevent symptoms</li>
        <li><strong>Allergy Medications:</strong> If allergies trigger asthma</li>
      </ul>
    `,
    symptoms: `
      <h3>Common Symptoms</h3>
      <ul>
        <li>Shortness of breath</li>
        <li>Wheezing (a whistling sound when breathing)</li>
        <li>Coughing, especially at night or early morning</li>
        <li>Chest tightness or pain</li>
        <li>Trouble sleeping due to breathing problems</li>
      </ul>
    `,
    causes: `
      <h3>Common Triggers</h3>
      <ul>
        <li>Allergens (pollen, dust mites, pet dander, mold)</li>
        <li>Respiratory infections</li>
        <li>Physical activity</li>
        <li>Cold air</li>
        <li>Air pollutants and irritants</li>
        <li>Strong emotions and stress</li>
        <li>Certain medications</li>
        <li>Sulfites in foods and beverages</li>
      </ul>
    `,
    prevention: `
      <p>Managing asthma effectively involves:</p>
      <ul>
        <li>Identifying and avoiding triggers</li>
        <li>Following your asthma action plan</li>
        <li>Taking medications as prescribed</li>
        <li>Monitoring breathing with a peak flow meter</li>
        <li>Getting vaccinated for flu and pneumonia</li>
        <li>Keeping rescue inhaler accessible</li>
        <li>Regular check-ups with your doctor</li>
      </ul>
    `
  },
  'arthritis': {
    id: 4,
    name: 'Arthritis',
    slug: 'arthritis',
    subtitle: 'A condition causing inflammation and stiffness in one or more joints.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    reviewer: {
      name: 'Dr. James Miller',
      credentials: 'MD, Rheumatology',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    },
    overview: `
      <p>Arthritis is inflammation of one or more joints, causing pain and stiffness that can worsen with age. There are more than 100 types of arthritis, with osteoarthritis and rheumatoid arthritis being the most common.</p>
    `,
    treatments: `
      <ul>
        <li><strong>Physical Therapy:</strong> Exercises to improve range of motion and strengthen muscles</li>
        <li><strong>Medications:</strong> Pain relievers, anti-inflammatory drugs, DMARDs</li>
        <li><strong>Lifestyle Modifications:</strong> Weight management, low-impact exercise</li>
        <li><strong>Hot and Cold Therapy:</strong> To reduce pain and stiffness</li>
        <li><strong>Surgery:</strong> Joint repair or replacement in severe cases</li>
      </ul>
    `,
    symptoms: `
      <h3>Common Symptoms</h3>
      <ul>
        <li>Joint pain and tenderness</li>
        <li>Stiffness, especially in the morning</li>
        <li>Swelling around joints</li>
        <li>Decreased range of motion</li>
        <li>Redness around joints</li>
        <li>Fatigue (especially with rheumatoid arthritis)</li>
      </ul>
    `,
    causes: `
      <h3>Types and Causes</h3>
      <ul>
        <li><strong>Osteoarthritis:</strong> Wear and tear on cartilage over time</li>
        <li><strong>Rheumatoid Arthritis:</strong> Autoimmune disorder attacking joint lining</li>
        <li><strong>Psoriatic Arthritis:</strong> Associated with psoriasis</li>
        <li><strong>Gout:</strong> Caused by uric acid crystal buildup</li>
      </ul>
    `,
    prevention: `
      <p>Living well with arthritis includes:</p>
      <ul>
        <li>Staying physically active with joint-friendly exercises</li>
        <li>Maintaining a healthy weight</li>
        <li>Protecting your joints during activities</li>
        <li>Using assistive devices when needed</li>
        <li>Applying heat or cold for comfort</li>
        <li>Getting adequate rest</li>
        <li>Working with your healthcare team</li>
      </ul>
    `
  },
  'depression': {
    id: 5,
    name: 'Depression',
    slug: 'depression',
    subtitle: 'A mood disorder causing persistent feelings of sadness and loss of interest.',
    image: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    reviewer: {
      name: 'Dr. Amanda Roberts',
      credentials: 'MD, Psychiatry',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    },
    overview: `
      <p>Depression is a common and serious mental health condition that negatively affects how you feel, think, and act. It causes feelings of sadness and/or a loss of interest in activities you once enjoyed. It is more than just feeling sad or going through a rough patch.</p>
    `,
    treatments: `
      <ul>
        <li><strong>Psychotherapy:</strong> Cognitive behavioral therapy (CBT), interpersonal therapy</li>
        <li><strong>Medications:</strong> Antidepressants (SSRIs, SNRIs, etc.)</li>
        <li><strong>Brain Stimulation Therapies:</strong> For treatment-resistant depression</li>
        <li><strong>Lifestyle Changes:</strong> Exercise, sleep hygiene, stress management</li>
        <li><strong>Support Groups:</strong> Connecting with others who understand</li>
      </ul>
    `,
    symptoms: `
      <h3>Common Symptoms</h3>
      <ul>
        <li>Persistent sad, anxious, or empty mood</li>
        <li>Loss of interest in activities once enjoyed</li>
        <li>Changes in appetite or weight</li>
        <li>Sleep disturbances (insomnia or oversleeping)</li>
        <li>Fatigue and decreased energy</li>
        <li>Difficulty concentrating or making decisions</li>
        <li>Feelings of worthlessness or guilt</li>
        <li>Thoughts of death or suicide</li>
      </ul>
    `,
    causes: `
      <h3>Contributing Factors</h3>
      <ul>
        <li>Brain chemistry imbalances</li>
        <li>Genetics and family history</li>
        <li>Traumatic or stressful life events</li>
        <li>Medical conditions</li>
        <li>Certain medications</li>
        <li>Substance abuse</li>
      </ul>
    `,
    prevention: `
      <p>Managing depression and supporting recovery:</p>
      <ul>
        <li>Stick to your treatment plan</li>
        <li>Build a strong support network</li>
        <li>Stay physically active</li>
        <li>Get adequate sleep</li>
        <li>Avoid alcohol and drugs</li>
        <li>Practice stress-reduction techniques</li>
        <li>Set realistic goals</li>
        <li>Reach out when you need help</li>
      </ul>
      <p><strong>If you're experiencing thoughts of suicide, please reach out to a crisis helpline immediately.</strong></p>
    `
  },
  'anxiety': {
    id: 6,
    name: 'Anxiety',
    slug: 'anxiety',
    subtitle: 'A mental health condition characterized by excessive worry and fear.',
    image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    reviewer: {
      name: 'Dr. David Park',
      credentials: 'MD, Psychiatry',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
    },
    overview: `
      <p>Anxiety disorders involve more than temporary worry or fear. For a person with an anxiety disorder, the anxiety does not go away and can get worse over time. The feelings can interfere with daily activities such as job performance, school work, and relationships.</p>
    `,
    treatments: `
      <ul>
        <li><strong>Psychotherapy:</strong> Cognitive behavioral therapy (CBT), exposure therapy</li>
        <li><strong>Medications:</strong> Anti-anxiety medications, antidepressants</li>
        <li><strong>Relaxation Techniques:</strong> Deep breathing, meditation, yoga</li>
        <li><strong>Lifestyle Changes:</strong> Regular exercise, adequate sleep, limiting caffeine</li>
        <li><strong>Support Groups:</strong> Sharing experiences with others</li>
      </ul>
    `,
    symptoms: `
      <h3>Common Symptoms</h3>
      <ul>
        <li>Restlessness or feeling on edge</li>
        <li>Being easily fatigued</li>
        <li>Difficulty concentrating</li>
        <li>Irritability</li>
        <li>Muscle tension</li>
        <li>Sleep problems</li>
        <li>Excessive worry</li>
        <li>Panic attacks (in panic disorder)</li>
      </ul>
    `,
    causes: `
      <h3>Types of Anxiety Disorders</h3>
      <ul>
        <li><strong>Generalized Anxiety Disorder (GAD):</strong> Persistent, excessive worry</li>
        <li><strong>Panic Disorder:</strong> Recurrent panic attacks</li>
        <li><strong>Social Anxiety Disorder:</strong> Fear of social situations</li>
        <li><strong>Specific Phobias:</strong> Intense fear of specific objects or situations</li>
        <li><strong>Separation Anxiety:</strong> Fear of being away from loved ones</li>
      </ul>
    `,
    prevention: `
      <p>Managing anxiety and improving quality of life:</p>
      <ul>
        <li>Stick to your treatment plan</li>
        <li>Practice relaxation techniques daily</li>
        <li>Stay physically active</li>
        <li>Prioritize sleep</li>
        <li>Limit caffeine and alcohol</li>
        <li>Connect with others</li>
        <li>Keep a journal to identify triggers</li>
        <li>Learn about your condition</li>
      </ul>
    `
  }
};

export default function handler(req, res) {
  const { slug } = req.query;
  const condition = conditions[slug];
  
  if (condition) {
    res.status(200).json(condition);
  } else {
    res.status(404).json({ error: 'Condition not found' });
  }
}
