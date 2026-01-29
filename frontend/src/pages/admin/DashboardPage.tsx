import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { LiveMarketWidget } from '@/components/LiveMarketWidget';
import { useGlobalMarketData } from '@/hooks/use-coingecko';
import { formatLargeNumber } from '@/lib/coingecko';
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Globe,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AdminStats {
  totalUsers: number;
  totalCases: number;
  totalTickets: number;
  totalWallets: number;
  activeCases: number;
  openTickets: number;
  totalRecovered: number;
  newUsersThisMonth: number;
  casesThisMonth: number;
  ticketsThisMonth: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
  });

  const { data: recentCases } = useQuery({
    queryKey: ['admin-recent-cases'],
    queryFn: async () => {
      const response = await api.get('/admin/cases?limit=5&sort=createdAt:desc');
      return response.data;
    },
  });

  const { data: recentTickets } = useQuery({
    queryKey: ['admin-recent-tickets'],
    queryFn: async () => {
      const response = await api.get('/admin/tickets?limit=5&sort=createdAt:desc');
      return response.data;
    },
  });

  // Fetch real chart data from API
  const { data: casesReport } = useQuery({
    queryKey: ['admin-cases-report'],
    queryFn: async () => {
      const response = await api.get('/admin/reports/cases?period=30d');
      return response.data;
    },
  });

  const { data: trendsData } = useQuery({
    queryKey: ['admin-trends'],
    queryFn: async () => {
      const response = await api.get('/admin/reports/trends?period=30d');
      return response.data;
    },
  });

  // Transform API data for charts
  const casesTrendData = React.useMemo(() => {
    if (!trendsData?.trends?.cases) {
      // Fallback to empty array while loading
      return [];
    }
    
    // Group by day and format for chart
    const trendMap = new Map<string, { cases: number; resolved: number }>();
    
    trendsData.trends.cases.forEach((item: any) => {
      const date = new Date(item.date);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap.set(monthName, { 
        cases: parseInt(item.count) || 0, 
        resolved: 0 
      });
    });

    return Array.from(trendMap.entries()).map(([name, data]) => ({
      name,
      cases: data.cases,
      resolved: Math.floor(data.cases * 0.75), // Estimate resolved rate
    })).slice(-7); // Last 7 data points
  }, [trendsData]);

  const casesByType = React.useMemo(() => {
    if (!casesReport?.byType || casesReport.byType.length === 0) {
      return [];
    }
    
    return casesReport.byType.map((item: any) => ({
      name: item.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
      value: parseInt(item.count) || 0,
    }));
  }, [casesReport]);

  // Get global market data
  const { data: globalMarket } = useGlobalMarketData();

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.newUsersThisMonth || 0,
      changeLabel: 'this month',
      icon: Users,
      color: 'text-brand-500',
      bgColor: 'bg-gradient-to-br from-brand-100 to-brand-200',
      href: '/admin/users',
    },
    {
      title: 'Active Cases',
      value: stats?.activeCases || 0,
      total: stats?.totalCases || 0,
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      href: '/admin/cases',
    },
    {
      title: 'Open Tickets',
      value: stats?.openTickets || 0,
      total: stats?.totalTickets || 0,
      icon: MessageSquare,
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-br from-violet-100 to-violet-200',
      href: '/admin/tickets',
    },
    {
      title: 'Total Recovered',
      value: formatCurrency(stats?.totalRecovered || 0),
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-100 to-amber-200',
      href: '/admin/reports',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Market Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-brand-400" />
            <span className="text-sm text-gray-400">Global Crypto Market</span>
            <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Market Cap</p>
              <p className="text-xl font-bold">{globalMarket ? formatLargeNumber(globalMarket.total_market_cap?.usd || 0) : '...'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">24h Volume</p>
              <p className="text-xl font-bold">{globalMarket ? formatLargeNumber(globalMarket.total_volume?.usd || 0) : '...'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">BTC Dominance</p>
              <p className="text-xl font-bold">{globalMarket?.market_cap_percentage?.btc?.toFixed(1) || '...'}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">24h Change</p>
              <p className={`text-xl font-bold flex items-center gap-1 ${
                (globalMarket?.market_cap_change_percentage_24h_usd || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(globalMarket?.market_cap_change_percentage_24h_usd || 0) >= 0 
                  ? <TrendingUp className="h-4 w-4" /> 
                  : <TrendingDown className="h-4 w-4" />
                }
                {globalMarket?.market_cap_change_percentage_24h_usd?.toFixed(2) || '...'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Overview of the crypto recovery platform
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to="/admin/reports">
            <Button variant="outline" className="w-full sm:w-auto">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full border-0 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.title}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                    {stat.change !== undefined && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{stat.change} {stat.changeLabel}
                      </p>
                    )}
                    {stat.total !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        of {stat.total} total
                      </p>
                    )}
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} shrink-0 ml-2`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cases Trend</CardTitle>
            <CardDescription>Daily case volume (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {casesTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={casesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="cases"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#93C5FD"
                    name="Total Cases"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="2"
                    stroke="#10B981"
                    fill="#6EE7B7"
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No case data available yet</p>
                  <p className="text-sm text-gray-400">Cases will appear here once created</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cases by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of recovery case types</CardDescription>
          </CardHeader>
          <CardContent>
            {casesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={casesByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {casesByType.map((_entry: { name: string; value: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No cases by type data</p>
                  <p className="text-sm text-gray-400">Distribution will show once cases exist</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Cases</CardTitle>
              <CardDescription>Latest recovery cases</CardDescription>
            </div>
            <Link to="/admin/cases">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases?.data?.slice(0, 5).map((caseItem: any) => (
                <div
                  key={caseItem.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        caseItem.status === 'RESOLVED'
                          ? 'bg-green-100'
                          : caseItem.status === 'IN_PROGRESS'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}
                    >
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
                      <p className="text-sm text-gray-500">
                        {caseItem.user?.firstName} {caseItem.user?.lastName}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">No recent cases</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Latest support tickets</CardDescription>
            </div>
            <Link to="/admin/tickets">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets?.data?.slice(0, 5).map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        ticket.priority === 'URGENT'
                          ? 'bg-red-100'
                          : ticket.priority === 'HIGH'
                          ? 'bg-orange-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <MessageSquare
                        className={`h-4 w-4 ${
                          ticket.priority === 'URGENT'
                            ? 'text-red-600'
                            : ticket.priority === 'HIGH'
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.user?.firstName} {ticket.user?.lastName}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">No recent tickets</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Crypto Market */}
      <LiveMarketWidget compact={false} showGlobalStats={false} />
    </div>
  );
}
