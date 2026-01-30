import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronRight,
  Shield,
  HelpCircle,
  FileText,
  Lock,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  BookOpen,
  Wallet,
  Settings,
  Key,
} from 'lucide-react';
import logo from '@/assets/images/logo.png';

const categories = [
  {
    icon: Wallet,
    title: 'Wallet Recovery',
    description: 'Help with lost access, seed phrases, and hardware wallets',
    articles: 12,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: AlertTriangle,
    title: 'Scam & Fraud',
    description: 'Report scams, understand fraud types, and prevention tips',
    articles: 18,
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: FileText,
    title: 'Cases & Claims',
    description: 'Creating cases, tracking progress, and documentation',
    articles: 15,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Lock,
    title: 'Account Security',
    description: 'Two-factor auth, passwords, and protecting your account',
    articles: 10,
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: CreditCard,
    title: 'Payments & Fees',
    description: 'Understanding our fee structure and payment methods',
    articles: 8,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Settings,
    title: 'Account Settings',
    description: 'Profile, notifications, and account management',
    articles: 11,
    color: 'bg-gray-100 text-gray-600',
  },
];

const popularArticles = [
  { title: 'How to submit a new recovery case', category: 'Getting Started', views: '15.2K' },
  { title: 'Understanding our recovery process', category: 'Cases', views: '12.8K' },
  { title: 'What documents do I need to provide?', category: 'Documentation', views: '10.5K' },
  { title: 'How long does recovery take?', category: 'Cases', views: '9.3K' },
  { title: 'Setting up two-factor authentication', category: 'Security', views: '8.7K' },
  { title: 'Common cryptocurrency scams to avoid', category: 'Security', views: '7.9K' },
];

const faqs = [
  {
    question: 'How long does the recovery process typically take?',
    answer: 'Recovery timelines vary depending on the complexity of the case. Simple wallet recovery may take 1-2 weeks, while scam recovery involving multiple parties can take 4-8 weeks. Our team will provide you with an estimated timeline after reviewing your case.',
  },
  {
    question: 'What are your fees for recovery services?',
    answer: 'We operate on a success-based fee structure. There are no upfront fees for case evaluation. Our recovery fee is typically 15-25% of the recovered amount, depending on case complexity. You only pay if we successfully recover your assets.',
  },
  {
    question: 'What information do I need to submit a case?',
    answer: 'For the best chance of recovery, provide: transaction IDs/hashes, wallet addresses involved, communication records with scammers, screenshots of transactions, police reports (if filed), and any other relevant documentation.',
  },
  {
    question: 'Is my information kept confidential?',
    answer: 'Absolutely. We employ bank-grade encryption and strict confidentiality protocols. Your data is encrypted at rest and in transit. We never share your information with third parties without your explicit consent.',
  },
  {
    question: 'What types of cryptocurrency can you recover?',
    answer: 'We support recovery for all major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), USDT, USDC, BNB, Solana, and over 100 other tokens. If your cryptocurrency isn\'t listed, contact us to check if we can assist.',
  },
  {
    question: 'Can you recover funds from a scam?',
    answer: 'Yes, scam recovery is one of our primary services. Success depends on various factors including how quickly you report it, the type of scam, and the blockchain trail. Our forensic team traces funds and works with exchanges and authorities to recover assets.',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="CryptoRecover Logo" className="h-12 w-auto object-contain" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/contact">
                <Button variant="ghost">Contact Support</Button>
              </Link>
              <Link to="/login">
                <Button>Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-600 to-brand-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl text-brand-100">
            Browse categories below or contact our support team
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <FileText className="h-4 w-4" />
              Submit a Case
            </Link>
            <Link to="/contact" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Link>
            <Link to="/status" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <Clock className="h-4 w-4" />
              Service Status
            </Link>
            <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <Key className="h-4 w-4" />
              Account Access
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`} />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 bg-gray-50">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="CryptoRecover Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
            <Link to="/about" className="hover:text-white transition">About</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CryptoRecover</p>
        </div>
      </footer>
    </div>
  );
}
