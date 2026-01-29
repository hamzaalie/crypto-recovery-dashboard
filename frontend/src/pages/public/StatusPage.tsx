import { Link } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, Clock, RefreshCw, Server, Database, Globe, Lock } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  icon: React.ReactNode;
  description: string;
  uptime: string;
}

const services: ServiceStatus[] = [
  {
    name: 'Web Application',
    status: 'operational',
    icon: <Globe className="h-5 w-5" />,
    description: 'Main web application and dashboard',
    uptime: '99.98%',
  },
  {
    name: 'API Services',
    status: 'operational',
    icon: <Server className="h-5 w-5" />,
    description: 'Backend API and authentication',
    uptime: '99.95%',
  },
  {
    name: 'Database',
    status: 'operational',
    icon: <Database className="h-5 w-5" />,
    description: 'Primary database cluster',
    uptime: '99.99%',
  },
  {
    name: 'File Storage',
    status: 'operational',
    icon: <Server className="h-5 w-5" />,
    description: 'Document and file storage',
    uptime: '99.97%',
  },
  {
    name: 'Email Services',
    status: 'operational',
    icon: <Server className="h-5 w-5" />,
    description: 'Email notifications and alerts',
    uptime: '99.90%',
  },
  {
    name: 'Security Services',
    status: 'operational',
    icon: <Lock className="h-5 w-5" />,
    description: 'Authentication and encryption',
    uptime: '99.99%',
  },
];

const incidents = [
  {
    date: 'January 10, 2026',
    title: 'Scheduled Maintenance Completed',
    status: 'resolved',
    description: 'Database optimization and security updates were successfully applied during the scheduled maintenance window.',
    updates: [
      { time: '06:00 UTC', text: 'Maintenance completed. All systems operational.' },
      { time: '04:00 UTC', text: 'Maintenance in progress. Some services may be temporarily unavailable.' },
      { time: '03:45 UTC', text: 'Starting scheduled maintenance window.' },
    ],
  },
  {
    date: 'January 5, 2026',
    title: 'API Latency Increase',
    status: 'resolved',
    description: 'Some users experienced increased API response times due to high traffic.',
    updates: [
      { time: '15:30 UTC', text: 'Issue resolved. API response times back to normal.' },
      { time: '14:45 UTC', text: 'Scaling additional servers to handle load.' },
      { time: '14:00 UTC', text: 'Investigating reports of slow API responses.' },
    ],
  },
];

const StatusBadge = ({ status }: { status: ServiceStatus['status'] }) => {
  const config = {
    operational: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Operational' },
    degraded: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle, label: 'Degraded' },
    outage: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle, label: 'Outage' },
    maintenance: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Maintenance' },
  };
  
  const { bg, text, icon: Icon, label } = config[status];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
};

export default function StatusPage() {
  const allOperational = services.every(s => s.status === 'operational');
  
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
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Overall Status */}
        <div className={`p-6 rounded-lg mb-8 ${allOperational ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-4">
            {allOperational ? (
              <CheckCircle className="h-10 w-10 text-green-600" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-yellow-600" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {allOperational ? 'All Systems Operational' : 'Some Systems Affected'}
              </h1>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
            <button className="ml-auto p-2 hover:bg-white/50 rounded-lg transition">
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Service Status */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h2>
          <div className="bg-white rounded-lg border divide-y">
            {services.map((service) => (
              <div key={service.name} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 hidden sm:block">
                    {service.uptime} uptime
                  </span>
                  <StatusBadge status={service.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Uptime Statistics */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">90-Day Uptime</h2>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-green-600">99.97%</span>
              <span className="text-gray-500">Overall Platform Uptime</span>
            </div>
            <div className="h-8 flex gap-0.5 rounded overflow-hidden">
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 ${i === 45 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  title={`Day ${90 - i}: ${i === 45 ? 'Degraded Performance' : 'Operational'}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded" />
                <span className="text-gray-600">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded" />
                <span className="text-gray-600">Degraded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded" />
                <span className="text-gray-600">Outage</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Incidents</h2>
          <div className="space-y-4">
            {incidents.map((incident, idx) => (
              <div key={idx} className="bg-white rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm text-gray-500">{incident.date}</span>
                    <h3 className="text-lg font-medium text-gray-900">{incident.title}</h3>
                    <p className="text-gray-600 mt-1">{incident.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    Resolved
                  </span>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Updates</h4>
                  <div className="space-y-3">
                    {incident.updates.map((update, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-gray-500 whitespace-nowrap">{update.time}</span>
                        <span className="text-gray-700">{update.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scheduled Maintenance */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduled Maintenance</h2>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 text-gray-500">
              <Clock className="h-5 w-5" />
              <p>No scheduled maintenance at this time.</p>
            </div>
          </div>
        </section>

        {/* Subscribe */}
        <section className="bg-brand-50 rounded-lg p-6 border border-brand-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stay Updated</h2>
          <p className="text-gray-600 mb-4">
            Subscribe to receive notifications about service disruptions and maintenance windows.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">
              Subscribe
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-12">
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
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CryptoRecover</p>
        </div>
      </footer>
    </div>
  );
}
