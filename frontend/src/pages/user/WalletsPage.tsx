import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useWalletWithLivePrices } from '@/hooks/use-coingecko';
import { validateAddress, formatBlockchainName } from '@/lib/blockchain';
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
  TrendingDown,
  RefreshCw,
  Sparkles,
  Activity,
  AlertCircle,
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

  // Wallet connection hook
  const {
    wallet: connectedWallet,
    isConnected,
    isConnecting,
    hasMetaMask,
    connectWallet,
    disconnectWallet,
    switchToTestnet,
  } = useWalletConnect();

  // Fetch wallets
  const { data: wallets, isLoading: walletsLoading, refetch: refetchWallets } = useQuery<WalletItem[]>({
    queryKey: ['my-wallets'],
    queryFn: async () => {
      const response = await api.get('/wallets');
      return Array.isArray(response.data) ? response.data : response.data?.data || [];
    },
  });

  // Get live prices from CoinGecko
  const { 
    totalValue: liveTotalValue, 
    wallets: walletsWithPrices, 
    isLoading: pricesLoading 
  } = useWalletWithLivePrices(wallets);

  // Fetch requests
  const { data: requestsData } = useQuery({
    queryKey: ['my-wallet-requests'],
    queryFn: async () => {
      const response = await api.get('/wallets/requests');
      return response.data;
    },
  });

  const requests: WalletRequest[] = requestsData?.data || [];

  // Calculate total 24h change
  const total24hChange = walletsWithPrices?.reduce((sum, w) => {
    return sum + (w.liveUsdValue * w.priceChange24h) / 100;
  }, 0) || 0;
  const percentChange24h = liveTotalValue > 0 ? (total24hChange / liveTotalValue) * 100 : 0;

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
      {/* Wallet Connection Card */}
      <Card className="border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
                </h3>
                {isConnected && connectedWallet ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        connectedWallet.isTestnet 
                          ? "bg-yellow-100 text-yellow-700" 
                          : "bg-green-100 text-green-700"
                      )}>
                        {connectedWallet.network}
                      </span>
                      <span className="text-xs text-gray-600">
                        Balance: {connectedWallet.balance} ETH
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Connect MetaMask to perform test transactions on testnets
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!isConnected ? (
                <Button 
                  onClick={connectWallet} 
                  disabled={isConnecting}
                  className="whitespace-nowrap"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {hasMetaMask ? 'Connect MetaMask' : 'Install MetaMask'}
                    </>
                  )}
                </Button>
              ) : (
                <>
                  {!connectedWallet?.isTestnet && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => switchToTestnet(11155111)}
                    >
                      Switch to Sepolia
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </Button>
                </>
              )}
              <a
                href="https://faucets.chain.link/sepolia"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Get Test ETH
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert for Testing */}
      {isConnected && connectedWallet?.isTestnet && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">Testing Mode Active</h4>
              <p className="text-sm text-blue-700 mb-2">
                You're connected to a testnet. You can now test deposits and withdrawals without using real funds.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <a
                  href="https://faucets.chain.link/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  Get Sepolia ETH
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-blue-400">•</span>
                <a
                  href="https://sepolia.etherscan.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  View on Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Header - Enhanced with live data */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-brand-400" />
                <span className="text-sm text-gray-400">Portfolio Value (Live)</span>
                {pricesLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{formatCurrency(liveTotalValue || 0)}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                  percentChange24h >= 0 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                )}>
                  {percentChange24h >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {percentChange24h >= 0 ? '+' : ''}{percentChange24h.toFixed(2)}%
                </div>
                <span className="text-gray-500 text-sm">
                  {percentChange24h >= 0 ? '+' : ''}{formatCurrency(Math.abs(total24hChange))} today
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 bg-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Live Prices</span>
              </div>
              <p className="text-2xl font-bold">{wallets?.length || 0}</p>
              <p className="text-sm text-gray-400">Assets Tracked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Assets</h2>
          <button 
            onClick={() => refetchWallets()}
            className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
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
            {(walletsWithPrices || wallets).map((wallet: any) => {
              const crypto = getCryptoInfo(wallet.type);
              const livePrice = wallet.livePrice || 0;
              const liveValue = wallet.liveUsdValue || wallet.usdValue || 0;
              const change24h = wallet.priceChange24h || 0;
              const priceData = wallet.priceData;
              
              return (
                <Card key={wallet.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        {priceData?.image ? (
                          <img 
                            src={priceData.image} 
                            alt={crypto.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg', crypto.color)}>
                            {crypto.icon}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{crypto.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">{crypto.symbol}</p>
                            {livePrice > 0 && (
                              <span className="text-xs text-gray-400">
                                @ ${livePrice < 1 ? livePrice.toFixed(4) : livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">{formatCurrency(liveValue)}</p>
                        <div className="flex items-center justify-end gap-2">
                          <p className="text-sm text-gray-500 font-mono">
                            {Number(wallet.tokenBalance).toFixed(6)} {crypto.symbol}
                          </p>
                          {change24h !== 0 && (
                            <span className={cn(
                              "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
                              change24h >= 0 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            )}>
                              {change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {Math.abs(change24h).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex border-t border-gray-100">
                      <button
                        onClick={() => handleOpenRequest(wallet, 'deposit')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors border-r border-gray-100"
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
                    <div className="relative">
                      <Input
                        value={requestForm.walletAddress}
                        onChange={(e) => setRequestForm({ ...requestForm, walletAddress: e.target.value })}
                        placeholder="Enter your external wallet address"
                        required
                        className={cn(
                          "mt-1 font-mono text-sm pr-10",
                          requestForm.walletAddress.length >= 10 && (
                            validateAddress(requestForm.walletAddress).isValid
                              ? "border-green-500"
                              : "border-red-500"
                          )
                        )}
                      />
                      {requestForm.walletAddress.length >= 10 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5">
                          {validateAddress(requestForm.walletAddress).isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {requestForm.walletAddress.length >= 10 && (
                      <p className={cn(
                        "text-xs mt-1",
                        validateAddress(requestForm.walletAddress).isValid ? "text-green-600" : "text-red-500"
                      )}>
                        {validateAddress(requestForm.walletAddress).isValid
                          ? `✓ Valid ${formatBlockchainName(validateAddress(requestForm.walletAddress).blockchain!)} address`
                          : validateAddress(requestForm.walletAddress).error}
                      </p>
                    )}
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
