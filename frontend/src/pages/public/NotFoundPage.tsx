import { Link } from 'react-router-dom';
import { Shield, Home, Search, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import logo from '@/assets/images/logo.png';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="CryptoRecover Logo" className="h-12 w-auto object-contain" />
            </Link>
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Large 404 */}
          <div className="mb-8">
            <span className="text-9xl font-bold bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-transparent">
              404
            </span>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or never existed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button asChild className="bg-brand-600 hover:bg-brand-700">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/help">
                <HelpCircle className="h-4 w-4 mr-2" />
                Visit Help Center
              </Link>
            </Button>
          </div>

          {/* Go Back */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go Back
          </button>

          {/* Search Box */}
          <div className="mt-12">
            <p className="text-sm text-gray-500 mb-3">Or try searching for what you need:</p>
            <div className="relative max-w-sm mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-500 mb-4">Popular Pages</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="text-brand-600 hover:underline">About Us</Link>
              <Link to="/contact" className="text-brand-600 hover:underline">Contact</Link>
              <Link to="/help" className="text-brand-600 hover:underline">FAQ</Link>
              <Link to="/status" className="text-brand-600 hover:underline">Status</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="CryptoRecover Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CryptoRecover</p>
        </div>
      </footer>
    </div>
  );
}
