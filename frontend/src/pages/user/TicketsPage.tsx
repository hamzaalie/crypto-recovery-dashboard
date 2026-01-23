import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messagesCount: number;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  const ticketsArray = Array.isArray(tickets) ? tickets : [];

  const filteredTickets = ticketsArray.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTickets = ticketsArray.filter(
    (t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED'
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Get help from our support team
          </p>
        </div>
        <Link to="/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                <p className="text-2xl font-bold">{tickets?.length || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Open</p>
                <p className="text-2xl font-bold">{openTickets}</p>
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
                <p className="text-2xl font-bold">
                  {tickets?.filter((t) => t.status === 'RESOLVED').length || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Awaiting Reply</p>
                <p className="text-2xl font-bold">
                  {tickets?.filter((t) => t.status === 'AWAITING_CUSTOMER').length || 0}
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
            placeholder="Search tickets..."
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
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="AWAITING_CUSTOMER">Awaiting Reply</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Clock className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Loading tickets...</p>
        </div>
      ) : filteredTickets?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No tickets found</p>
            <Link to="/tickets/new">
              <Button variant="outline" className="mt-4">
                Create your first ticket
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets?.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'p-3 rounded-full',
                        ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
                          ? 'bg-green-100'
                          : ticket.status === 'AWAITING_CUSTOMER'
                          ? 'bg-yellow-100'
                          : 'bg-blue-100'
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          'h-6 w-6',
                          ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
                            ? 'text-green-600'
                            : ticket.status === 'AWAITING_CUSTOMER'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {ticket.subject}
                        </h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            priorityColors[ticket.priority]
                          )}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {ticket.ticketNumber} • {ticket.category.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(ticket.lastMessageAt || ticket.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ticket.messagesCount || 0} messages
                      </p>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 text-sm font-medium rounded-full',
                        getStatusColor(ticket.status)
                      )}
                    >
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
