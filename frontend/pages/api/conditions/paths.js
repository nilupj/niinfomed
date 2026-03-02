const paths = [
  'diabetes',
  'hypertension',
  'asthma',
  'arthritis',
  'depression',
  'anxiety'
];
export const runtime = "edge";
export default function handler(req, res) {
  res.status(200).json(paths);
}
