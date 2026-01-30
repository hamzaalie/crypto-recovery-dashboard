import { Link } from 'react-router-dom';
import { Cookie, Settings, BarChart3, Target, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import logo from '@/assets/images/logo.png';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="CryptoRecover Logo" className="h-12 w-auto object-contain" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 15, 2026</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, which can make your next visit easier and the site more useful to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6 mt-6">
              {/* Essential Cookies */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Lock className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Essential Cookies</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Always Active</span>
                </div>
                <p className="text-gray-600 mb-3">
                  These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions you take, such as logging in or filling in forms.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-700 mb-1">Examples:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Session ID cookies for authentication</li>
                    <li>• Security tokens for CSRF protection</li>
                    <li>• Load balancing cookies</li>
                  </ul>
                </div>
              </div>

              {/* Performance Cookies */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Performance Cookies</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-700 mb-1">Examples:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Google Analytics (_ga, _gid)</li>
                    <li>• Page load performance metrics</li>
                    <li>• Error tracking cookies</li>
                  </ul>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Functional Cookies</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-700 mb-1">Examples:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Language preferences</li>
                    <li>• Theme settings (dark/light mode)</li>
                    <li>• Form auto-fill data</li>
                  </ul>
                </div>
              </div>

              {/* Targeting Cookies */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Targeting Cookies</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  These cookies may be set through our site by advertising partners to build a profile of your interests and show you relevant ads on other sites.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-700 mb-1">Examples:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Google Ads remarketing</li>
                    <li>• LinkedIn Insight Tag</li>
                    <li>• Facebook Pixel</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cookie Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">session_id</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Essential</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Session</td>
                    <td className="px-4 py-3 text-sm text-gray-600">User authentication</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">csrf_token</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Essential</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Session</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Security protection</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">_ga</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Performance</td>
                    <td className="px-4 py-3 text-sm text-gray-600">2 years</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Google Analytics</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">_gid</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Performance</td>
                    <td className="px-4 py-3 text-sm text-gray-600">24 hours</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Google Analytics</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">theme</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Functional</td>
                    <td className="px-4 py-3 text-sm text-gray-600">1 year</td>
                    <td className="px-4 py-3 text-sm text-gray-600">UI preference</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">cookie_consent</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Essential</td>
                    <td className="px-4 py-3 text-sm text-gray-600">1 year</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Store consent preferences</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-600 mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through settings</li>
              <li><strong>Cookie Banner:</strong> Use our cookie consent banner to manage your preferences</li>
              <li><strong>Opt-Out Links:</strong> Use the links below for specific services</li>
            </ul>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Disabling essential cookies may affect the functionality of our website. Some features may not work correctly without them.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browser Cookie Settings</h2>
            <p className="text-gray-600 mb-4">
              Learn how to manage cookies in your browser:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Google Chrome</a></li>
              <li>• <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Mozilla Firefox</a></li>
              <li>• <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Safari</a></li>
              <li>• <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              Some of our pages may contain content from third parties (such as YouTube, Google Maps, or social media widgets) that may set their own cookies. We do not control these cookies and recommend reviewing the privacy policies of these third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <p className="text-gray-600">
              Email: privacy@cryptorecover.com<br />
              Phone: +1 (800) 123-4567
            </p>
          </section>
        </div>

        {/* Cookie Preferences Button */}
        <div className="mt-8 p-6 bg-white rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="h-6 w-6 text-brand-600" />
            <h3 className="text-lg font-semibold">Manage Your Cookie Preferences</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Click the button below to update your cookie consent settings at any time.
          </p>
          <Button className="bg-brand-600 hover:bg-brand-700">
            <Settings className="h-4 w-4 mr-2" />
            Open Cookie Settings
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="CryptoRecover Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CryptoRecover</p>
        </div>
      </footer>
    </div>
  );
}
