import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Users,
  Award,
  Target,
  Globe,
  CheckCircle,
  TrendingUp,
  Lock,
  Heart,
  Briefcase,
} from 'lucide-react';
import logo from '@/assets/images/logo.png';

const stats = [
  { value: '2019', label: 'Founded' },
  { value: '50+', label: 'Expert Team' },
  { value: '15K+', label: 'Cases Resolved' },
  { value: '30+', label: 'Countries Served' },
];

const values = [
  {
    icon: Shield,
    title: 'Trust & Integrity',
    description: 'We operate with complete transparency and maintain the highest ethical standards in everything we do.',
  },
  {
    icon: Target,
    title: 'Results-Driven',
    description: 'Our success is measured by your success. We\'re committed to achieving the best possible outcomes for our clients.',
  },
  {
    icon: Lock,
    title: 'Security First',
    description: 'Your privacy and security are paramount. We employ enterprise-grade security measures to protect your information.',
  },
  {
    icon: Heart,
    title: 'Client-Centric',
    description: 'We understand the emotional toll of losing assets. Our team provides compassionate, personalized support throughout the recovery process.',
  },
];

const team = [
  {
    name: 'Alexander Chen',
    role: 'CEO & Founder',
    bio: 'Former blockchain security lead at a major exchange. 15+ years in cybersecurity.',
  },
  {
    name: 'Sarah Mitchell',
    role: 'Chief Recovery Officer',
    bio: 'Expert in blockchain forensics with FBI cyber division background.',
  },
  {
    name: 'Michael Torres',
    role: 'Head of Operations',
    bio: 'Former fintech executive with extensive experience in financial recovery.',
  },
  {
    name: 'Dr. Emily Patel',
    role: 'Chief Legal Officer',
    bio: 'Specializes in cryptocurrency law and international financial regulations.',
  },
];

const certifications = [
  'SOC 2 Type II Certified',
  'ISO 27001 Certified',
  'GDPR Compliant',
  'Licensed & Regulated',
  'Certified Blockchain Forensics',
  'Member of Crypto Fraud Alliance',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="CryptoRecover Logo" className="h-12 w-auto object-contain" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/help">
                <Button variant="ghost">Help Center</Button>
              </Link>
              <Link to="/contact">
                <Button variant="ghost">Contact</Button>
              </Link>
              <Link to="/login">
                <Button>Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Restoring Trust in the Digital Economy
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to help victims of cryptocurrency fraud and loss recover their digital assets through advanced blockchain forensics and expert investigation.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-brand-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-brand-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  CryptoRecover was founded in 2019 by a team of cybersecurity experts and blockchain specialists who witnessed firsthand the devastating impact of cryptocurrency fraud on individuals and businesses.
                </p>
                <p>
                  After helping friends and family recover lost assets, our founders realized there was a critical gap in the market – victims had nowhere to turn for professional, legitimate recovery services.
                </p>
                <p>
                  Today, we've grown into a global team of over 50 specialists, including former law enforcement officials, blockchain forensics experts, and legal professionals. Together, we've helped thousands of clients recover over $50 million in digital assets.
                </p>
                <p>
                  Our commitment goes beyond recovery – we're dedicated to educating the public about cryptocurrency security and working with regulators to create a safer digital economy.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                    <TrendingUp className="h-10 w-10 text-brand-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                    <Globe className="h-10 w-10 text-green-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">30+</div>
                    <div className="text-sm text-gray-500">Countries</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                    <Users className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">15K+</div>
                    <div className="text-sm text-gray-500">Happy Clients</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                    <Award className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">$50M+</div>
                    <div className="text-sm text-gray-500">Recovered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-xl text-brand-100 mb-8">
            We're always looking for talented individuals passionate about helping others and advancing blockchain security.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary">
              View Open Positions
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="CryptoRecover Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/help" className="hover:text-white transition">Help</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CryptoRecover</p>
        </div>
      </footer>
    </div>
  );
}
