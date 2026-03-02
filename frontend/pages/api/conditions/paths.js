const paths = [
  'diabetes',
  'hypertension',
  'asthma',
  'arthritis',
  'depression',
  'anxiety'
];
export const runtime = "nodejs";
export default function handler(req, res) {
  res.status(200).json(paths);
}
