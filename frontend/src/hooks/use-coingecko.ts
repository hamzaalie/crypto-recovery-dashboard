import { useQuery } from '@tanstack/react-query';
import {
  getCryptoPrices,
  getTopCryptos,
  getGlobalMarketData,
  getSimplePrices,
  getCoinGeckoId,
  CryptoPrice,
  GlobalMarketData,
  COIN_IDS,
} from '@/lib/coingecko';

/**
 * Hook to fetch top cryptocurrencies with market data
 */
export function useTopCryptos(limit: number = 10) {
  return useQuery<CryptoPrice[]>({
    queryKey: ['coingecko', 'top-cryptos', limit],
    queryFn: () => getTopCryptos(limit),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Auto refresh every minute
    retry: 2,
  });
}

/**
 * Hook to fetch prices for specific coins
 */
export function useCryptoPrices(coinIds?: string[], options?: { sparkline?: boolean }) {
  const ids = coinIds || Object.values(COIN_IDS);
  
  return useQuery<CryptoPrice[]>({
    queryKey: ['coingecko', 'prices', ids, options],
    queryFn: () => getCryptoPrices(ids, options),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 2,
    enabled: ids.length > 0,
  });
}

/**
 * Hook to fetch global market data
 */
export function useGlobalMarketData() {
  return useQuery<GlobalMarketData>({
    queryKey: ['coingecko', 'global'],
    queryFn: getGlobalMarketData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to get simple prices for wallet types
 */
export function useWalletPrices(walletTypes: string[]) {
  const coinIds = walletTypes
    .map((type) => getCoinGeckoId(type))
    .filter((id): id is string => id !== undefined);

  return useQuery({
    queryKey: ['coingecko', 'simple', coinIds],
    queryFn: () => getSimplePrices(coinIds),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 2,
    enabled: coinIds.length > 0,
  });
}

/**
 * Hook to calculate wallet values using live prices
 */
export function useWalletWithLivePrices(
  wallets: Array<{ type: string; tokenBalance: number }> | undefined
) {
  const walletTypes = wallets?.map((w) => w.type) || [];
  const uniqueTypes = [...new Set(walletTypes)];
  
  const coinIds = uniqueTypes
    .map((type) => getCoinGeckoId(type))
    .filter((id): id is string => id !== undefined);

  const { data: prices, isLoading, error } = useQuery({
    queryKey: ['coingecko', 'wallet-prices', coinIds],
    queryFn: () => getCryptoPrices(coinIds),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled: coinIds.length > 0,
  });

  // Map prices to wallet types
  const priceMap = new Map<string, CryptoPrice>();
  prices?.forEach((p) => {
    priceMap.set(p.id, p);
  });

  // Calculate live values for each wallet
  const walletsWithLivePrices = wallets?.map((wallet) => {
    const coinId = getCoinGeckoId(wallet.type);
    const priceData = coinId ? priceMap.get(coinId) : undefined;
    
    return {
      ...wallet,
      livePrice: priceData?.current_price || 0,
      liveUsdValue: priceData 
        ? wallet.tokenBalance * priceData.current_price 
        : wallet.tokenBalance * (wallet as any).usdValue / wallet.tokenBalance || 0,
      priceChange24h: priceData?.price_change_percentage_24h || 0,
      priceData,
    };
  });

  const totalLiveValue = walletsWithLivePrices?.reduce(
    (sum, w) => sum + w.liveUsdValue,
    0
  ) || 0;

  return {
    wallets: walletsWithLivePrices,
    totalValue: totalLiveValue,
    prices,
    isLoading,
    error,
  };
}
