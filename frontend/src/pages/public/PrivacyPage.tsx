import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.png';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 15, 2026</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              CryptoRecover ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cryptocurrency recovery services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information</h3>
            <p className="text-gray-600 mb-4">We may collect the following personal information:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Name and contact information (email, phone number, address)</li>
              <li>Government-issued identification (for verification purposes)</li>
              <li>Cryptocurrency wallet addresses and transaction details</li>
              <li>Financial information related to your case</li>
              <li>Communication records with our team</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Technical Information</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Usage data and analytics</li>
              <li>Cookies and tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and improve our recovery services</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Communicate with you about your case</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Send service-related notifications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Law Enforcement:</strong> When required by law or to protect rights</li>
              <li><strong>Service Providers:</strong> Third parties that assist our operations under confidentiality agreements</li>
              <li><strong>Exchanges & Platforms:</strong> When necessary for asset recovery (with your consent)</li>
              <li><strong>Legal Advisors:</strong> For legal consultation on your case</li>
            </ul>
            <p className="text-gray-600 mt-4">
              We never sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement robust security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>Multi-factor authentication requirements</li>
              <li>Regular security audits and penetration testing</li>
              <li>Strict access controls and employee training</li>
              <li>SOC 2 Type II compliance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. After case closure, we retain records for a minimum of 7 years as required by financial regulations. You may request data deletion, subject to legal requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="text-gray-600 mt-4">
              To exercise these rights, contact us at privacy@cryptorecover.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Transfers</h2>
            <p className="text-gray-600 mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses for EU data transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies Policy</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to enhance your experience. See our <Link to="/cookies" className="text-brand-600 hover:underline">Cookie Policy</Link> for details on the types of cookies we use and how to manage them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or through our platform. Your continued use of our services constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For privacy-related inquiries or to exercise your data rights:
            </p>
            <p className="text-gray-600">
              Data Protection Officer<br />
              Email: privacy@cryptorecover.com<br />
              Phone: +1 (800) 123-4567<br />
              Address: 350 Fifth Avenue, Suite 4200, New York, NY 10118
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. GDPR Compliance (EU Users)</h2>
            <p className="text-gray-600 mb-4">
              For users in the European Union, we process personal data under the following legal bases:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Performance of a contract (providing our services)</li>
              <li>Legal obligations (regulatory compliance)</li>
              <li>Legitimate interests (fraud prevention, service improvement)</li>
              <li>Consent (where explicitly obtained)</li>
            </ul>
            <p className="text-gray-600 mt-4">
              You have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>
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
            <Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CryptoRecover</p>
        </div>
      </footer>
    </div>
  );
}
