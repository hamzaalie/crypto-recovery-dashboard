import { useState, useMemo } from 'react';
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
  Loader2,
  BarChart3,
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Get period string from date range
function getPeriodFromRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) return '7d';
  if (diffDays <= 30) return '30d';
  if (diffDays <= 90) return '90d';
  return '1y';
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const period = useMemo(() => getPeriodFromRange(dateRange.startDate, dateRange.endDate), [dateRange]);

  // Fetch overview stats
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-reports-overview', period],
    queryFn: async () => {
      const response = await api.get('/admin/reports/overview', { params: { period } });
      return response.data;
    },
  });

  // Fetch cases report with trends
  const { data: casesReport, isLoading: casesLoading } = useQuery({
    queryKey: ['admin-reports-cases', period],
    queryFn: async () => {
      const response = await api.get('/admin/reports/cases', { params: { period, groupBy: 'status' } });
      return response.data;
    },
  });

  // Fetch recovery stats
  const { data: recoveryData, isLoading: recoveryLoading } = useQuery({
    queryKey: ['admin-reports-recovery', period],
    queryFn: async () => {
      const response = await api.get('/admin/reports/recovery', { params: { period } });
      return response.data;
    },
  });

  // Fetch trends
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['admin-reports-trends', period],
    queryFn: async () => {
      const response = await api.get('/admin/reports/trends', { params: { period } });
      return response.data;
    },
  });

  // Fetch users report
  const { data: usersReport } = useQuery({
    queryKey: ['admin-reports-users', period],
    queryFn: async () => {
      const response = await api.get('/admin/reports/users', { params: { period } });
      return response.data;
    },
  });

  const isLoading = overviewLoading || casesLoading || recoveryLoading || trendsLoading;

  // Transform API data for display
  const displayStats = useMemo(() => {
    const overview = overviewData?.overview || {};
    const stats = overviewData?.stats || {};
    
    // Calculate changes (compare period vs total)
    const casesChange = overview.totalCases > 0 
      ? ((overview.casesInPeriod / overview.totalCases) * 100).toFixed(1) 
      : 0;
    const recoveryChange = overview.totalRecovered > 0 
      ? ((overview.recoveredInPeriod / overview.totalRecovered) * 100).toFixed(1) 
      : 0;
    const usersChange = overview.totalUsers > 0 
      ? ((overview.usersInPeriod / overview.totalUsers) * 100).toFixed(1) 
      : 0;
    
    return {
      totalCases: overview.totalCases || stats?.cases?.total || 0,
      casesInPeriod: overview.casesInPeriod || 0,
      casesChange: parseFloat(casesChange as string) || 0,
      totalRecovered: overview.totalRecovered || recoveryData?.totalRecovered || 0,
      recoveredInPeriod: overview.recoveredInPeriod || recoveryData?.recoveredInPeriod || 0,
      recoveryChange: parseFloat(recoveryChange as string) || 0,
      totalUsers: overview.totalUsers || stats?.users?.total || 0,
      usersInPeriod: overview.usersInPeriod || 0,
      usersChange: parseFloat(usersChange as string) || 0,
      successRate: recoveryData?.successRate || 0,
      avgResolutionTime: 0, // Would need additional tracking
      resolutionChange: 0,
    };
  }, [overviewData, recoveryData]);

  // Transform trend data for charts
  const displayTrend = useMemo(() => {
    if (!trendsData?.trends?.cases) return [];
    
    const caseTrends = trendsData.trends.cases || [];
    
    // Merge trends by date
    const trendMap = new Map<string, any>();
    
    caseTrends.forEach((item: any) => {
      const date = new Date(item.date);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap.set(key, {
        date: key,
        newCases: parseInt(item.count) || 0,
        resolved: 0,
        recovered: 0,
      });
    });

    return Array.from(trendMap.values()).slice(-10);
  }, [trendsData]);

  // Cases by status for pie chart
  const casesByStatus = useMemo(() => {
    if (!casesReport?.byStatus) return [];
    return casesReport.byStatus.map((item: any) => ({
      name: item.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
      value: parseInt(item.count) || 0,
    }));
  }, [casesReport]);

  // Cases by type for pie chart
  const casesByType = useMemo(() => {
    if (!casesReport?.byType) return [];
    return casesReport.byType.map((item: any) => ({
      name: item.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
      value: parseInt(item.count) || 0,
    }));
  }, [casesReport]);

  // Recovery by type
  const recoveryByType = useMemo(() => {
    if (!recoveryData?.byType) return [];
    return recoveryData.byType.map((item: any) => ({
      name: item.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
      value: parseFloat(item.amount) || 0,
      count: parseInt(item.count) || 0,
    }));
  }, [recoveryData]);

  // Users by role
  const usersByRole = useMemo(() => {
    if (!usersReport?.byRole) return [];
    return usersReport.byRole.map((item: any) => ({
      name: item.role?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
      value: parseInt(item.count) || 0,
    }));
  }, [usersReport]);

  const exportReport = () => {
    const data = displayTrend.length > 0 ? displayTrend : [{ date: 'No data', newCases: 0, resolved: 0, recovered: 0 }];
    
    const csv = [
      'Date,New Cases,Resolved Cases,Recovered Amount',
      ...data.map((item: any) => `${item.date},${item.newCases},${item.resolved},${item.recovered}`),
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Total Cases</p>
                <p className="text-lg sm:text-2xl font-bold">{displayStats.totalCases}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg shrink-0">
                <FolderOpen className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center flex-wrap">
              {displayStats.casesChange >= 0 ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 text-xs sm:text-sm',
                  displayStats.casesChange >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {Math.abs(displayStats.casesChange)}%
              </span>
              <span className="ml-1 text-xs sm:text-sm text-gray-500 hidden sm:inline">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Recovered</p>
                <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(displayStats.totalRecovered)}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg shrink-0">
                <Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center flex-wrap">
              {displayStats.recoveryChange >= 0 ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 text-xs sm:text-sm',
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
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
                <p className="text-lg sm:text-2xl font-bold">{displayStats.totalUsers}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg shrink-0">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center flex-wrap">
              {displayStats.usersChange >= 0 ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'ml-1 text-xs sm:text-sm',
                  displayStats.usersChange >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {Math.abs(displayStats.usersChange)}%
              </span>
              <span className="ml-1 text-xs sm:text-sm text-gray-500 hidden sm:inline">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Avg Resolution</p>
                <p className="text-lg sm:text-2xl font-bold">{displayStats.avgResolutionTime}d</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg shrink-0">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center flex-wrap">
              <span className="text-xs sm:text-sm text-gray-500">
                {displayStats.successRate}% success rate
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <span className="ml-2 text-gray-500">Loading reports...</span>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cases Trend</CardTitle>
            <CardDescription>New cases over time</CardDescription>
          </CardHeader>
          <CardContent>
            {displayTrend.length > 0 ? (
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
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No trend data available</p>
                  <p className="text-sm text-gray-400">Cases will appear here once created</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recovery by Type</CardTitle>
            <CardDescription>Total recovered funds by case type</CardDescription>
          </CardHeader>
          <CardContent>
            {recoveryByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recoveryByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#10B981" name="Recovered Amount" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recovery data yet</p>
                  <p className="text-sm text-gray-400">Recovery stats will show once cases are resolved</p>
                </div>
              </div>
            )}
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
            {casesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={casesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {casesByStatus.map((_entry: { name: string; value: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FolderOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No cases data</p>
                  <p className="text-sm text-gray-400">Status distribution will show once cases exist</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of cases by fraud type</CardDescription>
          </CardHeader>
          <CardContent>
            {casesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={casesByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884D8" name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FolderOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No cases by type</p>
                  <p className="text-sm text-gray-400">Type distribution will show once cases exist</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of users by role</CardDescription>
          </CardHeader>
          <CardContent>
            {usersByRole.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usersByRole.map((_entry: { name: string; value: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No user data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Security Overview</CardTitle>
            <CardDescription>2FA adoption and security stats</CardDescription>
          </CardHeader>
          <CardContent>
            {usersReport?.security ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">2FA Adoption Rate</span>
                    <span className="text-sm font-bold text-green-600">{usersReport.security.adoptionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${usersReport.security.adoptionRate}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">2FA Enabled</p>
                    <p className="text-2xl font-bold text-green-600">{usersReport.security.twoFactorEnabled}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">2FA Disabled</p>
                    <p className="text-2xl font-bold text-red-600">{usersReport.security.twoFactorDisabled}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No security data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
