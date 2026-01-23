import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatDate, cn, getStatusColor, getPriorityColor } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Search,
  Ticket,
  Loader2,
  Clock,
  User,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';

interface TicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  messagesCount?: number;
}

export default function AgentTicketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['agent-tickets', searchQuery, statusFilter, priorityFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      const response = await api.get(`/agent/tickets?${params.toString()}`);
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/agent/tickets/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tickets'] });
      toast({ title: 'Status updated', description: 'Ticket status has been updated.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      const response = await api.post(`/tickets/${ticketId}/messages`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tickets'] });
      toast({ title: 'Reply sent', description: 'Your reply has been sent to the user.' });
      setReplyContent('');
      setIsReplyModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to send reply',
        variant: 'destructive',
      });
    },
  });

  const tickets = data?.data || data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'WAITING_RESPONSE', label: 'Waiting Response' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const handleReply = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setIsReplyModalOpen(true);
  };

  const submitReply = () => {
    if (selectedTicket && replyContent.trim()) {
      replyMutation.mutate({ ticketId: selectedTicket.id, content: replyContent });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tickets</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your assigned support tickets</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 min-w-[150px]"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No tickets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket: TicketItem) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-sm text-gray-500">{ticket.ticketNumber}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          getStatusColor(ticket.status)
                        )}
                      >
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          getPriorityColor(ticket.priority)
                        )}
                      >
                        {ticket.priority}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {ticket.category}
                      </span>
                    </div>
                    <Link
                      to={`/agent/tickets/${ticket.id}`}
                      className="text-lg font-semibold hover:text-blue-600 transition-colors"
                    >
                      {ticket.subject}
                    </Link>
                    <p className="text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {ticket.user.firstName} {ticket.user.lastName}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(ticket.createdAt)}
                      </div>
                      {ticket.messagesCount !== undefined && (
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {ticket.messagesCount} messages
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                      value={ticket.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({ id: ticket.id, status: e.target.value })
                      }
                    >
                      {statuses.slice(1).map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" onClick={() => handleReply(ticket)}>
                      <Send className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <Link to={`/agent/tickets/${ticket.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      {isReplyModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsReplyModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reply to Ticket</CardTitle>
                  <CardDescription>
                    Replying to {selectedTicket.ticketNumber}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsReplyModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">{selectedTicket.subject}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    From: {selectedTicket.user.firstName} {selectedTicket.user.lastName}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyContent">Your Reply</Label>
                  <textarea
                    id="replyContent"
                    rows={5}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsReplyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={submitReply}
                    disabled={replyMutation.isPending || !replyContent.trim()}
                  >
                    {replyMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Send className="mr-2 h-4 w-4" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
