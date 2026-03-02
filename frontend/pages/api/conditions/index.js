const conditions = [
  { id: 1, title: 'Diabetes', slug: 'diabetes', letter: 'D', summary: 'A metabolic disease that causes high blood sugar.' },
  { id: 2, title: 'Hypertension', slug: 'hypertension', letter: 'H', summary: 'High blood pressure that can lead to heart disease.' },
  { id: 3, title: 'Asthma', slug: 'asthma', letter: 'A', summary: 'A condition affecting the airways in the lungs.' },
  { id: 4, title: 'Arthritis', slug: 'arthritis', letter: 'A', summary: 'Inflammation of one or more joints.' },
  { id: 5, title: 'Depression', slug: 'depression', letter: 'D', summary: 'A mood disorder causing persistent feelings of sadness.' },
  { id: 6, title: 'Anxiety', slug: 'anxiety', letter: 'A', summary: 'A mental health condition characterized by excessive worry.' },
  { id: 7, title: 'Cancer', slug: 'cancer', letter: 'C', summary: 'A group of diseases involving abnormal cell growth.' },
  { id: 8, title: 'Heart Disease', slug: 'heart-disease', letter: 'H', summary: 'A range of conditions that affect the heart.' }
];
export const runtime = "edge";
export default function handler(req, res) {
  res.status(200).json(conditions);
}
