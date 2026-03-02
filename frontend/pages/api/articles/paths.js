const paths = [
  { slug: 'covid-19-updates' },
  { slug: 'understanding-heart-health' },
  { slug: 'mental-health-awareness' },
  { slug: 'nutrition-myths' },
  { slug: 'sleep-hygiene-tips' },
  { slug: 'exercise-for-beginners' },
  { slug: 'stress-management-techniques' },
  { slug: 'healthy-eating-budget' }
];
export const runtime = "edge";
export default function handler(req, res) {
  res.status(200).json(paths);
}
