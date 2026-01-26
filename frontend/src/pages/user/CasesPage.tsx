import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react';

interface Case {
  id: string;
  caseNumber: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  estimatedRecoveryAmount: number;
  actualRecoveryAmount: number;
  assignedAgent?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusIcons: Record<string, React.ElementType> = {
  PENDING: Clock,
  UNDER_REVIEW: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
  CLOSED: XCircle,
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const navigate = useNavigate();

  const { data: cases, isLoading } = useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: async () => {
      const response = await api.get('/cases');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  const casesArray = Array.isArray(cases) ? cases : [];

  const filteredCases = casesArray.filter((caseItem) => {
    const matchesSearch =
      caseItem.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || caseItem.status === statusFilter;
    const matchesPriority = !priorityFilter || caseItem.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const activeCases = casesArray.filter(
    (c) => c.status !== 'CLOSED' && c.status !== 'RESOLVED'
  ).length || 0;

  const resolvedCases = cases?.filter((c) => c.status === 'RESOLVED').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recovery Cases</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track and manage your crypto recovery cases
          </p>
        </div>
        <Link to="/cases/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Cases</p>
                <p className="text-2xl font-bold">{cases?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold">{activeCases}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-bold">{resolvedCases}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {cases?.filter((c) => c.status === 'PENDING').length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cases..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Clock className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Loading cases...</p>
        </div>
      ) : filteredCases?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No cases found</p>
            <Link to="/cases/new">
              <Button variant="outline" className="mt-4">
                Create your first case
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCases?.map((caseItem) => {
            const StatusIcon = statusIcons[caseItem.status] || AlertCircle;
            return (
              <Card
                key={caseItem.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/cases/${caseItem.id}`)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Icon and Title */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          'p-2.5 sm:p-3 rounded-full shrink-0',
                          caseItem.status === 'RESOLVED'
                            ? 'bg-green-100'
                            : caseItem.status === 'IN_PROGRESS'
                            ? 'bg-blue-100'
                            : caseItem.status === 'PENDING'
                            ? 'bg-yellow-100'
                            : 'bg-gray-100'
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            'h-5 w-5 sm:h-6 sm:w-6',
                            caseItem.status === 'RESOLVED'
                              ? 'text-green-600'
                              : caseItem.status === 'IN_PROGRESS'
                              ? 'text-blue-600'
                              : caseItem.status === 'PENDING'
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {caseItem.caseNumber}
                          </h3>
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded-full shrink-0',
                              priorityColors[caseItem.priority]
                            )}
                          >
                            {caseItem.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {caseItem.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                          {caseItem.description}
                        </p>
                      </div>
                    </div>

                    {/* Status and Date */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-11 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(caseItem.createdAt)}
                        </div>
                        {caseItem.assignedAgent && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <User className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-[100px]">
                              {caseItem.assignedAgent.firstName}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          'px-2.5 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap',
                          getStatusColor(caseItem.status)
                        )}
                      >
                        {caseItem.status.replace(/_/g, ' ')}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
