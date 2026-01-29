import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { useAuthStore } from '@/stores/auth.store';

// Public pages
import LandingPage from '@/pages/public/LandingPage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';
import HelpPage from '@/pages/public/HelpPage';
import TermsPage from '@/pages/public/TermsPage';
import PrivacyPage from '@/pages/public/PrivacyPage';
import CookiesPage from '@/pages/public/CookiesPage';
import StatusPage from '@/pages/public/StatusPage';
import NotFoundPage from '@/pages/public/NotFoundPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import TwoFactorPage from '@/pages/auth/TwoFactorPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import VerifyEmailPendingPage from '@/pages/auth/VerifyEmailPendingPage';
import CompleteSignupPage from '@/pages/auth/CompleteSignupPage';

// User Dashboard
import UserDashboard from '@/pages/user/DashboardPage';
import UserWallets from '@/pages/user/WalletsPage';
import UserCases from '@/pages/user/CasesPage';
import UserCaseDetail from '@/pages/user/CaseDetailPage';
import UserTickets from '@/pages/user/TicketsPage';
import UserNewTicket from '@/pages/user/NewTicketPage';
import UserTicketDetail from '@/pages/user/TicketDetailPage';
import UserProfile from '@/pages/user/ProfilePage';

// Admin Dashboard
import AdminDashboard from '@/pages/admin/DashboardPage';
import AdminUsers from '@/pages/admin/UsersPage';
import AdminCases from '@/pages/admin/CasesPage';
import AdminTickets from '@/pages/admin/TicketsPage';
import AdminWallets from '@/pages/admin/WalletsPage';
import AdminAuditLogs from '@/pages/admin/AuditLogsPage';
import AdminEmailTemplates from '@/pages/admin/EmailTemplatesPage';
import AdminSettings from '@/pages/admin/SettingsPage';
import AdminReports from '@/pages/admin/ReportsPage';

// Agent Dashboard
import AgentDashboard from '@/pages/agent/DashboardPage';
import AgentCases from '@/pages/agent/CasesPage';
import AgentTickets from '@/pages/agent/TicketsPage';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // If logged in and on root, redirect to dashboard
  const getDefaultDashboard = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'support_agent':
        return '/agent';
      default:
        return '/dashboard';
    }
  };

  return (
    <>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/status" element={<StatusPage />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/2fa" element={<TwoFactorPage />} />
          <Route path="/complete-signup" element={<CompleteSignupPage />} />
        </Route>

        {/* Email verification routes */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />

        {/* User Dashboard Routes - Simplified */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
        </Route>
        
        <Route
          path="/wallets"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserWallets />} />
        </Route>

        <Route
          path="/cases/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserCases />} />
          <Route path=":id" element={<UserCaseDetail />} />
        </Route>

        <Route
          path="/tickets/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserTickets />} />
          <Route path="new" element={<UserNewTicket />} />
          <Route path=":id" element={<UserTicketDetail />} />
        </Route>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="cases" element={<AdminCases />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="wallets" element={<AdminWallets />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="email-templates" element={<AdminEmailTemplates />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Agent Routes */}
        <Route
          path="/agent/*"
          element={
            <ProtectedRoute allowedRoles={['support_agent', 'admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AgentDashboard />} />
          <Route path="cases" element={<AgentCases />} />
          <Route path="cases/:id" element={<UserCaseDetail />} />
          <Route path="tickets" element={<AgentTickets />} />
          <Route path="tickets/:id" element={<UserTicketDetail />} />
        </Route>

        {/* Redirects */}
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultDashboard()} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
      <CookieBanner />
    </>
  );
}

export default App;
