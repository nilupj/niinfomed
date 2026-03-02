export const runtime = "edge";
const newsArticles = {
  'mediterranean-diet-longevity-study': {
    id: 101,
    title: 'New Study Links Mediterranean Diet to Longer Life',
    slug: 'mediterranean-diet-longevity-study',
    summary: 'Research shows significant health benefits from following a Mediterranean-style diet.',
    content: `
      <h2>Mediterranean Diet and Longevity</h2>
      <p>A comprehensive new study has confirmed what many health experts have long believed: following a Mediterranean-style diet can significantly extend your lifespan and improve overall health outcomes.</p>
      
      <h3>Key Findings</h3>
      <p>The research, which followed over 25,000 participants for a decade, found that those who closely adhered to a Mediterranean diet had:</p>
      <ul>
        <li>23% lower risk of cardiovascular disease</li>
        <li>30% reduced risk of type 2 diabetes</li>
        <li>Significantly lower inflammation markers</li>
        <li>Better cognitive function in older age</li>
      </ul>
      
      <h3>What is the Mediterranean Diet?</h3>
      <p>The Mediterranean diet emphasizes:</p>
      <ul>
        <li>Plenty of fruits and vegetables</li>
        <li>Whole grains and legumes</li>
        <li>Olive oil as the primary fat source</li>
        <li>Fish and seafood at least twice weekly</li>
        <li>Moderate consumption of dairy and wine</li>
        <li>Limited red meat</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-15T12:00:00Z',
    author: { name: 'Dr. Michael Brown', credentials: 'MD, MPH' },
    category: { name: 'Nutrition', slug: 'nutrition' },
    reading_time: 4
  },
  'fda-migraine-treatment-approval': {
    id: 102,
    title: 'FDA Approves New Treatment for Chronic Migraines',
    slug: 'fda-migraine-treatment-approval',
    summary: 'A breakthrough medication offers hope for millions suffering from chronic migraines.',
    content: `
      <h2>New Hope for Migraine Sufferers</h2>
      <p>The FDA has approved a new medication that represents a significant advancement in the treatment of chronic migraines, offering relief to millions who suffer from this debilitating condition.</p>
      
      <h3>How It Works</h3>
      <p>The new treatment targets a specific protein involved in migraine pain pathways, providing more targeted relief with fewer side effects than traditional medications.</p>
      
      <h3>Clinical Trial Results</h3>
      <p>In clinical trials, patients reported:</p>
      <ul>
        <li>50% reduction in monthly migraine days</li>
        <li>Faster onset of pain relief</li>
        <li>Fewer side effects compared to existing treatments</li>
        <li>Improved quality of life scores</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
    published_date: '2025-03-14T15:30:00Z',
    author: { name: 'Dr. Rachel Kim', credentials: 'MD, Neurology' },
    category: { name: 'Medical News', slug: 'medical-news' },
    reading_time: 5
  }
};

export default function handler(req, res) {
  const { slug } = req.query;
  const article = newsArticles[slug];
  
  if (article) {
    res.status(200).json(article);
  } else {
    res.status(404).json({ error: 'Article not found' });
  }
}
