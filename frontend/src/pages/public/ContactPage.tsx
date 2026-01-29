import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  Globe,
  Headphones,
} from 'lucide-react';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Get a response within 2 hours',
    value: 'support@cryptorecover.com',
    action: 'mailto:support@cryptorecover.com',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon-Fri, 9am-6pm EST',
    value: '+1 (800) 123-4567',
    action: 'tel:+18001234567',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Available 24/7',
    value: 'Start a conversation',
    action: '#',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Headphones,
    title: 'Schedule a Call',
    description: 'Book a consultation',
    value: 'Free 30-min call',
    action: '#',
    color: 'bg-orange-100 text-orange-600',
  },
];

const offices = [
  {
    city: 'New York',
    address: '350 Fifth Avenue, Suite 4200',
    region: 'New York, NY 10118',
    country: 'United States',
    phone: '+1 (212) 555-0123',
  },
  {
    city: 'London',
    address: '1 Canada Square, Level 37',
    region: 'Canary Wharf',
    country: 'London E14 5AB, UK',
    phone: '+44 20 7946 0958',
  },
  {
    city: 'Singapore',
    address: '1 Raffles Place, #20-61',
    region: 'One Raffles Place',
    country: 'Singapore 048616',
    phone: '+65 6123 4567',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/contact', data);
      return response.data;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: 'Message Sent',
        description: 'We\'ll get back to you within 24 hours.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CryptoRecover</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/help">
                <Button variant="ghost">Help Center</Button>
              </Link>
              <Link to="/login">
                <Button>Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-600 to-brand-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-brand-100">
            Have questions? We're here to help. Reach out to our expert team.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4 -mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="block"
              >
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 ${method.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <method.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{method.description}</p>
                    <p className="text-brand-600 font-medium">{method.value}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you shortly</CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                      <p className="text-gray-600 mb-6">
                        Thank you for contacting us. We'll respond within 24 hours.
                      </p>
                      <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <select
                          id="category"
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="recovery">Recovery Case</option>
                          <option value="support">Technical Support</option>
                          <option value="partnership">Partnership</option>
                          <option value="media">Media Inquiry</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <textarea
                          id="message"
                          required
                          rows={5}
                          minLength={10}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg resize-none"
                          placeholder="Please describe your inquiry in detail (minimum 10 characters)..."
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-600" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500">
                      <strong>Emergency Support:</strong> 24/7 for active recovery cases
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-brand-600" />
                    Global Offices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {offices.map((office, index) => (
                    <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                      <h4 className="font-semibold text-gray-900 mb-2">{office.city}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{office.address}</p>
                        <p>{office.region}</p>
                        <p>{office.country}</p>
                        <p className="text-brand-600">{office.phone}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Interactive map would be displayed here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">CryptoRecover</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/help" className="hover:text-white transition">Help</Link>
            <Link to="/about" className="hover:text-white transition">About</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CryptoRecover</p>
        </div>
      </footer>
    </div>
  );
}
