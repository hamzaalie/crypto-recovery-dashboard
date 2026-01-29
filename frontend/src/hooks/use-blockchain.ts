/**
 * React hooks for blockchain address and transaction validation
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  validateAddress,
  verifyAddress,
  validateTransactionHash,
  verifyTransaction,
  AddressValidationResult,
  AddressVerificationResult,
  TransactionValidationResult,
  TransactionVerificationResult,
} from '@/lib/blockchain';

/**
 * Hook to validate an address format (no network call)
 */
export function useAddressValidation(address: string): AddressValidationResult | null {
  if (!address || address.trim().length < 10) {
    return null;
  }
  return validateAddress(address);
}

/**
 * Hook to verify an address on the blockchain
 */
export function useAddressVerification(address: string, enabled = true) {
  return useQuery<AddressVerificationResult>({
    queryKey: ['address-verification', address],
    queryFn: () => verifyAddress(address),
    enabled: enabled && !!address && address.trim().length >= 10,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });
}

/**
 * Hook to verify address on demand (mutation)
 */
export function useVerifyAddressMutation() {
  return useMutation<AddressVerificationResult, Error, string>({
    mutationFn: (address: string) => verifyAddress(address),
  });
}

/**
 * Hook to validate transaction hash format
 */
export function useTransactionValidation(
  hash: string,
  blockchain?: string
): TransactionValidationResult | null {
  if (!hash || hash.trim().length < 20) {
    return null;
  }
  return validateTransactionHash(hash, blockchain);
}

/**
 * Hook to verify a transaction on the blockchain
 */
export function useTransactionVerification(hash: string, blockchain?: string, enabled = true) {
  return useQuery<TransactionVerificationResult>({
    queryKey: ['transaction-verification', hash, blockchain],
    queryFn: () => verifyTransaction(hash, blockchain),
    enabled: enabled && !!hash && hash.trim().length >= 20,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (transactions don't change)
    retry: 1,
  });
}

/**
 * Hook to verify transaction on demand (mutation)
 */
export function useVerifyTransactionMutation() {
  return useMutation<TransactionVerificationResult, Error, { hash: string; blockchain?: string }>({
    mutationFn: ({ hash, blockchain }) => verifyTransaction(hash, blockchain),
  });
}
