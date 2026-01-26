import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import {
  Wallet,
  FileText,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalWallets: number;
  totalBalance: number;
  activeCases: number;
  openTickets: number;
  recentActivity: {
    type: string;
    description: string;
    createdAt: string;
  }[];
}

export default function UserDashboard() {
  const { user } = useAuthStore();

  console.log('UserDashboard rendering, user:', user);

  const { data: _stats, isLoading: _isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/users/dashboard-stats');
      return response.data;
    },
  });

  const { data: wallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const response = await api.get('/wallets');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  const { data: cases } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const response = await api.get('/cases');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  const { data: tickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  // Ensure we always have arrays
  const walletsArray = Array.isArray(wallets) ? wallets : [];
  const casesArray = Array.isArray(cases) ? cases : [];
  const ticketsArray = Array.isArray(tickets) ? tickets : [];

  const statCards = [
    {
      title: 'Total Wallets',
      value: walletsArray.length || 0,
      icon: Wallet,
      color: 'text-brand',
      bgColor: 'bg-brand-100 dark:bg-brand-900/20',
      href: '/wallets',
    },
    {
      title: 'Active Cases',
      value: casesArray.filter((c: any) => c.status !== 'CLOSED' && c.status !== 'RESOLVED')?.length || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      href: '/cases',
    },
    {
      title: 'Open Tickets',
      value: ticketsArray.filter((t: any) => t.status !== 'CLOSED' && t.status !== 'RESOLVED')?.length || 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      href: '/tickets',
    },
    {
      title: 'Total Balance',
      value: formatCurrency(walletsArray.reduce((acc: number, w: any) => acc + (w.currentBalance || 0), 0) || 0),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      href: '/wallets',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here's an overview of your crypto recovery status
          </p>
        </div>
        <Link to="/cases/new">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            New Recovery Case
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Cases</CardTitle>
              <CardDescription>Your latest recovery cases</CardDescription>
            </div>
            <Link to="/cases">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {casesArray?.length > 0 ? (
              <div className="space-y-4">
                {casesArray.slice(0, 5).map((caseItem: any) => (
                  <div
                    key={caseItem.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        caseItem.status === 'RESOLVED' ? 'bg-green-100' :
                        caseItem.status === 'IN_PROGRESS' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        {caseItem.status === 'RESOLVED' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : caseItem.status === 'IN_PROGRESS' ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {caseItem.caseNumber}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {caseItem.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">No cases yet</p>
                <Link to="/cases/new">
                  <Button variant="outline" className="mt-4">
                    Create your first case
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Your recent support requests</CardDescription>
            </div>
            <Link to="/tickets">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ticketsArray?.length > 0 ? (
              <div className="space-y-4">
                {ticketsArray.slice(0, 5).map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        ticket.priority === 'URGENT' ? 'bg-red-100' :
                        ticket.priority === 'HIGH' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <MessageSquare className={`h-4 w-4 ${
                          ticket.priority === 'URGENT' ? 'text-red-600' :
                          ticket.priority === 'HIGH' ? 'text-orange-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ticket.subject}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">No tickets yet</p>
                <Link to="/tickets/new">
                  <Button variant="outline" className="mt-4">
                    Create a ticket
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wallets Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Wallets Overview</CardTitle>
            <CardDescription>Your connected cryptocurrency wallets</CardDescription>
          </div>
          <Link to="/wallets">
            <Button variant="ghost" size="sm">
              Manage wallets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {walletsArray?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {walletsArray.slice(0, 6).map((wallet: any) => (
                <div
                  key={wallet.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {wallet.blockchain}
                    </span>
                    <Wallet className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                    {wallet.address}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(wallet.currentBalance || 0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No wallets connected</p>
              <Link to="/wallets/add">
                <Button variant="outline" className="mt-4">
                  Add your first wallet
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
