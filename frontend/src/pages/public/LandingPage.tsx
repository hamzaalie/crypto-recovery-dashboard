import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
  Lock,
  Wallet,
  FileSearch,
  Headphones,
  Award,
  Globe,
  ChevronRight,
  Star,
  Menu,
  X,
} from 'lucide-react';
import logo from '@/assets/images/logo.png';

const stats = [
  { value: '$50M+', label: 'Successfully Recovered' },
  { value: '15,000+', label: 'Cases Resolved' },
  { value: '98%', label: 'Success Rate' },
  { value: '24/7', label: 'Support Available' },
];

const services = [
  {
    icon: Wallet,
    title: 'Wallet Recovery',
    description: 'Lost access to your crypto wallet? Our experts can help recover your digital assets safely and securely.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Shield,
    title: 'Scam Recovery',
    description: 'Been a victim of crypto fraud? We trace, track, and help recover funds from scammers and fraudulent schemes.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: FileSearch,
    title: 'Theft Investigation',
    description: 'Cryptocurrency stolen through hacking? Our forensic team investigates and works to recover your assets.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Lock,
    title: 'Exchange Issues',
    description: 'Facing problems with crypto exchanges? We help resolve disputes and recover locked or frozen funds.',
    color: 'bg-blue-100 text-blue-600',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Submit Your Case',
    description: 'Fill out our secure case submission form with details about your situation.',
  },
  {
    step: '02',
    title: 'Expert Review',
    description: 'Our specialists analyze your case and develop a recovery strategy.',
  },
  {
    step: '03',
    title: 'Active Recovery',
    description: 'We execute the recovery plan using advanced blockchain forensics.',
  },
  {
    step: '04',
    title: 'Funds Returned',
    description: 'Once recovered, your assets are securely returned to you.',
  },
];

const testimonials = [
  {
    name: 'Michael R.',
    role: 'Business Owner',
    content: 'After losing $120,000 in a sophisticated scam, I thought all was lost. The team recovered 95% of my funds within 3 weeks. Incredible service!',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    role: 'Investor',
    content: 'Lost access to my hardware wallet with significant Bitcoin holdings. They helped me recover everything safely. Highly professional team.',
    rating: 5,
  },
  {
    name: 'James T.',
    role: 'Trader',
    content: 'Exchange locked my account with $50,000 inside. Within 2 weeks, they resolved the issue and I got full access back. Lifesavers!',
    rating: 5,
  },
];

const trustedBy = [
  'Featured in CoinDesk',
  'Bloomberg Verified',
  'Forbes Recognized',
  'SEC Compliant',
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="CryptoRecover Logo" className="h-12 w-auto object-contain" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-brand-600 transition">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-brand-600 transition">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-brand-600 transition">Testimonials</a>
              <Link to="/contact" className="text-gray-600 hover:text-brand-600 transition">Contact</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard">
                <Button className="bg-brand-600 hover:bg-brand-700 text-white">Dashboard</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">Get Started</Button>
              </Link>
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-brand-600">Services</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-brand-600">How It Works</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-brand-600">Testimonials</a>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-brand-600">Contact</Link>
              <div className="pt-4 border-t space-y-2">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white">Dashboard</Button>
                </Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4 mr-2" />
                Trusted by 15,000+ clients worldwide
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Recover Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700"> Lost Crypto</span> Assets
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Industry-leading cryptocurrency recovery services. Our expert team uses advanced blockchain forensics to help victims of scams, theft, and lost access recover their digital assets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/contact">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                    Start Recovery
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                    Free Consultation
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  No upfront fees
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Free case review
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Confidential
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Recovery Dashboard</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Live</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Case #CR-2024-15847</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recovered</span>
                    </div>
                    <p className="text-lg font-semibold">$45,000 BTC</p>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Case #CR-2024-15923</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">In Progress</span>
                    </div>
                    <p className="text-lg font-semibold">$28,500 ETH</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-brand-500 h-2 rounded-full w-[65%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-brand-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Recovery Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive cryptocurrency recovery solutions tailored to your specific situation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-brand-200">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-4`}>
                    <service.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link to="/contact" className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium">
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process ensures fast and efficient recovery of your digital assets
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-brand-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-1/2 h-0.5 bg-brand-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Bank-Grade Security</h2>
              <p className="text-xl text-gray-300 mb-8">
                Your security is our top priority. We employ enterprise-level security measures to protect your data and recovery process.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">End-to-End Encryption</h4>
                    <p className="text-gray-400">All data is encrypted in transit and at rest using AES-256 encryption</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Two-Factor Authentication</h4>
                    <p className="text-gray-400">Mandatory 2FA for all accounts with multiple authentication options</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Verified Team</h4>
                    <p className="text-gray-400">Background-checked specialists with blockchain forensics certifications</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Globe className="h-10 w-10 mx-auto mb-4 text-brand-400" />
                <div className="text-2xl font-bold mb-1">SOC 2</div>
                <div className="text-gray-400 text-sm">Type II Certified</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Shield className="h-10 w-10 mx-auto mb-4 text-green-400" />
                <div className="text-2xl font-bold mb-1">GDPR</div>
                <div className="text-gray-400 text-sm">Compliant</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Lock className="h-10 w-10 mx-auto mb-4 text-blue-400" />
                <div className="text-2xl font-bold mb-1">ISO 27001</div>
                <div className="text-gray-400 text-sm">Certified</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Award className="h-10 w-10 mx-auto mb-4 text-yellow-400" />
                <div className="text-2xl font-bold mb-1">Licensed</div>
                <div className="text-gray-400 text-sm">Regulated Entity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thousands of satisfied clients have successfully recovered their assets with our help
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-600 font-semibold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {trustedBy.map((item, index) => (
              <div key={index} className="text-gray-400 font-semibold text-lg">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Recover Your Assets?</h2>
          <p className="text-xl text-brand-100 mb-8">
            Get a free case evaluation from our experts. No obligation, no upfront fees.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-brand-600 hover:bg-gray-100">
                Start Free Evaluation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-white text-white bg-transparent hover:bg-white hover:text-brand-600">
                <Headphones className="mr-2 h-5 w-5" />
                Speak to an Expert
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-brand-200 text-sm">
            Average response time: Under 2 hours
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src={logo} alt="CryptoRecover Logo" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-gray-400 mb-4 max-w-sm">
                Industry-leading cryptocurrency recovery services. Helping victims recover their digital assets since 2019.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link to="/contact" className="hover:text-white transition">Wallet Recovery</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Scam Recovery</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Theft Investigation</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Exchange Issues</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/help" className="hover:text-white transition">FAQs</Link></li>
                <li><Link to="/status" className="hover:text-white transition">Service Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CryptoRecover. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-400" />
                256-bit SSL Secured
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
