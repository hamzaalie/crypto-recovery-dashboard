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
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  X,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface WalletItem {
  id: string;
  type: string;
  tokenBalance: number;
  usdValue: number;
  status: string;
  createdAt: string;
}

interface WalletRequest {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  walletAddress?: string;
  notes?: string;
  adminNotes?: string;
  wallet: WalletItem;
  createdAt: string;
}

const CRYPTO_INFO: Record<string, { symbol: string; name: string; color: string; icon: string }> = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin', color: 'bg-orange-500', icon: '₿' },
  ethereum: { symbol: 'ETH', name: 'Ethereum', color: 'bg-blue-500', icon: 'Ξ' },
  usdt: { symbol: 'USDT', name: 'Tether', color: 'bg-green-500', icon: '₮' },
  usdc: { symbol: 'USDC', name: 'USD Coin', color: 'bg-blue-400', icon: '$' },
  bnb: { symbol: 'BNB', name: 'BNB', color: 'bg-yellow-500', icon: 'B' },
  solana: { symbol: 'SOL', name: 'Solana', color: 'bg-purple-500', icon: '◎' },
  xrp: { symbol: 'XRP', name: 'Ripple', color: 'bg-gray-600', icon: 'X' },
  cardano: { symbol: 'ADA', name: 'Cardano', color: 'bg-blue-600', icon: '₳' },
  dogecoin: { symbol: 'DOGE', name: 'Dogecoin', color: 'bg-yellow-400', icon: 'Ð' },
};

const getCryptoInfo = (type: string) => {
  return CRYPTO_INFO[type] || { symbol: type.toUpperCase(), name: type, color: 'bg-gray-500', icon: '¤' };
};

