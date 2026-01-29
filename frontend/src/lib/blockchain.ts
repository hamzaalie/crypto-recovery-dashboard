/**
 * Blockchain Address Validation & Verification Service
 * Uses free APIs to validate and verify crypto addresses
 */

// Address validation patterns for different blockchains
const ADDRESS_PATTERNS = {
  // Bitcoin (Legacy, SegWit, Native SegWit, Taproot)
  bitcoin: /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59}|bc1p[a-zA-HJ-NP-Z0-9]{58})$/,
  
  // Ethereum & EVM chains (ETH, BSC, Polygon, Arbitrum, etc.)
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  
  // Litecoin (Legacy, SegWit)
  litecoin: /^(L[a-km-zA-HJ-NP-Z1-9]{26,33}|M[a-km-zA-HJ-NP-Z1-9]{26,33}|ltc1[a-zA-HJ-NP-Z0-9]{39,59})$/,
  
  // Bitcoin Cash
  bitcoincash: /^(bitcoincash:)?[qp][a-z0-9]{41}$/i,
  
  // Dogecoin
  dogecoin: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/,
  
  // Ripple (XRP)
  ripple: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  
  // Solana
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  
  // Cardano (Shelley era)
  cardano: /^addr1[a-z0-9]{98,}$/,
  
  // Polkadot
  polkadot: /^1[a-zA-Z0-9]{47}$/,
  
  // TRON
  tron: /^T[a-zA-Z0-9]{33}$/,
  
  // Cosmos
  cosmos: /^cosmos1[a-z0-9]{38}$/,
};

// Blockchain explorers (free APIs)
const EXPLORERS = {
  bitcoin: {
    api: 'https://blockchain.info/rawaddr/',
    explorer: 'https://blockchain.info/address/',
  },
  ethereum: {
    api: 'https://api.etherscan.io/api',
    explorer: 'https://etherscan.io/address/',
  },
  litecoin: {
    api: 'https://api.blockcypher.com/v1/ltc/main/addrs/',
    explorer: 'https://blockchair.com/litecoin/address/',
  },
  dogecoin: {
    api: 'https://api.blockcypher.com/v1/doge/main/addrs/',
    explorer: 'https://dogechain.info/address/',
  },
  tron: {
    api: 'https://apilist.tronscan.org/api/account',
    explorer: 'https://tronscan.org/#/address/',
  },
};

export interface AddressValidationResult {
  isValid: boolean;
  blockchain: string | null;
  address: string;
  format: string | null;
  error?: string;
}

export interface AddressVerificationResult extends AddressValidationResult {
  exists: boolean;
  balance?: string;
  transactionCount?: number;
  explorerUrl?: string;
  error?: string;
}

// Detect blockchain type from address format
export function detectBlockchain(address: string): string | null {
  const trimmedAddress = address.trim();
  
  for (const [blockchain, pattern] of Object.entries(ADDRESS_PATTERNS)) {
    if (pattern.test(trimmedAddress)) {
      return blockchain;
    }
  }
  
  return null;
}

// Validate address format only (no network call)
export function validateAddress(address: string): AddressValidationResult {
  const trimmedAddress = address.trim();
  
  if (!trimmedAddress) {
    return {
      isValid: false,
      blockchain: null,
      address: trimmedAddress,
      format: null,
      error: 'Address is empty',
    };
  }
  
  const blockchain = detectBlockchain(trimmedAddress);
  
  if (!blockchain) {
    return {
      isValid: false,
      blockchain: null,
      address: trimmedAddress,
      format: null,
      error: 'Unknown or invalid address format',
    };
  }
  
  // Determine specific format
  let format = 'standard';
  if (blockchain === 'bitcoin') {
    if (trimmedAddress.startsWith('1')) format = 'P2PKH (Legacy)';
    else if (trimmedAddress.startsWith('3')) format = 'P2SH (SegWit)';
    else if (trimmedAddress.startsWith('bc1q')) format = 'Bech32 (Native SegWit)';
    else if (trimmedAddress.startsWith('bc1p')) format = 'Bech32m (Taproot)';
  } else if (blockchain === 'ethereum') {
    format = 'ERC-20 Compatible';
  }
  
  return {
    isValid: true,
    blockchain,
    address: trimmedAddress,
    format,
  };
}

