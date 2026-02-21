const paths = [
  { slug: 'mediterranean-diet-longevity-study' },
  { slug: 'fda-migraine-treatment-approval' },
  { slug: 'walking-heart-disease-prevention' },
  { slug: 'mental-health-apps-anxiety-study' },
  { slug: 'sleep-quality-vs-duration-study' }
];

export default function handler(req, res) {
  res.status(200).json(paths);
}
