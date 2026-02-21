const paths = [
  'diabetes',
  'hypertension',
  'asthma',
  'arthritis',
  'depression',
  'anxiety'
];

export default function handler(req, res) {
  res.status(200).json(paths);
}
