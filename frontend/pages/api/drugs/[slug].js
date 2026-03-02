
const drugs = {
  'metformin': {
    id: 1,
    title: 'Metformin',
    slug: 'metformin',
    generic_name: 'Metformin',
    brand_names: ['Glucophage', 'Fortamet', 'Glumetza'],
    drug_class: 'Biguanide',
    description: 'Metformin is an oral diabetes medicine that helps control blood sugar levels.',
    uses: [
      'Treatment of type 2 diabetes mellitus',
      'Often used as first-line therapy',
      'May be used alone or with other diabetes medications'
    ],
    side_effects: [
      'Nausea',
      'Diarrhea',
      'Stomach upset',
      'Loss of appetite',
      'Metallic taste'
    ],
    warnings: [
      'May cause lactic acidosis in rare cases',
      'Should be temporarily stopped before certain medical procedures',
      'Not recommended for patients with severe kidney disease'
    ],
    dosage: 'Usually started at 500mg twice daily with meals. Dosage may be increased gradually.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80'
  },
  'lisinopril': {
    id: 2,
    title: 'Lisinopril',
    slug: 'lisinopril',
    generic_name: 'Lisinopril',
    brand_names: ['Prinivil', 'Zestril'],
    drug_class: 'ACE Inhibitor',
    description: 'Lisinopril is an ACE inhibitor used to treat high blood pressure and heart failure.',
    uses: [
      'Treatment of high blood pressure (hypertension)',
      'Treatment of heart failure',
      'Improving survival after heart attack'
    ],
    side_effects: [
      'Dry cough',
      'Dizziness',
      'Headache',
      'Fatigue',
      'Nausea'
    ],
    warnings: [
      'Should not be used during pregnancy',
      'Can cause high potassium levels',
      'May cause allergic reactions including angioedema'
    ],
    dosage: 'Usually started at 5-10mg once daily. May be adjusted based on blood pressure response.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80'
  },
  'ibuprofen': {
    id: 3,
    title: 'Ibuprofen',
    slug: 'ibuprofen',
    generic_name: 'Ibuprofen',
    brand_names: ['Advil', 'Motrin', 'Nuprin'],
    drug_class: 'NSAID (Nonsteroidal Anti-inflammatory Drug)',
    description: 'Ibuprofen is a common over-the-counter pain reliever and fever reducer.',
    uses: [
      'Relief of mild to moderate pain',
      'Reduction of fever',
      'Treatment of inflammatory conditions',
      'Relief of menstrual cramps'
    ],
    side_effects: [
      'Stomach upset',
      'Heartburn',
      'Nausea',
      'Dizziness',
      'Headache'
    ],
    warnings: [
      'May increase risk of heart attack or stroke',
      'Can cause stomach ulcers or bleeding',
      'Should be used at lowest effective dose for shortest duration'
    ],
    dosage: 'Adults: 200-400mg every 4-6 hours as needed. Maximum 1200mg per day without doctor supervision.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80'
  },
  'amoxicillin': {
    id: 4,
    title: 'Amoxicillin',
    slug: 'amoxicillin',
    generic_name: 'Amoxicillin',
    brand_names: ['Amoxil', 'Trimox', 'Moxatag'],
    drug_class: 'Penicillin-type Antibiotic',
    description: 'Amoxicillin is a penicillin-type antibiotic used to treat various bacterial infections.',
    uses: [
      'Treatment of bacterial infections',
      'Ear infections',
      'Respiratory tract infections',
      'Urinary tract infections',
      'Skin infections'
    ],
    side_effects: [
      'Diarrhea',
      'Stomach upset',
      'Nausea',
      'Vomiting',
      'Skin rash'
    ],
    warnings: [
      'Not effective against viral infections',
      'May cause allergic reactions in penicillin-allergic patients',
      'Complete the full course of treatment as prescribed'
    ],
    dosage: 'Varies by infection type. Common adult dose is 500mg every 8 hours or 875mg every 12 hours.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80'
  },
  'atorvastatin': {
    id: 5,
    title: 'Atorvastatin',
    slug: 'atorvastatin',
    generic_name: 'Atorvastatin',
    brand_names: ['Lipitor'],
    drug_class: 'Statin',
    description: 'Atorvastatin is used to lower cholesterol and reduce the risk of heart disease.',
    uses: [
      'Lowering LDL (bad) cholesterol',
      'Raising HDL (good) cholesterol',
      'Lowering triglycerides',
      'Reducing risk of heart attack and stroke'
    ],
    side_effects: [
      'Muscle pain',
      'Headache',
      'Nausea',
      'Diarrhea',
      'Joint pain'
    ],
    warnings: [
      'Should not be used during pregnancy',
      'May cause serious muscle problems in rare cases',
      'Regular liver function tests may be needed'
    ],
    dosage: 'Usually started at 10-20mg once daily. May be increased up to 80mg daily based on cholesterol levels.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80'
  },
  'omeprazole': {
    id: 6,
    title: 'Omeprazole',
    slug: 'omeprazole',
    generic_name: 'Omeprazole',
    brand_names: ['Prilosec', 'Zegerid'],
    drug_class: 'Proton Pump Inhibitor (PPI)',
    description: 'Omeprazole reduces stomach acid production and is used to treat acid reflux and ulcers.',
    uses: [
      'Treatment of GERD (acid reflux)',
      'Treatment of stomach and duodenal ulcers',
      'Treatment of erosive esophagitis',
      'Prevention of ulcers caused by NSAIDs'
    ],
    side_effects: [
      'Headache',
      'Stomach pain',
      'Diarrhea',
      'Nausea',
      'Gas'
    ],
    warnings: [
      'Long-term use may increase risk of bone fractures',
      'May reduce absorption of certain vitamins and minerals',
      'May mask symptoms of stomach cancer'
    ],
    dosage: 'Usually 20mg once daily before a meal. Treatment duration varies by condition.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80'
  }
};

export default function handler(req, res) {
  const { slug } = req.query;
  const drug = drugs[slug];
  
  if (drug) {
    res.status(200).json(drug);
  } else {
    res.status(404).json({ error: 'Drug not found' });
  }
}
