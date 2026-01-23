import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, cn } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  Download,
  Loader2,
  User,
  Settings,
  Shield,
  FileText,
  Calendar,
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: any;
  ipAddress: string;
  userAgent: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
};

const entityIcons: Record<string, React.ElementType> = {
  USER: User,
  CASE: FileText,
  TICKET: FileText,
  SETTINGS: Settings,
  AUTH: Shield,
};

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['audit-logs', searchQuery, actionFilter, entityFilter, dateFrom, dateTo, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entityType', entityFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      params.append('page', String(page));
      params.append('limit', '50');
      const response = await api.get(`/admin/audit-logs?${params.toString()}`);
      return response.data;
    },
  });

  const logs = logsData?.data || [];

  const exportLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs/export', {
        responseType: 'blob',
        params: {
          search: searchQuery,
          action: actionFilter,
          entityType: entityFilter,
          dateFrom,
          dateTo,
        },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-500 dark:text-gray-400">Track all system activities</p>
        </div>
        <Button variant="outline" onClick={exportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">Total Logs</p>
            <p className="text-2xl font-bold">{logsData?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">Today</p>
            <p className="text-2xl font-bold">
              {logs.filter((l: AuditLog) => {
                const today = new Date().toDateString();
                return new Date(l.createdAt).toDateString() === today;
              }).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">User Actions</p>
            <p className="text-2xl font-bold">
              {logs.filter((l: AuditLog) => l.entityType === 'USER').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500">Security Events</p>
            <p className="text-2xl font-bold">
              {logs.filter((l: AuditLog) => l.entityType === 'AUTH' || l.action === 'LOGIN').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
            <select
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="USER">User</option>
              <option value="CASE">Case</option>
              <option value="TICKET">Ticket</option>
              <option value="WALLET">Wallet</option>
              <option value="AUTH">Auth</option>
            </select>
            <Input
              type="date"
              placeholder="From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              placeholder="To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log: AuditLog) => {
                    const Icon = entityIcons[log.entityType] || ClipboardList;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(log.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {log.user ? (
                            <div>
                              <p className="font-medium">{log.user.firstName} {log.user.lastName}</p>
                              <p className="text-sm text-gray-500">{log.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', actionColors[log.action] || 'bg-gray-100')}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{log.entityType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {log.entityId && `ID: ${log.entityId}`}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                          {log.ipAddress || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {logsData?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {logs.length} of {logsData.total} logs
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === logsData.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
