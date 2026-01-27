import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatCurrency, getStatusColor, cn } from '@/lib/utils';
import {
  Search,
  Filter,
  ChevronRight,
  Loader2,
  X,
  Plus,
} from 'lucide-react';

interface Case {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  estimatedLoss: number;
  recoveredAmount: number;
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
  updatedAt: string;
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const CASE_TYPES = [
  { value: 'WALLET_RECOVERY', label: 'Wallet Recovery' },
  { value: 'SCAM', label: 'Scam Recovery' },
  { value: 'THEFT', label: 'Theft / Hack' },
  { value: 'EXCHANGE_ISSUE', label: 'Exchange Issue' },
  { value: 'LOST_ACCESS', label: 'Lost Access' },
  { value: 'OTHER', label: 'Other' },
];

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function AdminCasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    userId: '',
    title: '',
    description: '',
    type: 'WALLET_RECOVERY',
    priority: 'MEDIUM',
    estimatedLoss: 0,
    walletAddress: '',
    assignedToId: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: casesData, isLoading } = useQuery({
    queryKey: ['admin-cases', searchQuery, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      const response = await api.get(`/admin/cases?${params.toString()}`);
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

  // Fetch users for dropdown
  const { data: usersData } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const response = await api.get('/admin/users?role=user&limit=100');
      return response.data;
    },
  });

  const users: User[] = usersData?.data || [];

  // Create case mutation
  const createCaseMutation = useMutation({
    mutationFn: async (data: typeof newCase) => {
      const response = await api.post('/admin/cases', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      toast({ title: 'Case created', description: 'Case has been created successfully.' });
      setIsCreateModalOpen(false);
      setNewCase({
        userId: '',
        title: '',
        description: '',
        type: 'WALLET_RECOVERY',
        priority: 'MEDIUM',
        estimatedLoss: 0,
        walletAddress: '',
        assignedToId: '',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create case',
        variant: 'destructive',
      });
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.patch(`/admin/cases/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      toast({ title: 'Case updated', description: 'Case has been updated successfully.' });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update case',
        variant: 'destructive',
      });
    },
  });

  const cases = casesData?.data || [];

  const openCaseModal = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (selectedCase) {
      updateCaseMutation.mutate({ id: selectedCase.id, data: { status: newStatus } });
    }
  };

  const handleAssignAgent = (agentId: string) => {
    if (selectedCase) {
      updateCaseMutation.mutate({ id: selectedCase.id, data: { assignedToId: agentId || null } });
    }
  };

  const handlePriorityChange = (newPriority: string) => {
    if (selectedCase) {
      updateCaseMutation.mutate({ id: selectedCase.id, data: { priority: newPriority } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cases Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage all recovery cases
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Case
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
            <p className="text-lg sm:text-2xl font-bold">{casesData?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">
              {cases.filter((c: Case) => c.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">In Progress</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">
              {cases.filter((c: Case) => c.status === 'IN_PROGRESS').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Resolved</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              {cases.filter((c: Case) => c.status === 'RESOLVED').length}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Urgent</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600">
              {cases.filter((c: Case) => c.priority === 'URGENT').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by case number or description..."
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
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
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
                ) : cases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No cases found
                    </td>
                  </tr>
                ) : (
                  cases.map((caseItem: Case) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{caseItem.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{caseItem.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{caseItem.user.firstName} {caseItem.user.lastName}</p>
                        <p className="text-sm text-gray-500">{caseItem.user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">{caseItem.type.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(caseItem.status))}>
                          {caseItem.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', priorityColors[caseItem.priority])}>
                          {caseItem.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {caseItem.assignedTo ? (
                          `${caseItem.assignedTo.firstName} ${caseItem.assignedTo.lastName}`
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(caseItem.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openCaseModal(caseItem)}>
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

      {/* Case Management Modal */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCase.title}</CardTitle>
                  <CardDescription>{selectedCase.type.replace(/_/g, ' ')}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium">{selectedCase.user.firstName} {selectedCase.user.lastName}</p>
                <p className="text-sm text-gray-500">{selectedCase.user.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  value={selectedCase.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  value={selectedCase.priority}
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
                  value={selectedCase.assignedTo?.id || ''}
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

              <div>
                <p className="text-sm text-gray-500">Estimated Loss</p>
                <p className="font-medium">{formatCurrency(selectedCase.estimatedLoss || 0)}</p>
              </div>

              {selectedCase.recoveredAmount > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Recovered Amount</p>
                  <p className="font-medium text-green-600">{formatCurrency(selectedCase.recoveredAmount)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Case Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsCreateModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create New Case</CardTitle>
                  <CardDescription>Create a recovery case for a user</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createCaseMutation.mutate(newCase); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>User *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newCase.userId}
                    onChange={(e) => setNewCase({ ...newCase, userId: e.target.value })}
                    required
                  >
                    <option value="">Select a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newCase.title}
                    onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                    placeholder="Case title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newCase.type}
                    onChange={(e) => setNewCase({ ...newCase, type: e.target.value })}
                    required
                  >
                    {CASE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 min-h-[100px]"
                    value={newCase.description}
                    onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                    placeholder="Describe the case details..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                      value={newCase.priority}
                      onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Loss (USD)</Label>
                    <Input
                      type="number"
                      value={newCase.estimatedLoss || ''}
                      onChange={(e) => setNewCase({ ...newCase, estimatedLoss: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input
                    value={newCase.walletAddress}
                    onChange={(e) => setNewCase({ ...newCase, walletAddress: e.target.value })}
                    placeholder="0x..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assign Agent</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newCase.assignedToId}
                    onChange={(e) => setNewCase({ ...newCase, assignedToId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {agents?.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createCaseMutation.isPending}
                  >
                    {createCaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Case
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
