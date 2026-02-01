import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Lock,
  Wallet,
  FileSearch,
  Headphones,
  Award,
  ChevronRight,
  ChevronLeft,
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
  const [currentSlide, setCurrentSlide] = useState(0);

  const maxSlide = services.length - 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - More Professional */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <img src={logo} alt="CryptoRecover" className="h-14 w-auto object-contain" />
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#services" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">Our Services</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">Client Reviews</a>
              <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">About Us</Link>
              <Link to="/help" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">Support</Link>
            </div>
            <div className="hidden lg:flex items-center space-x-3">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="font-medium">Sign In</Button>
              </Link>
              <Link to="/contact">
                <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-6">Get Started</Button>
              </Link>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Our Services</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700">How It Works</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Client Reviews</a>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700">About Us</Link>
              <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Support</Link>
              <div className="pt-4 border-t space-y-2">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Professional Design */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-gray-50 via-white to-brand-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white border border-brand-200 rounded-full text-sm font-medium text-brand-700 shadow-sm">
                <Award className="h-4 w-4 mr-2" />
                Trusted by 15,000+ clients worldwide
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Recover Lost Cryptocurrency & Bitcoin Assets
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Industry-leading <Link to="/about" className="text-brand-600 hover:underline font-medium">cryptocurrency recovery services</Link>. Our expert team uses advanced blockchain forensics to help victims of <Link to="/help" className="text-brand-600 hover:underline font-medium">scams, theft, and lost access</Link> recover their digital assets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="inline-block">
                  <Button size="lg" className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white text-base px-8 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all">
                    Start Your Recovery
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact" className="inline-block">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-3 h-auto font-semibold border-2">
                    Free Consultation
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">No upfront fees</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">98% success rate</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">24/7 support</span>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop" 
                  alt="Cryptocurrency Recovery" 
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">$50M+</p>
                      <p className="text-sm text-gray-600">Successfully Recovered</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 right-0 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean & Professional */}
      <section className="py-20 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-brand-600 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Slider */}
      <section id="services" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Cryptocurrency Recovery Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl">
                Expert Bitcoin, Ethereum, and digital asset recovery solutions tailored to your situation
              </p>
            </div>
            <div className="hidden lg:flex gap-3">
              <button
                onClick={prevSlide}
                className="w-14 h-14 rounded-lg border-2 border-gray-900 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="w-14 h-14 rounded-lg border-2 border-gray-900 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Desktop Slider */}
          <div className="hidden lg:block relative overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * (100 / 3 + 2)}%)` }}
            >
              {services.map((service, index) => (
                <div key={index} className="flex-shrink-0" style={{ width: 'calc(33.333% - 16px)' }}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-brand-200 bg-white h-full">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <service.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                      <Link to="/contact">
                        <button className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                          Get help
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Tablet Slider */}
          <div className="hidden md:block lg:hidden relative overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 52}%)` }}
            >
              {services.map((service, index) => (
                <div key={index} className="flex-shrink-0" style={{ width: 'calc(50% - 12px)' }}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-brand-200 bg-white h-full">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <service.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                      <Link to="/contact">
                        <button className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                          Get help
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Slider */}
          <div className="md:hidden relative overflow-hidden">
            <div 
              className="flex gap-4 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {services.map((service, index) => (
                <div key={index} className="flex-shrink-0 w-full">
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-brand-200 bg-white">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <service.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                      <Link to="/contact">
                        <button className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                          Get help
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="flex lg:hidden justify-center gap-3 mt-8">
            <button
              onClick={prevSlide}
              className="w-14 h-14 rounded-lg border-2 border-gray-900 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="w-14 h-14 rounded-lg border-2 border-gray-900 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-8 bg-gray-900' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Bitcoin Recovery Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our proven cryptocurrency recovery process ensures fast results
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-brand-300 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link to="/contact">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-6 h-auto text-base font-semibold shadow-lg">
                Start Your Recovery Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Testimonials - Professional Grid */}
      <section id="testimonials" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Crypto Recovery Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real clients who recovered stolen Bitcoin, Ethereum, and digital assets
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-brand-200 bg-white">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4 pt-6 border-t">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted & Certified</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustedBy.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Professional */}
      <section className="py-24 px-4 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Recover Your Lost Bitcoin & Crypto Assets?</h2>
          <p className="text-xl text-brand-100 mb-10 leading-relaxed">
            Get a <Link to="/contact" className="text-white underline hover:no-underline font-semibold">free cryptocurrency recovery evaluation</Link> from our experts. No obligation, no upfront fees.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/contact">
              <Button size="lg" className="w-full sm:w-auto bg-white text-brand-600 hover:bg-gray-100 px-10 py-3 h-auto text-base font-bold shadow-xl">
                Get Free Evaluation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-brand-600 px-10 py-3 h-auto text-base font-bold">
                <Headphones className="mr-2 h-5 w-5" />
                Call 24/7 Support
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-brand-200 text-sm font-medium">
            ✓ Response within 2 hours  •  ✓ No upfront fees  •  ✓ 98% success rate
          </p>
        </div>
      </section>

      {/* Footer - Professional & Clean */}
      <footer className="bg-gray-900 text-gray-300 py-20 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <img src={logo} alt="CryptoRecover Logo" className="h-14 w-auto object-contain" />
              </div>
              <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                Industry-leading <Link to="/about" className="text-brand-400 hover:text-brand-300 font-medium">cryptocurrency recovery services</Link>. Helping victims <Link to="/help" className="text-brand-400 hover:text-brand-300 font-medium">recover their digital assets</Link> since 2019.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-3">
                <li><Link to="/contact" className="hover:text-white transition text-sm">Wallet Recovery</Link></li>
                <li><Link to="/contact" className="hover:text-white transition text-sm">Scam Recovery</Link></li>
                <li><Link to="/contact" className="hover:text-white transition text-sm">Theft Investigation</Link></li>
                <li><Link to="/contact" className="hover:text-white transition text-sm">Exchange Issues</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                <li><Link to="/help" className="hover:text-white transition text-sm">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition text-sm">Contact Us</Link></li>
                <li><Link to="/help" className="hover:text-white transition text-sm">FAQs</Link></li>
                <li><Link to="/status" className="hover:text-white transition text-sm">Service Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="hover:text-white transition text-sm">About Us</Link></li>
                <li><Link to="/terms" className="hover:text-white transition text-sm">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition text-sm">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition text-sm">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} CryptoRecover. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <Lock className="h-4 w-4 text-green-500" />
                <span className="font-medium">256-bit SSL Secured</span>
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">GDPR Compliant</span>
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">SOC 2 Certified</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
