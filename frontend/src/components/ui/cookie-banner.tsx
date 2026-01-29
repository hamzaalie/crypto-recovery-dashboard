import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie, Settings } from 'lucide-react';
import { Button } from './button';

const COOKIE_CONSENT_KEY = 'cookie-consent';

interface CookieConsent {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  targeting: boolean;
  timestamp: number;
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true,
    performance: false,
    functional: false,
    targeting: false,
    timestamp: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(stored);
        setConsent(parsed);
      } catch {
        setIsVisible(true);
      }
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = { ...newConsent, timestamp: Date.now() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithTimestamp));
    setConsent(consentWithTimestamp);
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      performance: true,
      functional: true,
      targeting: true,
      timestamp: Date.now(),
    });
  };

  const acceptEssential = () => {
    saveConsent({
      essential: true,
      performance: false,
      functional: false,
      targeting: false,
      timestamp: Date.now(),
    });
  };

  const savePreferences = () => {
    saveConsent(consent);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto">
        {!showSettings ? (
          // Simple Banner Design done andnnow working in another think
          <div className="bg-white rounded-lg shadow-2xl border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-brand-100 rounded-lg hidden sm:block">
                  <Cookie className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">We use cookies</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <Link to="/cookies" className="text-brand-600 hover:underline">Learn more</Link>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={acceptAll} className="bg-brand-600 hover:bg-brand-700">
                      Accept All
                    </Button>
                    <Button variant="outline" onClick={acceptEssential}>
                      Essential Only
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSettings(true)}
                      className="text-gray-600"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
              <button
                onClick={acceptEssential}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          // Settings Panel
          <div className="bg-white rounded-lg shadow-2xl border p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Essential */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                    <p className="text-sm text-gray-500">Required for the website to function</p>
                  </div>
                  <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Always Active
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Performance Cookies</h4>
                    <p className="text-sm text-gray-500">Help us improve our website</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.performance}
                      onChange={(e) => setConsent({ ...consent, performance: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              </div>

              {/* Functional */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Functional Cookies</h4>
                    <p className="text-sm text-gray-500">Remember your preferences</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.functional}
                      onChange={(e) => setConsent({ ...consent, functional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              </div>

              {/* Targeting */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Targeting Cookies</h4>
                    <p className="text-sm text-gray-500">Used for advertising purposes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.targeting}
                      onChange={(e) => setConsent({ ...consent, targeting: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={acceptEssential}>
                Reject All
              </Button>
              <Button onClick={savePreferences} className="bg-brand-600 hover:bg-brand-700">
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