// Verify address exists on blockchain (with optional balance check)
export async function verifyAddress(address: string): Promise<AddressVerificationResult> {
  const validation = validateAddress(address);
  
  if (!validation.isValid) {
    return {
      ...validation,
      exists: false,
    };
  }
  
  const blockchain = validation.blockchain!;
  const explorer = EXPLORERS[blockchain as keyof typeof EXPLORERS];
  
  // If no API available for this blockchain, return validation result only
  if (!explorer) {
    return {
      ...validation,
      exists: true, // Assume exists if format is valid but can't verify
      explorerUrl: getExplorerUrl(blockchain, address),
    };
  }
  
  try {
    let result: Partial<AddressVerificationResult> = {};
    
    // Different API handling for each blockchain
    switch (blockchain) {
      case 'bitcoin': {
        const response = await fetch(`${explorer.api}${address}?limit=0`, {
          signal: AbortSignal.timeout(10000),
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            result = { exists: false };
          } else {
            throw new Error('API request failed');
          }
        } else {
          const data = await response.json();
          result = {
            exists: true,
            balance: (data.final_balance / 100000000).toFixed(8) + ' BTC',
            transactionCount: data.n_tx,
          };
        }
        break;
      }
      
      case 'ethereum': {
        // Using Etherscan free API (no key required for basic requests)
        const response = await fetch(
          `${explorer.api}?module=account&action=balance&address=${address}&tag=latest`,
          { signal: AbortSignal.timeout(10000) }
        );
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        if (data.status === '1') {
          const balanceWei = BigInt(data.result);
          const balanceEth = Number(balanceWei) / 1e18;
          result = {
            exists: true,
            balance: balanceEth.toFixed(6) + ' ETH',
          };
        } else {
          result = { exists: true }; // Address format valid but might be new
        }
        break;
      }
      
      case 'litecoin':
      case 'dogecoin': {
        const response = await fetch(`${explorer.api}${address}/balance`, {
          signal: AbortSignal.timeout(10000),
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            result = { exists: false };
          } else {
            throw new Error('API request failed');
          }
        } else {
          const data = await response.json();
          const symbol = blockchain === 'litecoin' ? 'LTC' : 'DOGE';
          result = {
            exists: true,
            balance: (data.balance / 100000000).toFixed(8) + ` ${symbol}`,
          };
        }
        break;
      }
      
      case 'tron': {
        const response = await fetch(`${explorer.api}?address=${address}`, {
          signal: AbortSignal.timeout(10000),
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        if (data.balance !== undefined) {
          result = {
            exists: true,
            balance: (data.balance / 1000000).toFixed(6) + ' TRX',
          };
        } else {
          result = { exists: true };
        }
        break;
      }
      
      default:
        result = { exists: true };
    }
    
    return {
      ...validation,
      exists: result.exists ?? true,
      balance: result.balance,
      transactionCount: result.transactionCount,
      explorerUrl: explorer.explorer + address,
    };
  } catch (error) {
    // Return validation result without verification on error
    return {
      ...validation,
      exists: true, // Assume valid if API fails
      error: error instanceof Error ? error.message : 'Verification failed',
      explorerUrl: getExplorerUrl(blockchain, address),
    };
  }
}

// Get blockchain explorer URL
export function getExplorerUrl(blockchain: string, address: string): string {
  const urls: Record<string, string> = {
    bitcoin: `https://blockchain.info/address/${address}`,
    ethereum: `https://etherscan.io/address/${address}`,
    litecoin: `https://blockchair.com/litecoin/address/${address}`,
    bitcoincash: `https://blockchair.com/bitcoin-cash/address/${address}`,
    dogecoin: `https://dogechain.info/address/${address}`,
    ripple: `https://xrpscan.com/account/${address}`,
    solana: `https://explorer.solana.com/address/${address}`,
    cardano: `https://cardanoscan.io/address/${address}`,
    polkadot: `https://polkascan.io/polkadot/account/${address}`,
    tron: `https://tronscan.org/#/address/${address}`,
    cosmos: `https://www.mintscan.io/cosmos/account/${address}`,
  };
  
  return urls[blockchain] || '';
}

// Transaction hash validation patterns
const TX_HASH_PATTERNS = {
  bitcoin: /^[a-fA-F0-9]{64}$/,
  ethereum: /^0x[a-fA-F0-9]{64}$/,
  litecoin: /^[a-fA-F0-9]{64}$/,
  dogecoin: /^[a-fA-F0-9]{64}$/,
  tron: /^[a-fA-F0-9]{64}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{88}$/,
};

export interface TransactionValidationResult {
  isValid: boolean;
  blockchain: string | null;
  hash: string;
  error?: string;
}

export interface TransactionVerificationResult extends TransactionValidationResult {
  exists: boolean;
  confirmed: boolean;
  blockNumber?: number;
  timestamp?: string;
  from?: string;
  to?: string;
  value?: string;
  explorerUrl?: string;
}

// Validate transaction hash format
export function validateTransactionHash(hash: string, blockchain?: string): TransactionValidationResult {
  const trimmedHash = hash.trim();
  
  if (!trimmedHash) {
    return {
      isValid: false,
      blockchain: null,
      hash: trimmedHash,
      error: 'Transaction hash is empty',
    };
  }
  
  // If blockchain specified, validate against that pattern
  if (blockchain) {
    const pattern = TX_HASH_PATTERNS[blockchain as keyof typeof TX_HASH_PATTERNS];
    if (!pattern) {
      return {
        isValid: false,
        blockchain,
        hash: trimmedHash,
        error: `Unknown blockchain: ${blockchain}`,
      };
    }
    
    if (!pattern.test(trimmedHash)) {
      return {
        isValid: false,
        blockchain,
        hash: trimmedHash,
        error: `Invalid ${blockchain} transaction hash format`,
      };
    }
    
    return {
      isValid: true,
      blockchain,
      hash: trimmedHash,
    };
  }
  
  // Try to detect blockchain from hash format
  for (const [chain, pattern] of Object.entries(TX_HASH_PATTERNS)) {
    if (pattern.test(trimmedHash)) {
      return {
        isValid: true,
        blockchain: chain,
        hash: trimmedHash,
      };
    }
  }
  
  return {
    isValid: false,
    blockchain: null,
    hash: trimmedHash,
    error: 'Unknown transaction hash format',
  };
}

// Verify transaction exists on blockchain
export async function verifyTransaction(
  hash: string,
  blockchain?: string
): Promise<TransactionVerificationResult> {
  const validation = validateTransactionHash(hash, blockchain);
  
  if (!validation.isValid) {
    return {
      ...validation,
      exists: false,
      confirmed: false,
    };
  }
  
  const chain = validation.blockchain!;
  
  try {
    let result: Partial<TransactionVerificationResult> = {};
    
    switch (chain) {
      case 'bitcoin': {
        const response = await fetch(`https://blockchain.info/rawtx/${hash}`, {
          signal: AbortSignal.timeout(10000),
        });
        
        if (!response.ok) {
          result = { exists: false, confirmed: false };
        } else {
          const data = await response.json();
          result = {
            exists: true,
            confirmed: data.block_height !== undefined,
            blockNumber: data.block_height,
            timestamp: data.time ? new Date(data.time * 1000).toISOString() : undefined,
          };
        }
        break;
      }
      
      case 'ethereum': {
        const response = await fetch(
          `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${hash}`,
          { signal: AbortSignal.timeout(10000) }
        );
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        if (data.status === '1' && data.result) {
          result = {
            exists: true,
            confirmed: data.result.status === '1',
          };
        } else {
          result = { exists: false, confirmed: false };
        }
        break;
      }
      
      default:
        result = { exists: true, confirmed: true };
    }
    
    const explorerUrls: Record<string, string> = {
      bitcoin: `https://blockchain.info/tx/${hash}`,
      ethereum: `https://etherscan.io/tx/${hash}`,
      litecoin: `https://blockchair.com/litecoin/transaction/${hash}`,
      dogecoin: `https://dogechain.info/tx/${hash}`,
      tron: `https://tronscan.org/#/transaction/${hash}`,
      solana: `https://explorer.solana.com/tx/${hash}`,
    };
    
    return {
      ...validation,
      exists: result.exists ?? false,
      confirmed: result.confirmed ?? false,
      blockNumber: result.blockNumber,
      timestamp: result.timestamp,
      from: result.from,
      to: result.to,
      value: result.value,
      explorerUrl: explorerUrls[chain] || undefined,
    };
  } catch (error) {
    return {
      ...validation,
      exists: false,
      confirmed: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

// Helper to format blockchain name for display
export function formatBlockchainName(blockchain: string): string {
  const names: Record<string, string> = {
    bitcoin: 'Bitcoin (BTC)',
    ethereum: 'Ethereum (ETH)',
    litecoin: 'Litecoin (LTC)',
    bitcoincash: 'Bitcoin Cash (BCH)',
    dogecoin: 'Dogecoin (DOGE)',
    ripple: 'Ripple (XRP)',
    solana: 'Solana (SOL)',
    cardano: 'Cardano (ADA)',
    polkadot: 'Polkadot (DOT)',
    tron: 'TRON (TRX)',
    cosmos: 'Cosmos (ATOM)',
  };
  
  return names[blockchain] || blockchain.charAt(0).toUpperCase() + blockchain.slice(1);
}

// Get supported blockchains list
export function getSupportedBlockchains(): { id: string; name: string }[] {
  return Object.keys(ADDRESS_PATTERNS).map(id => ({
    id,
    name: formatBlockchainName(id),
  }));
}
