
import { useEffect, useState } from 'react';
export default function CMSStatus() {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCMSStatus = async () => {
      const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://0.0.0.0:8001';
      
      try {
        const response = await axios.get(`${CMS_API_URL}/api/content-status/`, { 
          timeout: 30000,
          headers: {
            'Accept': 'application/json',
          },
          maxRedirects: 0 // Prevent following redirects
        });
        setStatus(response.data);
      } catch (error) {
        console.error('Failed to fetch CMS status:', error);
        const errorMessage = error.code === 'ECONNABORTED' 
          ? 'Connection timeout - CMS may be starting up. Please wait and refresh.'
          : error.response?.data?.message || error.message || 'Unable to connect to CMS';
        setStatus({ error: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    checkCMSStatus();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Wagtail CMS Content Status</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : status.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error connecting to CMS</p>
          <p className="mb-4">{status.error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            Retry
          </button>
          <div className="mt-4 text-sm">
            <p className="font-semibold">Troubleshooting:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Make sure the Wagtail CMS is running (check "Start All Services" workflow)</li>
              <li>CMS should be accessible at: {process.env.NEXT_PUBLIC_CMS_API_URL || 'http://0.0.0.0:8001'}</li>
              <li>If just started, wait 30-60 seconds for CMS to fully initialize</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(status).map(([key, value]) => (
            <div key={key} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 capitalize">{key}</h3>
              <div className="space-y-1">
                <p>Total: <span className="font-bold">{value.total}</span></p>
                <p>Published: <span className="font-bold text-green-600">{value.live}</span></p>
                {value.featured !== undefined && (
                  <p>Featured: <span className="font-bold text-blue-600">{value.featured}</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm">
          <strong>CMS API URL:</strong> {process.env.NEXT_PUBLIC_CMS_API_URL || 'http://0.0.0.0:8001'}
        </p>
        <p className="text-sm mt-2">
          Visit <a href="/admin" className="text-blue-600 underline" target="_blank">Wagtail Admin</a> to add or publish content.
        </p>
      </div>
    </div>
  );
}
