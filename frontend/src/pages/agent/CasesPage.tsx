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
  FolderOpen,
  Loader2,
  Clock,
  User,
  MessageSquare,
  Paperclip,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  notesCount?: number;
  filesCount?: number;
}

export default function AgentCasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['agent-cases', searchQuery, statusFilter, priorityFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      const response = await api.get(`/agent/cases?${params.toString()}`);
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/agent/cases/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-cases'] });
      toast({ title: 'Status updated', description: 'Case status has been updated.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ caseId, content }: { caseId: string; content: string }) => {
      const response = await api.post(`/cases/${caseId}/notes`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-cases'] });
      toast({ title: 'Note added', description: 'Your note has been added to the case.' });
      setNoteContent('');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add note',
        variant: 'destructive',
      });
    },
  });

  const cases = data?.data || data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const handleAddNote = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const submitNote = () => {
    if (selectedCase && noteContent.trim()) {
      addNoteMutation.mutate({ caseId: selectedCase.id, content: noteContent });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Cases</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your assigned cases</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cases..."
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

      {/* Cases List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        </div>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No cases found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem: Case) => (
            <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-sm text-gray-500">{caseItem.caseNumber}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          getStatusColor(caseItem.status)
                        )}
                      >
                        {caseItem.status.replace(/_/g, ' ')}
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
                    <Link
                      to={`/agent/cases/${caseItem.id}`}
                      className="text-lg font-semibold hover:text-blue-600 transition-colors"
                    >
                      {caseItem.title}
                    </Link>
                    <p className="text-gray-500 mt-1 line-clamp-2">{caseItem.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {caseItem.user.firstName} {caseItem.user.lastName}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(caseItem.createdAt)}
                      </div>
                      {caseItem.notesCount !== undefined && (
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {caseItem.notesCount} notes
                        </div>
                      )}
                      {caseItem.filesCount !== undefined && (
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 mr-1" />
                          {caseItem.filesCount} files
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                      value={caseItem.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({ id: caseItem.id, status: e.target.value })
                      }
                    >
                      {statuses.slice(1).map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" onClick={() => handleAddNote(caseItem)}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Note
                    </Button>
                    <Link to={`/agent/cases/${caseItem.id}`}>
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

      {/* Add Note Modal */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Add Note</CardTitle>
                  <CardDescription>
                    Add a note to case {selectedCase.caseNumber}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="noteContent">Note Content</Label>
                  <textarea
                    id="noteContent"
                    rows={5}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter your note..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitNote} disabled={addNoteMutation.isPending || !noteContent.trim()}>
                    {addNoteMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Note
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
