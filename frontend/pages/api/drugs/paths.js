const paths = [
  { slug: 'metformin' },
  { slug: 'lisinopril' },
  { slug: 'ibuprofen' },
  { slug: 'amoxicillin' },
  { slug: 'atorvastatin' },
  { slug: 'omeprazole' }
];

export default function handler(req, res) {
  res.status(200).json(paths);
}
