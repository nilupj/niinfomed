
import { useState, useEffect } from 'react';
export const runtime = "edge";
export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(consent));
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    localStorage.setItem('cookieConsent', JSON.stringify(necessaryOnly));
    setShowBanner(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-gray-200">
      {!showSettings ? (
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-start gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">We Value Your Privacy</h3>
              <p className="text-sm text-gray-600 mb-4">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={acceptAll}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accept All
                </button>
                <button 
                  onClick={acceptNecessary}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Necessary Only
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Customize
                </button>
              </div>
            </div>
            <button 
              onClick={acceptNecessary}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold">Cookie Preferences</h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Necessary Cookies</h4>
                <p className="text-sm text-gray-600">
                  Required for the website to function properly. Cannot be disabled.
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={true} 
                disabled 
                className="mt-1 h-5 w-5"
              />
            </div>

            <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Functional Cookies</h4>
                <p className="text-sm text-gray-600">
                  Enable enhanced functionality and personalization.
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.functional}
                onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                className="mt-1 h-5 w-5 accent-blue-600"
              />
            </div>

            <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Analytics Cookies</h4>
                <p className="text-sm text-gray-600">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.analytics}
                onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                className="mt-1 h-5 w-5 accent-blue-600"
              />
            </div>

            <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Marketing Cookies</h4>
                <p className="text-sm text-gray-600">
                  Used to track visitors across websites for advertising purposes.
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.marketing}
                onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                className="mt-1 h-5 w-5 accent-blue-600"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={savePreferences}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Preferences
            </button>
            <button 
              onClick={acceptAll}
              className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
