
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ContentTest() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://0.0.0.0:8001';
        const response = await axios.get(`${CMS_API_URL}/api/content-status/`, {
          timeout: 30000,
          headers: {
            'Accept': 'application/json',
          }
        });
        setStatus(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching content status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (error) return <div className="container mx-auto p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Wagtail CMS Content Status</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {status && Object.entries(status).map(([type, counts]) => (
          <div key={type} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 capitalize">{type}</h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Total:</span> {counts.total}
              </p>
              <p className="text-sm">
                <span className="font-medium">Published:</span> {counts.live}
              </p>
              {counts.featured !== undefined && (
                <p className="text-sm">
                  <span className="font-medium">Featured:</span> {counts.featured}
                </p>
              )}
            </div>
            {counts.live === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  ⚠️ No published content. Please add content in Wagtail admin.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Go to Wagtail Admin: <a href="http://0.0.0.0:8001/admin" className="text-blue-600 underline" target="_blank">http://0.0.0.0:8001/admin</a></li>
          <li>Create content pages for each content type</li>
          <li>Click "Publish" on each page to make it live</li>
          <li>Refresh this page to see updated counts</li>
          <li>Content will automatically appear on the homepage</li>
        </ol>
      </div>
    </div>
  );
}
