import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  Search,
  Plus,
  Loader2,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';

interface WalletItem {
  id: string;
  type: string;
  tokenBalance: number;
  usdValue: number;
  status: string;
  notes: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WalletRequest {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  walletAddress?: string;
  notes?: string;
  adminNotes?: string;
  transactionHash?: string;
  wallet: WalletItem;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const CRYPTO_TYPES = [
  { value: 'bitcoin', label: 'Bitcoin (BTC)', symbol: 'BTC' },
  { value: 'ethereum', label: 'Ethereum (ETH)', symbol: 'ETH' },
  { value: 'usdt', label: 'Tether (USDT)', symbol: 'USDT' },
  { value: 'usdc', label: 'USD Coin (USDC)', symbol: 'USDC' },
  { value: 'bnb', label: 'BNB', symbol: 'BNB' },
  { value: 'solana', label: 'Solana (SOL)', symbol: 'SOL' },
  { value: 'xrp', label: 'Ripple (XRP)', symbol: 'XRP' },
  { value: 'cardano', label: 'Cardano (ADA)', symbol: 'ADA' },
  { value: 'dogecoin', label: 'Dogecoin (DOGE)', symbol: 'DOGE' },
];

const getCryptoSymbol = (type: string) => {
  return CRYPTO_TYPES.find(c => c.value === type)?.symbol || type.toUpperCase();
};

export default function AdminWalletsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'wallets' | 'requests'>('wallets');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [requestStatusFilter, setRequestStatusFilter] = useState('');

  const [newWallet, setNewWallet] = useState({
    userId: '',
    type: 'bitcoin',
    tokenBalance: 0,
    usdValue: 0,
    notes: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch wallets
  const { data: walletsData, isLoading: walletsLoading } = useQuery({
    queryKey: ['admin-wallets', searchQuery, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (typeFilter) params.append('type', typeFilter);
      const response = await api.get(`/admin/wallets?${params.toString()}`);
      return response.data;
    },
  });

  // Fetch requests
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['admin-wallet-requests', requestStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (requestStatusFilter) params.append('status', requestStatusFilter);
      const response = await api.get(`/wallets/requests/all?${params.toString()}`);
      return response.data;
    },
  });

  // Fetch users for dropdown
  const { data: usersData } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const response = await api.get('/admin/users?limit=100');
      return response.data;
    },
  });

  const users: User[] = usersData?.data || [];
  const wallets: WalletItem[] = walletsData?.data || [];
  const requests: WalletRequest[] = requestsData?.data || [];

  const totalUsdValue = wallets.reduce((acc, w) => acc + Number(w.usdValue || 0), 0);
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  // Create wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: async (data: typeof newWallet) => {
      const response = await api.post('/wallets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      toast({ title: 'Wallet created', description: 'Currency added to user wallet.' });
      setIsAddModalOpen(false);
      setNewWallet({ userId: '', type: 'bitcoin', tokenBalance: 0, usdValue: 0, notes: '' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to create wallet', variant: 'destructive' });
    },
  });

  // Update wallet mutation
  const updateWalletMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.patch(`/wallets/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      toast({ title: 'Wallet updated', description: 'Wallet has been updated.' });
      setIsEditModalOpen(false);
      setSelectedWallet(null);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update wallet', variant: 'destructive' });
    },
  });

  // Delete wallet mutation
  const deleteWalletMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/wallets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      toast({ title: 'Wallet deleted', description: 'Wallet has been removed.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to delete wallet', variant: 'destructive' });
    },
  });

  // Update request mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.patch(`/wallets/requests/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      toast({ title: 'Request updated', description: 'Request status has been updated.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update request', variant: 'destructive' });
    },
  });

  const handleEditWallet = (wallet: WalletItem) => {
    setSelectedWallet(wallet);
    setIsEditModalOpen(true);
  };

  const handleDeleteWallet = (id: string) => {
    if (confirm('Are you sure you want to delete this wallet?')) {
      deleteWalletMutation.mutate(id);
    }
  };

  const handleApproveRequest = (id: string) => {
    updateRequestMutation.mutate({ id, data: { status: 'completed' } });
  };

  const handleRejectRequest = (id: string) => {
    const reason = prompt('Rejection reason (optional):');
    updateRequestMutation.mutate({ id, data: { status: 'rejected', adminNotes: reason || undefined } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage user wallets and requests</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Currency
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Wallets</p>
                <p className="text-lg sm:text-2xl font-bold">{walletsData?.total || 0}</p>
              </div>
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total USD Value</p>
                <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(totalUsdValue)}</p>
              </div>
              <CircleDollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Users</p>
                <p className="text-lg sm:text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Pending Requests</p>
                <p className="text-lg sm:text-2xl font-bold">{pendingRequests}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('wallets')}
          className={cn(
            'px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors',
            activeTab === 'wallets'
              ? 'border-brand text-brand'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Wallets
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            'px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors flex items-center gap-2',
            activeTab === 'requests'
              ? 'border-brand text-brand'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Requests
          {pendingRequests > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingRequests}</span>
          )}
        </button>
      </div>

      {/* Wallets Tab */}
      {activeTab === 'wallets' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Currencies</option>
              {CRYPTO_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Wallets Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {walletsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                        </td>
                      </tr>
                    ) : wallets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">No wallets found</td>
                      </tr>
                    ) : (
                      wallets.map((wallet) => (
                        <tr key={wallet.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4">
                            <p className="font-medium">{wallet.user?.firstName} {wallet.user?.lastName}</p>
                            <p className="text-sm text-gray-500">{wallet.user?.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold">{getCryptoSymbol(wallet.type)}</span>
                          </td>
                          <td className="px-4 py-4 font-mono">
                            {Number(wallet.tokenBalance).toFixed(8)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-green-600">
                            {formatCurrency(wallet.usdValue)}
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              wallet.status === 'active' ? 'bg-green-100 text-green-800' :
                              wallet.status === 'frozen' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            )}>
                              {wallet.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditWallet(wallet)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteWallet(wallet.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <>
          {/* Filters */}
          <div className="flex gap-4">
            <select
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              value={requestStatusFilter}
              onChange={(e) => setRequestStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {requestsLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                </CardContent>
              </Card>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">No requests found</CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className={cn(
                  request.status === 'pending' && 'border-orange-300 bg-orange-50/50'
                )}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'p-2 rounded-lg',
                          request.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                        )}>
                          {request.type === 'deposit' ? (
                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {request.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Request
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.user?.firstName} {request.user?.lastName} • {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {Number(request.amount).toFixed(8)} {getCryptoSymbol(request.wallet?.type)}
                        </p>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        )}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    {request.walletAddress && (
                      <p className="mt-2 text-sm text-gray-500 font-mono truncate">
                        To: {request.walletAddress}
                      </p>
                    )}
                    {request.notes && (
                      <p className="mt-2 text-sm text-gray-600">Note: {request.notes}</p>
                    )}
                    {request.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve & Complete
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Add Wallet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add Currency to User</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createWalletMutation.mutate(newWallet); }} className="space-y-4">
                <div>
                  <Label>User</Label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newWallet.userId}
                    onChange={(e) => setNewWallet({ ...newWallet, userId: e.target.value })}
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newWallet.type}
                    onChange={(e) => setNewWallet({ ...newWallet, type: e.target.value })}
                  >
                    {CRYPTO_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Token Balance</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={newWallet.tokenBalance}
                    onChange={(e) => setNewWallet({ ...newWallet, tokenBalance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>USD Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newWallet.usdValue}
                    onChange={(e) => setNewWallet({ ...newWallet, usdValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Input
                    value={newWallet.notes}
                    onChange={(e) => setNewWallet({ ...newWallet, notes: e.target.value })}
                    placeholder="Internal notes..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createWalletMutation.isPending}>
                  {createWalletMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Currency
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Wallet Modal */}
      {isEditModalOpen && selectedWallet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Wallet</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateWalletMutation.mutate({
                  id: selectedWallet.id,
                  data: {
                    tokenBalance: selectedWallet.tokenBalance,
                    usdValue: selectedWallet.usdValue,
                    status: selectedWallet.status,
                    notes: selectedWallet.notes,
                  }
                });
              }} className="space-y-4">
                <div>
                  <Label>User</Label>
                  <Input value={`${selectedWallet.user?.firstName} ${selectedWallet.user?.lastName}`} disabled />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={getCryptoSymbol(selectedWallet.type)} disabled />
                </div>
                <div>
                  <Label>Token Balance</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={selectedWallet.tokenBalance}
                    onChange={(e) => setSelectedWallet({ ...selectedWallet, tokenBalance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>USD Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={selectedWallet.usdValue}
                    onChange={(e) => setSelectedWallet({ ...selectedWallet, usdValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={selectedWallet.status}
                    onChange={(e) => setSelectedWallet({ ...selectedWallet, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="frozen">Frozen</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={selectedWallet.notes || ''}
                    onChange={(e) => setSelectedWallet({ ...selectedWallet, notes: e.target.value })}
                    placeholder="Internal notes..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={updateWalletMutation.isPending}>
                  {updateWalletMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
