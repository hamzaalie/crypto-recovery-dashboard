/**
 * CoinGecko API Service
 * Free public API - No API key required
 * Rate limit: 10-30 calls/minute for free tier
 */

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
  last_updated: string;
}

export interface GlobalMarketData {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
  active_cryptocurrencies: number;
}

// CoinGecko API base URL
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Supported coins mapping (wallet type -> coingecko id)
export const COIN_IDS: Record<string, string> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  usdt: 'tether',
  usdc: 'usd-coin',
  bnb: 'binancecoin',
  solana: 'solana',
  xrp: 'ripple',
  cardano: 'cardano',
  dogecoin: 'dogecoin',
  polygon: 'matic-network',
  avalanche: 'avalanche-2',
  polkadot: 'polkadot',
  litecoin: 'litecoin',
  chainlink: 'chainlink',
  tron: 'tron',
};

// Cache for API responses
const cache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute cache

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data as T;
}

/**
 * Get prices for multiple cryptocurrencies
 */
export async function getCryptoPrices(
  coinIds: string[] = Object.values(COIN_IDS),
  options: { sparkline?: boolean; priceChange7d?: boolean } = {}
): Promise<CryptoPrice[]> {
  const ids = coinIds.join(',');
  const sparkline = options.sparkline ? 'true' : 'false';
  const priceChange = options.priceChange7d ? '7d' : '24h';
  
  const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=${sparkline}&price_change_percentage=${priceChange}`;
  
  return fetchWithCache<CryptoPrice[]>(url, `prices-${ids}-${sparkline}`);
}

/**
 * Get top cryptocurrencies by market cap
 */
export async function getTopCryptos(limit: number = 10): Promise<CryptoPrice[]> {
  const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h,7d`;
  
  return fetchWithCache<CryptoPrice[]>(url, `top-${limit}`);
}

/**
 * Get global market data
 */
export async function getGlobalMarketData(): Promise<GlobalMarketData> {
  const url = `${COINGECKO_API}/global`;
  const response = await fetchWithCache<{ data: GlobalMarketData }>(url, 'global');
  return response.data;
}

/**
 * Get simple price for specific coins
 */
export async function getSimplePrices(
  coinIds: string[]
): Promise<Record<string, { usd: number; usd_24h_change: number }>> {
  const ids = coinIds.join(',');
  const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  
  return fetchWithCache(url, `simple-${ids}`);
}

/**
 * Get price for a specific wallet type
 */
export function getCoinGeckoId(walletType: string): string | undefined {
  return COIN_IDS[walletType.toLowerCase()];
}

/**
 * Format large numbers (market cap, volume)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Format price change percentage
 */
export function formatPriceChange(change: number): {
  text: string;
  isPositive: boolean;
  color: string;
} {
  const isPositive = change >= 0;
  return {
    text: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
    isPositive,
    color: isPositive ? 'text-green-500' : 'text-red-500',
  };
}
