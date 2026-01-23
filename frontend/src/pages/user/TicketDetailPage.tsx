import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
  Send,
  AlertCircle,
} from 'lucide-react';

interface TicketMessage {
  id: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: ticket, isLoading } = useQuery<TicketDetail>({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    },
  });

  // Fetch messages separately
  const { data: messages = [] } = useQuery<TicketMessage[]>({
    queryKey: ['ticket-messages', id],
    queryFn: async () => {
      const response = await api.get(`/tickets/${id}/messages`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 10000, // Auto-refresh every 10 seconds for real-time feel
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post(`/tickets/${id}/messages`, { message });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', id] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setNewMessage('');
      toast({
        title: 'Message sent',
        description: 'Your message has been sent.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/tickets/${id}`, { status: 'CLOSED' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Ticket closed',
        description: 'The ticket has been closed.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to close ticket',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Clock className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
        <p className="mt-2 text-gray-500">Ticket not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/tickets')}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {ticket.subject}
              </h1>
              <span className={cn('px-3 py-1 text-sm font-medium rounded-full', getStatusColor(ticket.status))}>
                {ticket.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ticket.ticketNumber} • {ticket.category.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        {!isClosed && (
          <Button
            variant="outline"
            onClick={() => closeTicketMutation.mutate()}
            disabled={closeTicketMutation.isPending}
          >
            Close Ticket
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Messages</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = !msg.isStaff;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex',
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-lg p-4',
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 dark:bg-gray-800'
                        )}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={cn(
                            'text-sm font-medium',
                            isOwnMessage ? 'text-primary-foreground/80' : 'text-gray-600 dark:text-gray-400'
                          )}>
                            {msg.user?.firstName} {msg.user?.lastName}
                          </span>
                          <span className={cn(
                            'text-xs',
                            isOwnMessage ? 'text-primary-foreground/60' : 'text-gray-400'
                          )}>
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className={cn(
                          'whitespace-pre-wrap',
                          isOwnMessage ? 'text-primary-foreground' : 'text-gray-800 dark:text-gray-200'
                        )}>
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            {!isClosed ? (
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendMessageMutation.isPending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sendMessageMutation.isPending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="border-t p-4 text-center text-gray-500">
                This ticket is closed
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', priorityColors[ticket.priority])}>
                  {ticket.priority}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{ticket.category.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(ticket.updatedAt)}</p>
              </div>

              {ticket.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500">Assigned Agent</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">
                      {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:support@cryptorecovery.com?subject=RE: ${ticket.ticketNumber}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Email Support
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
