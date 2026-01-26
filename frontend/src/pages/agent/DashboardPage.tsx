import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate, cn, getStatusColor, getPriorityColor } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface AgentStats {
  assignedCases: number;
  activeCases: number;
  resolvedCasesToday: number;
  assignedTickets: number;
  openTickets: number;
  avgResponseTime: string;
}

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface TicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function AgentDashboardPage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery<AgentStats>({
    queryKey: ['agent-stats'],
    queryFn: async () => {
      const response = await api.get('/agent/stats');
      return response.data;
    },
  });

  const { data: recentCases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ['agent-recent-cases'],
    queryFn: async () => {
      const response = await api.get('/agent/cases?limit=5');
      return response.data.data || response.data;
    },
  });

  const { data: urgentTickets, isLoading: ticketsLoading } = useQuery<TicketItem[]>({
    queryKey: ['agent-urgent-tickets'],
    queryFn: async () => {
      const response = await api.get('/agent/tickets?priority=HIGH&limit=5');
      return response.data.data || response.data;
    },
  });

  // Mock data for demo
  const mockStats: AgentStats = {
    assignedCases: 12,
    activeCases: 8,
    resolvedCasesToday: 3,
    assignedTickets: 15,
    openTickets: 7,
    avgResponseTime: '2.5 hours',
  };

  const mockCases: Case[] = [
    {
      id: '1',
      caseNumber: 'CRV-2024-001',
      title: 'Bitcoin wallet compromised',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
      user: { firstName: 'John', lastName: 'Doe' },
    },
    {
      id: '2',
      caseNumber: 'CRV-2024-002',
      title: 'Lost access to exchange account',
      status: 'PENDING',
      priority: 'MEDIUM',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      user: { firstName: 'Jane', lastName: 'Smith' },
    },
    {
      id: '3',
      caseNumber: 'CRV-2024-003',
      title: 'Phishing attack investigation',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      user: { firstName: 'Mike', lastName: 'Johnson' },
    },
  ];

  const mockTickets: TicketItem[] = [
    {
      id: '1',
      ticketNumber: 'TKT-001',
      subject: 'Need update on case status',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
      user: { firstName: 'John', lastName: 'Doe' },
    },
    {
      id: '2',
      ticketNumber: 'TKT-002',
      subject: 'Documents uploaded for review',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      user: { firstName: 'Sarah', lastName: 'Williams' },
    },
  ];

  const displayStats = stats || mockStats;
  const displayCases = recentCases || mockCases;
  const displayTickets = urgentTickets || mockTickets;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here's your workload overview for today
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link to="/agent/cases">
            <Button variant="outline" className="w-full sm:w-auto">View All Cases</Button>
          </Link>
          <Link to="/agent/tickets">
            <Button className="w-full sm:w-auto">View All Tickets</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Assigned Cases</p>
                  <p className="text-2xl font-bold">{displayStats.assignedCases}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {displayStats.activeCases} active
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open Tickets</p>
                  <p className="text-2xl font-bold">{displayStats.openTickets}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {displayStats.assignedTickets} total assigned
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Ticket className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resolved Today</p>
                  <p className="text-2xl font-bold">{displayStats.resolvedCasesToday}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Great progress!
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Cases</CardTitle>
                <CardDescription>Cases assigned to you</CardDescription>
              </div>
              <Link to="/agent/cases">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {casesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : displayCases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2">No cases assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayCases.map((caseItem) => (
                  <Link
                    key={caseItem.id}
                    to={`/agent/cases/${caseItem.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-gray-500">
                            {caseItem.caseNumber}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              getPriorityColor(caseItem.priority)
                            )}
                          >
                            {caseItem.priority}
                          </span>
                        </div>
                        <p className="font-medium mt-1">{caseItem.title}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {caseItem.user.firstName} {caseItem.user.lastName}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          getStatusColor(caseItem.status)
                        )}
                      >
                        {caseItem.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgent Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  Urgent Tickets
                </CardTitle>
                <CardDescription>High priority tickets requiring attention</CardDescription>
              </div>
              <Link to="/agent/tickets">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : displayTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto text-green-400" />
                <p className="mt-2">No urgent tickets</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/agent/tickets/${ticket.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-red-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-gray-500">
                            {ticket.ticketNumber}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            URGENT
                          </span>
                        </div>
                        <p className="font-medium mt-1">{ticket.subject}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          getStatusColor(ticket.status)
                        )}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Performance</CardTitle>
          <CardDescription>Your activity summary for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {displayStats.resolvedCasesToday}
              </p>
              <p className="text-sm text-gray-500">Cases Resolved</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{displayStats.openTickets}</p>
              <p className="text-sm text-gray-500">Tickets Handled</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {displayStats.avgResponseTime}
              </p>
              <p className="text-sm text-gray-500">Avg Response Time</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">
                {displayStats.activeCases}
              </p>
              <p className="text-sm text-gray-500">Active Cases</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
