import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import {
  Search,
  Filter,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  lastMessageAt: string;
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function AdminTicketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['admin-tickets', searchQuery, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      const response = await api.get(`/admin/tickets?${params.toString()}`);
      return response.data;
    },
  });

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await api.get('/admin/users?role=support_agent');
      return response.data.data;
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.patch(`/admin/tickets/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast({ title: 'Ticket updated', description: 'Ticket has been updated successfully.' });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update ticket',
        variant: 'destructive',
      });
    },
  });

  const tickets = ticketsData?.data || [];

  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (selectedTicket) {
      updateTicketMutation.mutate({ id: selectedTicket.id, data: { status: newStatus } });
    }
  };

  const handleAssignAgent = (agentId: string) => {
    if (selectedTicket) {
      updateTicketMutation.mutate({ id: selectedTicket.id, data: { assignedToId: agentId || null } });
    }
  };

  const handlePriorityChange = (newPriority: string) => {
    if (selectedTicket) {
      updateTicketMutation.mutate({ id: selectedTicket.id, data: { priority: newPriority } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all support tickets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
            <p className="text-lg sm:text-2xl font-bold">{ticketsData?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Open</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">
              {tickets.filter((t: Ticket) => t.status === 'OPEN').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">In Progress</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">
              {tickets.filter((t: Ticket) => t.status === 'IN_PROGRESS').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Awaiting</p>
            <p className="text-lg sm:text-2xl font-bold text-orange-600">
              {tickets.filter((t: Ticket) => t.status === 'AWAITING_CUSTOMER').length}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Resolved</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              {tickets.filter((t: Ticket) => t.status === 'RESOLVED').length}
            </p>
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

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket: Ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.ticketNumber}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{ticket.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{ticket.user.firstName} {ticket.user.lastName}</p>
                        <p className="text-sm text-gray-500">{ticket.user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">{ticket.category.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(ticket.status))}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', priorityColors[ticket.priority])}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {ticket.assignedTo ? (
                          `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(ticket.lastMessageAt || ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openTicketModal(ticket)}>
                          Manage
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Management Modal */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-lg mx-4">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTicket.ticketNumber}</h3>
                  <p className="text-sm text-gray-500">{selectedTicket.subject}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium">{selectedTicket.user.firstName} {selectedTicket.user.lastName}</p>
                <p className="text-sm text-gray-500">{selectedTicket.user.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="AWAITING_CUSTOMER">Awaiting Customer</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  value={selectedTicket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Assign Agent</Label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  value={selectedTicket.assignedTo?.id || ''}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {agents?.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.firstName} {agent.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