export default function WalletsPage() {
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [requestForm, setRequestForm] = useState({
    amount: '',
    walletAddress: '',
    notes: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch wallets
  const { data: wallets, isLoading: walletsLoading } = useQuery<WalletItem[]>({
    queryKey: ['my-wallets'],
    queryFn: async () => {
      const response = await api.get('/wallets');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  // Fetch requests
  const { data: requestsData } = useQuery({
    queryKey: ['my-wallet-requests'],
    queryFn: async () => {
      const response = await api.get('/wallets/requests');
      return response.data;
    },
  });

  const requests: WalletRequest[] = requestsData?.data || [];

  // Calculate totals
  const totalUsdValue = wallets?.reduce((acc, w) => acc + Number(w.usdValue || 0), 0) || 0;

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/wallets/requests', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wallet-requests'] });
      toast({
        title: 'Request submitted',
        description: 'Your request has been sent to the admin for review.',
      });
      setIsRequestModalOpen(false);
      setRequestForm({ amount: '', walletAddress: '', notes: '' });
      setSelectedWallet(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit request',
        variant: 'destructive',
      });
    },
  });

  const handleOpenRequest = (wallet: WalletItem, type: 'deposit' | 'withdrawal') => {
    setSelectedWallet(wallet);
    setRequestType(type);
    setRequestForm({ amount: '', walletAddress: '', notes: '' });
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;

    createRequestMutation.mutate({
      walletId: selectedWallet.id,
      type: requestType,
      amount: parseFloat(requestForm.amount),
      walletAddress: requestType === 'withdrawal' ? requestForm.walletAddress : undefined,
      notes: requestForm.notes || undefined,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="bg-gradient-to-r from-brand to-blue-600 rounded-2xl p-6 text-white">
        <p className="text-sm opacity-80">Total Portfolio Value</p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-1">{formatCurrency(totalUsdValue)}</h1>
        <div className="flex items-center gap-2 mt-2 text-sm opacity-80">
          <TrendingUp className="h-4 w-4" />
          <span>{wallets?.length || 0} Assets</span>
        </div>
      </div>

      {/* Wallets Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Assets</h2>
        {walletsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : !wallets || wallets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No assets in your wallet yet.</p>
              <p className="text-sm text-gray-400 mt-1">Contact support to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {wallets.map((wallet) => {
              const crypto = getCryptoInfo(wallet.type);
              return (
                <Card key={wallet.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold', crypto.color)}>
                          {crypto.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{crypto.name}</h3>
                          <p className="text-sm text-gray-500">{crypto.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(wallet.usdValue)}</p>
                        <p className="text-sm text-gray-500 font-mono">
                          {Number(wallet.tokenBalance).toFixed(6)} {crypto.symbol}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex border-t">
                      <button
                        onClick={() => handleOpenRequest(wallet, 'deposit')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors border-r"
                        disabled={wallet.status === 'frozen'}
                      >
                        <ArrowDownLeft className="h-4 w-4" />
                        Deposit
                      </button>
                      <button
                        onClick={() => handleOpenRequest(wallet, 'withdrawal')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        disabled={wallet.status === 'frozen' || wallet.tokenBalance <= 0}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        Withdraw
                      </button>
                    </div>

                    {wallet.status === 'frozen' && (
                      <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center">
                        This wallet is currently frozen. Contact support for assistance.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Requests</h2>
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No transaction requests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 10).map((request) => {
              const crypto = getCryptoInfo(request.wallet?.type);
              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          request.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                        )}>
                          {request.type === 'deposit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{request.type}</p>
                          <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {request.type === 'deposit' ? '+' : '-'}{Number(request.amount).toFixed(6)} {crypto.symbol}
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          {getStatusIcon(request.status)}
                          <span className={cn(
                            'text-sm capitalize',
                            request.status === 'pending' ? 'text-yellow-600' :
                            request.status === 'completed' ? 'text-green-600' :
                            request.status === 'rejected' ? 'text-red-600' :
                            'text-gray-600'
                          )}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {request.adminNotes && request.status === 'rejected' && (
                      <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        Reason: {request.adminNotes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && selectedWallet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {requestType === 'deposit' ? (
                  <>
                    <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    Request Deposit
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-5 w-5 text-red-600" />
                    Request Withdrawal
                  </>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsRequestModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold', getCryptoInfo(selectedWallet.type).color)}>
                      {getCryptoInfo(selectedWallet.type).icon}
                    </div>
                    <div>
                      <p className="font-semibold">{getCryptoInfo(selectedWallet.type).name}</p>
                      <p className="text-sm text-gray-500">
                        Available: {Number(selectedWallet.tokenBalance).toFixed(6)} {getCryptoInfo(selectedWallet.type).symbol}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Amount ({getCryptoInfo(selectedWallet.type).symbol})</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    min="0"
                    max={requestType === 'withdrawal' ? selectedWallet.tokenBalance : undefined}
                    value={requestForm.amount}
                    onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="mt-1"
                  />
                  {requestType === 'withdrawal' && (
                    <button
                      type="button"
                      className="text-xs text-brand hover:underline mt-1"
                      onClick={() => setRequestForm({ ...requestForm, amount: String(selectedWallet.tokenBalance) })}
                    >
                      Use max: {Number(selectedWallet.tokenBalance).toFixed(6)}
                    </button>
                  )}
                </div>

                {requestType === 'withdrawal' && (
                  <div>
                    <Label>Destination Wallet Address</Label>
                    <Input
                      value={requestForm.walletAddress}
                      onChange={(e) => setRequestForm({ ...requestForm, walletAddress: e.target.value })}
                      placeholder="Enter your external wallet address"
                      required
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                )}

                <div>
                  <Label>Notes (Optional)</Label>
                  <Input
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                    placeholder="Add a note..."
                    className="mt-1"
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Please note:</p>
                  <ul className="list-disc ml-4 mt-1 space-y-1">
                    <li>Your request will be reviewed by an administrator</li>
                    <li>Processing may take up to 24-48 hours</li>
                    {requestType === 'withdrawal' && (
                      <li>Ensure the wallet address is correct - transactions cannot be reversed</li>
                    )}
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={createRequestMutation.isPending}>
                  {createRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
