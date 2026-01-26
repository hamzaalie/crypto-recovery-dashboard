import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
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

  // Mock chart data - in production this would come from API
  const casesTrendData = [
    { name: 'Jan', cases: 12, resolved: 8 },
    { name: 'Feb', cases: 19, resolved: 14 },
    { name: 'Mar', cases: 15, resolved: 12 },
    { name: 'Apr', cases: 22, resolved: 18 },
    { name: 'May', cases: 28, resolved: 22 },
    { name: 'Jun', cases: 25, resolved: 20 },
  ];

  const casesByType = [
    { name: 'Scam Recovery', value: 35 },
    { name: 'Lost Access', value: 25 },
    { name: 'Hack Recovery', value: 20 },
    { name: 'Exchange Issue', value: 12 },
    { name: 'Other', value: 8 },
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.newUsersThisMonth || 0,
      changeLabel: 'this month',
      icon: Users,
      color: 'text-brand',
      bgColor: 'bg-brand-100 dark:bg-brand-900/20',
      href: '/admin/users',
    },
    {
      title: 'Active Cases',
      value: stats?.activeCases || 0,
      total: stats?.totalCases || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      href: '/admin/cases',
    },
    {
      title: 'Open Tickets',
      value: stats?.openTickets || 0,
      total: stats?.totalTickets || 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      href: '/admin/tickets',
    },
    {
      title: 'Total Recovered',
      value: formatCurrency(stats?.totalRecovered || 0),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      href: '/admin/reports',
    },
  ];

  return (
    <div className="space-y-6">
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
              <Activity className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </Link>
        </div>
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
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
            <CardDescription>Monthly case volume and resolution</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Cases by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of recovery case types</CardDescription>
          </CardHeader>
          <CardContent>
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
                  {casesByType.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
    </div>
  );
}
