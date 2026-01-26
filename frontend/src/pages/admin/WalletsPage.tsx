import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Wallet,
  Search,
  Filter,
  ExternalLink,
  Loader2,
  Bitcoin,
  CircleDollarSign,
} from 'lucide-react';

interface WalletItem {
  id: string;
  address: string;
  type: string;
  name: string;
  balance: number;
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

const blockchainIcons: Record<string, React.ElementType> = {
  bitcoin: Bitcoin,
  ethereum: CircleDollarSign,
  litecoin: Wallet,
  ripple: Wallet,
  dogecoin: Wallet,
  other: Wallet,
  DEFAULT: Wallet,
};

export default function AdminWalletsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [blockchainFilter, setBlockchainFilter] = useState<string>('');

  const { data: walletsData, isLoading } = useQuery({
    queryKey: ['admin-wallets', searchQuery, blockchainFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (blockchainFilter) params.append('blockchain', blockchainFilter);
      const response = await api.get(`/admin/wallets?${params.toString()}`);
      return response.data;
    },
  });

  const wallets = walletsData?.data || [];
  const totalBalance = wallets.reduce((acc: number, w: WalletItem) => acc + (Number(w.balance) || 0), 0);

  const getBlockchainExplorer = (walletType: string, address: string) => {
    const explorers: Record<string, string> = {
      bitcoin: `https://blockchain.com/btc/address/${address}`,
      ethereum: `https://etherscan.io/address/${address}`,
      litecoin: `https://blockchair.com/litecoin/address/${address}`,
      ripple: `https://xrpscan.com/account/${address}`,
      dogecoin: `https://dogechain.info/address/${address}`,
    };
    return explorers[walletType] || '#';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallets Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">View all user wallets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Balance</p>
                <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(totalBalance)}</p>
              </div>
              <CircleDollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Verified</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {wallets.filter((w: WalletItem) => w.status === 'verified').length}
                </p>
              </div>
              <Bitcoin className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by address or user..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            value={blockchainFilter}
            onChange={(e) => setBlockchainFilter(e.target.value)}
          >
            <option value="">All Blockchains</option>
            <option value="BITCOIN">Bitcoin</option>
            <option value="ETHEREUM">Ethereum</option>
            <option value="SOLANA">Solana</option>
            <option value="POLYGON">Polygon</option>
            <option value="BINANCE_SMART_CHAIN">BSC</option>
          </select>
        </div>
      </div>

      {/* Wallets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blockchain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Synced</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    </td>
                  </tr>
                ) : wallets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No wallets found
                    </td>
                  </tr>
                ) : (
                  wallets.map((wallet: WalletItem) => {
                    const Icon = blockchainIcons[wallet.type] || blockchainIcons.DEFAULT;
                    return (
                      <tr key={wallet.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {wallet.name || wallet.type}
                              </p>
                              <p className="text-sm text-gray-500 font-mono truncate max-w-[200px]">
                                {wallet.address}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{wallet.user?.firstName} {wallet.user?.lastName}</p>
                          <p className="text-sm text-gray-500">{wallet.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm capitalize">{wallet.type?.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4 text-sm capitalize">{wallet.status?.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold">{wallet.balance || 0}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {wallet.updatedAt ? formatDate(wallet.updatedAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={getBlockchainExplorer(wallet.type, wallet.address)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
