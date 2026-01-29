import { useTopCryptos, useGlobalMarketData } from '@/hooks/use-coingecko';
import { formatLargeNumber, formatPriceChange } from '@/lib/coingecko';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveMarketWidgetProps {
  compact?: boolean;
  showGlobalStats?: boolean;
}

export function LiveMarketWidget({ compact = false, showGlobalStats = true }: LiveMarketWidgetProps) {
  const { data: cryptos, isLoading, error, refetch, isFetching } = useTopCryptos(compact ? 5 : 10);
  const { data: globalData } = useGlobalMarketData();

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-6 text-center">
          <p className="text-red-600">Failed to load market data</p>
          <button 
            onClick={() => refetch()} 
            className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            <CardTitle className="text-lg">Live Crypto Market</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Real-time
            </span>
            <button 
              onClick={() => refetch()}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              disabled={isFetching}
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </button>
          </div>
        </div>
        
        {/* Global Market Stats */}
        {showGlobalStats && globalData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-gray-400">Market Cap</p>
              <p className="font-semibold text-sm">{formatLargeNumber(globalData.total_market_cap?.usd || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">24h Volume</p>
              <p className="font-semibold text-sm">{formatLargeNumber(globalData.total_volume?.usd || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">BTC Dominance</p>
              <p className="font-semibold text-sm">{globalData.market_cap_percentage?.btc?.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">24h Change</p>
              <p className={cn(
                "font-semibold text-sm",
                (globalData.market_cap_change_percentage_24h_usd || 0) >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {(globalData.market_cap_change_percentage_24h_usd || 0) >= 0 ? '+' : ''}
                {globalData.market_cap_change_percentage_24h_usd?.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-2 text-sm">Loading market data...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Asset</div>
              <div className="col-span-3 text-right">Price</div>
              <div className="col-span-2 text-right">24h</div>
              <div className="col-span-2 text-right hidden sm:block">Market Cap</div>
            </div>
            
            {/* Crypto Rows */}
            {cryptos?.map((crypto, index) => {
              const priceChange = formatPriceChange(crypto.price_change_percentage_24h);
              
              return (
                <div 
                  key={crypto.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Rank */}
                  <div className="col-span-1 text-sm text-gray-400 font-medium">
                    {crypto.market_cap_rank || index + 1}
                  </div>
                  
                  {/* Asset */}
                  <div className="col-span-4 flex items-center gap-2">
                    <img 
                      src={crypto.image} 
                      alt={crypto.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{crypto.name}</p>
                      <p className="text-xs text-gray-500 uppercase">{crypto.symbol}</p>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="col-span-3 text-right">
                    <p className="font-mono font-semibold text-gray-900">
                      ${crypto.current_price < 1 
                        ? crypto.current_price.toFixed(4) 
                        : crypto.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  {/* 24h Change */}
                  <div className="col-span-2 text-right">
                    <span className={cn(
                      "inline-flex items-center gap-0.5 font-medium text-sm px-2 py-0.5 rounded-full",
                      priceChange.isPositive 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    )}>
                      {priceChange.isPositive 
                        ? <TrendingUp className="h-3 w-3" /> 
                        : <TrendingDown className="h-3 w-3" />
                      }
                      {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Market Cap */}
                  <div className="col-span-2 text-right hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {formatLargeNumber(crypto.market_cap)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Data from CoinGecko API • Updates every minute
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Mini sparkline-style price chart
 */
export function MiniPriceChart({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-20 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

export default LiveMarketWidget;
