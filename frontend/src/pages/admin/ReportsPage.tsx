import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  FolderOpen,
  Wallet,
  Calendar,
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: stats, isLoading: _statsLoading } = useQuery({
    queryKey: ['admin-reports-stats', dateRange],
    queryFn: async () => {
      const response = await api.get('/admin/reports/overview', { params: { period: '30d' } });
      return response.data;
    },
  });

  const { data: casesTrend, isLoading: _trendLoading } = useQuery({
    queryKey: ['admin-reports-cases-trend', dateRange],
    queryFn: async () => {
      const response = await api.get('/admin/reports/cases', { params: { period: '30d', groupBy: 'status' } });
      return response.data;
    },
  });

  const { data: agentPerformance, isLoading: _agentLoading } = useQuery({
    queryKey: ['admin-reports-agent-performance', dateRange],
    queryFn: async () => {
      const response = await api.get('/admin/reports/users', { params: { period: '30d' } });
      return response.data;
    },
  });

  useQuery({
    queryKey: ['admin-reports-recovery', dateRange],
    queryFn: async () => {
      const response = await api.get('/admin/reports/recovery', { params: { period: '30d' } });
      return response.data;
    },
  });

  // Mock data for demo
  const mockStats = {
    totalCases: 245,
    casesChange: 12.5,
    totalRecovered: 1250000,
    recoveryChange: 8.3,
    totalUsers: 1567,
    usersChange: 15.2,
    avgResolutionTime: 4.2,
    resolutionChange: -10.5,
  };

  const mockTrend = [
    { date: 'Jan', newCases: 45, resolved: 38, recovered: 125000 },
    { date: 'Feb', newCases: 52, resolved: 48, recovered: 185000 },
    { date: 'Mar', newCases: 61, resolved: 55, recovered: 220000 },
    { date: 'Apr', newCases: 48, resolved: 52, recovered: 175000 },
    { date: 'May', newCases: 55, resolved: 49, recovered: 198000 },
    { date: 'Jun', newCases: 67, resolved: 62, recovered: 280000 },
  ];

  const mockAgentPerformance = [
    { name: 'John Smith', casesHandled: 45, avgTime: 3.2, satisfaction: 4.8 },
    { name: 'Sarah Wilson', casesHandled: 52, avgTime: 2.8, satisfaction: 4.9 },
    { name: 'Mike Johnson', casesHandled: 38, avgTime: 3.5, satisfaction: 4.6 },
    { name: 'Emily Brown', casesHandled: 41, avgTime: 3.1, satisfaction: 4.7 },
  ];

  const mockCasesByStatus = [
    { name: 'Pending', value: 35 },
    { name: 'In Progress', value: 45 },
    { name: 'Under Review', value: 25 },
    { name: 'Resolved', value: 80 },
    { name: 'Closed', value: 60 },
  ];

  const mockCasesByType = [
    { name: 'Phishing', value: 45 },
    { name: 'Exchange Hack', value: 35 },
    { name: 'Lost Keys', value: 25 },
    { name: 'Scam', value: 55 },
    { name: 'Other', value: 15 },
  ];

  const displayStats = stats || mockStats;
  const displayTrend = Array.isArray(casesTrend) ? casesTrend : mockTrend;
  const displayAgentPerformance = Array.isArray(agentPerformance) ? agentPerformance : mockAgentPerformance;

  const exportReport = () => {
    // Generate CSV export
    const data = displayTrend.map((item: any) => ({
      Date: item.date,
      'New Cases': item.newCases,
      'Resolved Cases': item.resolved,
      'Recovered Amount': item.recovered,
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row: any) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${dateRange.startDate}-${dateRange.endDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Comprehensive platform analytics</p>
        </div>
        <Button onClick={exportReport} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDateRange({
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                  })
                }
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDateRange({
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                  })
                }
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDateRange({
                    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                  })
                }
              >
                Last 90 Days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cases</p>
                <p className="text-2xl font-bold">{displayStats.totalCases}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              {displayStats.casesChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 text-sm',
                  displayStats.casesChange >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {Math.abs(displayStats.casesChange)}%
              </span>
              <span className="ml-1 text-sm text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Recovered</p>
                <p className="text-2xl font-bold">{formatCurrency(displayStats.totalRecovered)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              {displayStats.recoveryChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 text-sm',
                  displayStats.recoveryChange >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {Math.abs(displayStats.recoveryChange)}%
              </span>
              <span className="ml-1 text-sm text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{displayStats.totalUsers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              {displayStats.usersChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 text-sm',
                  displayStats.usersChange >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {Math.abs(displayStats.usersChange)}%
              </span>
              <span className="ml-1 text-sm text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Resolution Time</p>
                <p className="text-2xl font-bold">{displayStats.avgResolutionTime} days</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              {displayStats.resolutionChange <= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 text-sm',
                  displayStats.resolutionChange <= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {Math.abs(displayStats.resolutionChange)}%
              </span>
              <span className="ml-1 text-sm text-gray-500">faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cases Trend</CardTitle>
            <CardDescription>New vs Resolved cases over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={displayTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="newCases"
                  stackId="1"
                  stroke="#0088FE"
                  fill="#0088FE"
                  name="New Cases"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="2"
                  stroke="#00C49F"
                  fill="#00C49F"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recovery Amount Trend</CardTitle>
            <CardDescription>Total recovered funds over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="recovered"
                  stroke="#8884D8"
                  strokeWidth={2}
                  name="Recovered Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
            <CardDescription>Distribution of cases by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCasesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockCasesByStatus.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of cases by fraud type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockCasesByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884D8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>Performance metrics for support agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cases Handled
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Resolution Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satisfaction Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayAgentPerformance.map((agent: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                          {agent.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </div>
                        <span className="ml-3 font-medium">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{agent.casesHandled}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{agent.avgTime} days</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{agent.satisfaction}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(agent.casesHandled / 60) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
