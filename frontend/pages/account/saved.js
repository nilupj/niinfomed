import AccountLayout from '../../components/AccountLayout';
export default function SavedContentPage() {
  return (
    <AccountLayout>
      <h1 className="text-2xl font-bold mb-2">My Content</h1>
      <p className="text-gray-600 mb-6">
        Track, save, and organize health content that matters to you.
      </p>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow p-8 max-w-xl">
        <h3 className="text-lg font-semibold text-center mb-2">
          NO SAVED ARTICLES
        </h3>

        <p className="text-sm text-gray-500 text-center mb-6">
          Save articles to read later and organize your health interests.
        </p>

        <div className="space-y-4">
          <ContentCard
            title="Wellness Topics"
            desc="Expert guidance and practical tips for daily health"
          />
          <ContentCard
            title="Product Reviews"
            desc="Honest reviews of health products"
          />
          <ContentCard
            title="Health News"
            desc="Latest health updates and stories"
          />
        </div>
      </div>
    </AccountLayout>
  );
}

function ContentCard({ title, desc }) {
  return (
    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4 hover:bg-blue-100 cursor-pointer">
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
      <span className="text-blue-600 text-xl">→</span>
    </div>
  );
}
