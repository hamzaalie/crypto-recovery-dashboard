import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import logo from '@/assets/images/logo.png';

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 15, 2026</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using CryptoRecover's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Services Description</h2>
            <p className="text-gray-600 mb-4">
              CryptoRecover provides cryptocurrency asset recovery services, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Wallet recovery assistance</li>
              <li>Scam and fraud investigation</li>
              <li>Blockchain forensics analysis</li>
              <li>Asset tracing and recovery</li>
              <li>Exchange dispute resolution</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 mb-4">As a user of our services, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide accurate and complete information about your case</li>
              <li>Cooperate fully with our investigation team</li>
              <li>Not use our services for any illegal purposes</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Promptly notify us of any unauthorized account access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Fees and Payment</h2>
            <p className="text-gray-600 mb-4">
              Our fee structure is based on successful recovery. We operate on a contingency basis, meaning:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>No upfront fees for case evaluation</li>
              <li>Recovery fees range from 15-25% of recovered assets</li>
              <li>Fees are only charged upon successful recovery</li>
              <li>Complex cases may have additional investigation costs disclosed upfront</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. No Guarantee of Recovery</h2>
            <p className="text-gray-600 mb-4">
              While we employ industry-leading techniques and have a high success rate, we cannot guarantee recovery of lost or stolen assets. Each case is unique, and outcomes depend on various factors including the type of loss, time elapsed, and available information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Confidentiality</h2>
            <p className="text-gray-600 mb-4">
              We treat all client information with strict confidentiality. We will not disclose your personal information or case details to third parties except as required by law or with your explicit consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              CryptoRecover shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability shall not exceed the fees paid for services rendered.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              All content, trademarks, and intellectual property on our platform are owned by CryptoRecover. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to terminate or suspend access to our services at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through our platform. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: legal@cryptorecover.com<br />
              Phone: +1 (800) 123-4567<br />
              Address: 350 Fifth Avenue, Suite 4200, New York, NY 10118
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
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CryptoRecover</p>
        </div>
      </footer>
    </div>
  );
}
