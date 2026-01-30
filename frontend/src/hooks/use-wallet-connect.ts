import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletConnection {
  address: string;
  chainId: number;
  network: string;
  balance: string;
  isTestnet: boolean;
}

const NETWORKS: Record<number, { name: string; isTestnet: boolean; currency: string }> = {
  1: { name: 'Ethereum Mainnet', isTestnet: false, currency: 'ETH' },
  5: { name: 'Goerli Testnet', isTestnet: true, currency: 'GoerliETH' },
  11155111: { name: 'Sepolia Testnet', isTestnet: true, currency: 'SepoliaETH' },
  137: { name: 'Polygon', isTestnet: false, currency: 'MATIC' },
  80001: { name: 'Mumbai Testnet', isTestnet: true, currency: 'MATIC' },
  56: { name: 'BSC Mainnet', isTestnet: false, currency: 'BNB' },
  97: { name: 'BSC Testnet', isTestnet: true, currency: 'tBNB' },
};

export function useWalletConnect() {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Check if MetaMask is installed
  const hasMetaMask = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // Get balance
  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (!window.ethereum) return '0';
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      // Convert from Wei to ETH
      const ethBalance = parseInt(balance, 16) / 1e18;
      return ethBalance.toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!hasMetaMask) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask browser extension to connect your wallet.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = accounts[0];

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });
      const chainIdNum = parseInt(chainId, 16);

      // Get balance
      const balance = await getBalance(address);

      // Get network info
      const networkInfo = NETWORKS[chainIdNum] || {
        name: `Unknown Network (${chainIdNum})`,
        isTestnet: false,
        currency: 'ETH',
      };

      const walletConnection: WalletConnection = {
        address,
        chainId: chainIdNum,
        network: networkInfo.name,
        balance,
        isTestnet: networkInfo.isTestnet,
      };

      setWallet(walletConnection);

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${networkInfo.name}${networkInfo.isTestnet ? ' (Testnet)' : ''}`,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [hasMetaMask, toast, getBalance]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWallet(null);
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  }, [toast]);

  // Switch to testnet
  const switchToTestnet = useCallback(async (testnetChainId: number = 11155111) => {
    if (!window.ethereum) return;

    const chainIdHex = '0x' + testnetChainId.toString(16);
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });

      toast({
        title: 'Network Switched',
        description: `Switched to ${NETWORKS[testnetChainId]?.name || 'testnet'}`,
      });

      // Refresh wallet info
      if (wallet) {
        const balance = await getBalance(wallet.address);
        const networkInfo = NETWORKS[testnetChainId];
        setWallet({
          ...wallet,
          chainId: testnetChainId,
          network: networkInfo.name,
          balance,
          isTestnet: networkInfo.isTestnet,
        });
      }
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        toast({
          title: 'Network Not Found',
          description: 'Please add this network to MetaMask manually.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Network Switch Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  }, [wallet, toast, getBalance]);

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (wallet && accounts[0] !== wallet.address) {
        // Account changed, reconnect
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      // Reload page on network change (recommended by MetaMask)
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [wallet, connectWallet, disconnectWallet]);

  // Auto-connect if previously connected
  useEffect(() => {
    if (!hasMetaMask) return;

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          // Already connected, restore connection
          connectWallet();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, [hasMetaMask]); // Only run on mount

  return {
    wallet,
    isConnected: !!wallet,
    isConnecting,
    hasMetaMask,
    connectWallet,
    disconnectWallet,
    switchToTestnet,
    networks: NETWORKS,
  };
}
