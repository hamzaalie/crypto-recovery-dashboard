import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { LiveMarketWidget } from '@/components/LiveMarketWidget';
import { useWalletWithLivePrices } from '@/hooks/use-coingecko';
import {
  Wallet,
  FileText,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Activity,
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuthStore();

  console.log('UserDashboard rendering, user:', user);

  // Dashboard stats endpoint - currently returns 403, using direct queries instead
  // const { data: _stats, isLoading: _isLoading } = useQuery<DashboardStats>({
  //   queryKey: ['dashboard-stats'],
  //   queryFn: async () => {
  //     const response = await api.get('/users/dashboard-stats');
  //     return response.data;
  //   },
  // });

  const { data: wallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const response = await api.get('/wallets');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  // Use CoinGecko live prices for wallets
  const { totalValue: liveTotalValue, wallets: walletsWithPrices } = useWalletWithLivePrices(wallets);

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

  // Calculate total 24h change across portfolio
  const totalChange24h = walletsWithPrices?.reduce((sum, w) => {
    const change = (w.liveUsdValue * w.priceChange24h) / 100;
    return sum + change;
  }, 0) || 0;
  const percentChange24h = liveTotalValue > 0 ? (totalChange24h / liveTotalValue) * 100 : 0;

  const statCards = [
    {
      title: 'Total Wallets',
      value: walletsArray.length || 0,
      icon: Wallet,
      color: 'text-brand-500',
      bgColor: 'bg-gradient-to-br from-brand-100 to-brand-200',
      href: '/wallets',
    },
    {
      title: 'Active Cases',
      value: casesArray.filter((c: any) => c.status !== 'CLOSED' && c.status !== 'RESOLVED')?.length || 0,
      icon: Shield,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      href: '/cases',
    },
    {
      title: 'Open Tickets',
      value: ticketsArray.filter((t: any) => t.status !== 'CLOSED' && t.status !== 'RESOLVED')?.length || 0,
      icon: MessageSquare,
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-br from-violet-100 to-violet-200',
      href: '/tickets',
    },
    {
      title: 'Recovery Rate',
      value: casesArray.length > 0 
        ? `${Math.round((casesArray.filter((c: any) => c.status === 'RESOLVED').length / casesArray.length) * 100)}%` 
        : 'N/A',
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-100 to-amber-200',
      href: '/cases',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Portfolio Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-brand-400" />
                <span className="text-sm text-gray-400">Portfolio Value (Live)</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {formatCurrency(liveTotalValue || 0)}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {percentChange24h >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span className={percentChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {percentChange24h >= 0 ? '+' : ''}{percentChange24h.toFixed(2)}%
                </span>
                <span className="text-gray-500 text-sm">24h</span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1">
              <p className="text-sm text-gray-400">Welcome back,</p>
              <p className="text-xl font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{walletsArray.length} assets tracked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full border-0 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.title}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} shrink-0`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
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
                <p className="text-sm text-gray-400">Cases will appear here once assigned by admin</p>
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

      {/* Live Crypto Market */}
      <LiveMarketWidget compact={false} showGlobalStats={true} />
    </div>
  );
}
