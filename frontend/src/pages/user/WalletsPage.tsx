import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Wallet,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Bitcoin,
  CircleDollarSign,
} from 'lucide-react';

interface Wallet {
  id: string;
  address: string;
  blockchain: string;
  walletType: string;
  label: string;
  currentBalance: number;
  lastSyncedAt: string;
  isActive: boolean;
  createdAt: string;
}

const blockchainIcons: Record<string, React.ElementType> = {
  BITCOIN: Bitcoin,
  ETHEREUM: CircleDollarSign,
  DEFAULT: Wallet,
};

export default function WalletsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('');
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [newWallet, setNewWallet] = useState({
    address: '',
    blockchain: 'ETHEREUM',
    walletType: 'HOT_WALLET',
    label: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: wallets, isLoading } = useQuery<Wallet[]>({
    queryKey: ['wallets'],
    queryFn: async () => {
      const response = await api.get('/wallets');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  const addWalletMutation = useMutation({
    mutationFn: async (wallet: typeof newWallet) => {
      const response = await api.post('/wallets', wallet);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: 'Wallet added',
        description: 'Your wallet has been successfully added.',
      });
      setIsAddingWallet(false);
      setNewWallet({
        address: '',
        blockchain: 'ETHEREUM',
        walletType: 'HOT_WALLET',
        label: '',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add wallet',
        variant: 'destructive',
      });
    },
  });

  const syncWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
      const response = await api.post(`/wallets/${walletId}/sync`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: 'Wallet synced',
        description: 'Wallet balance has been updated.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Sync failed',
        description: err.response?.data?.message || 'Failed to sync wallet',
        variant: 'destructive',
      });
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
      await api.delete(`/wallets/${walletId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: 'Wallet removed',
        description: 'The wallet has been removed from your account.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to remove wallet',
        variant: 'destructive',
      });
    },
  });

  const filteredWallets = wallets?.filter((wallet) => {
    const matchesSearch =
      wallet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.label?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlockchain = !selectedBlockchain || wallet.blockchain === selectedBlockchain;
    return matchesSearch && matchesBlockchain;
  });

  const blockchains = [...new Set(wallets?.map((w) => w.blockchain).filter(Boolean) || [])];

  const totalBalance = wallets?.reduce((acc, w) => acc + (w.currentBalance || 0), 0) || 0;

  const getBlockchainExplorer = (blockchain: string, address: string) => {
    const explorers: Record<string, string> = {
      BITCOIN: `https://blockchain.com/btc/address/${address}`,
      ETHEREUM: `https://etherscan.io/address/${address}`,
      SOLANA: `https://explorer.solana.com/address/${address}`,
      POLYGON: `https://polygonscan.com/address/${address}`,
      BINANCE_SMART_CHAIN: `https://bscscan.com/address/${address}`,
    };
    return explorers[blockchain] || '#';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallets</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and monitor your cryptocurrency wallets
          </p>
        </div>
        <Button onClick={() => setIsAddingWallet(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Wallets</p>
                <p className="text-2xl font-bold">{wallets?.length || 0}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
              </div>
              <CircleDollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Blockchains</p>
                <p className="text-2xl font-bold">{blockchains.length}</p>
              </div>
              <Bitcoin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Wallet Modal */}
      {isAddingWallet && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Wallet</CardTitle>
            <CardDescription>Enter your wallet details to track its balance</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addWalletMutation.mutate(newWallet);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Wallet Address</Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={newWallet.address}
                    onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    placeholder="My Main Wallet"
                    value={newWallet.label}
                    onChange={(e) => setNewWallet({ ...newWallet, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blockchain">Blockchain</Label>
                  <select
                    id="blockchain"
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newWallet.blockchain}
                    onChange={(e) => setNewWallet({ ...newWallet, blockchain: e.target.value })}
                  >
                    <option value="BITCOIN">Bitcoin</option>
                    <option value="ETHEREUM">Ethereum</option>
                    <option value="SOLANA">Solana</option>
                    <option value="POLYGON">Polygon</option>
                    <option value="BINANCE_SMART_CHAIN">Binance Smart Chain</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletType">Wallet Type</Label>
                  <select
                    id="walletType"
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newWallet.walletType}
                    onChange={(e) => setNewWallet({ ...newWallet, walletType: e.target.value })}
                  >
                    <option value="HOT_WALLET">Hot Wallet</option>
                    <option value="COLD_WALLET">Cold Wallet</option>
                    <option value="EXCHANGE">Exchange</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="PAPER">Paper</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingWallet(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addWalletMutation.isPending}>
                  {addWalletMutation.isPending ? 'Adding...' : 'Add Wallet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by address or label..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            value={selectedBlockchain}
            onChange={(e) => setSelectedBlockchain(e.target.value)}
          >
            <option value="">All Blockchains</option>
            {blockchains.map((blockchain) => (
              <option key={blockchain} value={blockchain}>
                {blockchain.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wallets List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Loading wallets...</p>
        </div>
      ) : filteredWallets?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No wallets found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsAddingWallet(true)}
            >
              Add your first wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWallets?.map((wallet) => {
            const Icon = blockchainIcons[wallet.blockchain] || blockchainIcons.DEFAULT;
            return (
              <Card key={wallet.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {wallet.label || wallet.blockchain || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{wallet.walletType?.replace(/_/g, ' ') || 'Unknown'}</p>
                      </div>
                    </div>
                    <a
                      href={getBlockchainExplorer(wallet.blockchain, wallet.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="font-mono text-sm truncate">{wallet.address}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Balance</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(wallet.currentBalance || 0)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Synced</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {wallet.lastSyncedAt ? formatDate(wallet.lastSyncedAt) : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncWalletMutation.mutate(wallet.id)}
                      disabled={syncWalletMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${syncWalletMutation.isPending ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this wallet?')) {
                          deleteWalletMutation.mutate(wallet.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
