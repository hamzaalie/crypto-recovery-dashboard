import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { LayoutDashboard, Wallet, FileText, MessageSquare, Users, Settings, LogOut, BarChart3, Mail, ClipboardList, User } from 'lucide-react';
import logoSmall from '@/assets/images/logo-small.png';

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
  const navItems = user?.role === 'admin' ? adminNavItems : user?.role === 'support_agent' ? agentNavItems : userNavItems;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f0f0' }}>
      <div style={{ width: 250, background: '#1e293b', color: 'white', padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logoSmall} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          Crypto Recovery
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink key={item.href} to={item.href} end style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 4, borderRadius: 8, textDecoration: 'none', color: 'white', background: isActive ? '#007ac2' : 'transparent' })}>
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 500 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{user?.email}</div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', padding: '10px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 60, background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px' }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>Role: <strong style={{ color: '#111827' }}>{user?.role}</strong></span>
        </div>
        <div style={{ flex: 1, padding: 24, background: '#f9fafb' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
