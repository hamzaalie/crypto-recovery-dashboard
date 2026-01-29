import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { NotificationCenter } from '@/components/ui/notification-center';
import { LayoutDashboard, Wallet, FileText, MessageSquare, Users, Settings, LogOut, BarChart3, Mail, ClipboardList, User, Menu, X } from 'lucide-react';
import logo from '@/assets/images/logo.png';

const userNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Wallets', href: '/wallets', icon: Wallet },
  { label: 'Cases', href: '/cases', icon: FileText },
  { label: 'Tickets', href: '/tickets', icon: MessageSquare },
  { label: 'Profile', href: '/profile', icon: User },
];

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Cases', href: '/admin/cases', icon: FileText },
  { label: 'Tickets', href: '/admin/tickets', icon: MessageSquare },
  { label: 'Wallets', href: '/admin/wallets', icon: Wallet },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
  { label: 'Email Templates', href: '/admin/email-templates', icon: Mail },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const agentNavItems = [
  { label: 'Dashboard', href: '/agent', icon: LayoutDashboard },
  { label: 'Cases', href: '/agent/cases', icon: FileText },
  { label: 'Tickets', href: '/agent/tickets', icon: MessageSquare },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = user?.role === 'admin' ? adminNavItems : user?.role === 'support_agent' ? agentNavItems : userNavItems;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-xl
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-12 w-auto object-contain drop-shadow-lg" />
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-700/50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.href} 
              to={item.href} 
              end 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/50">
          <div className="mb-3 px-2">
            <div className="font-semibold truncate text-white">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/90 hover:bg-red-500 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center lg:hidden">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </div>
          
          <div className="flex-1" />
          
          {/* Notification Center */}
          <NotificationCenter />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
