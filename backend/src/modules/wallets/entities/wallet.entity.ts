import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum WalletType {
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
  USDT = 'usdt',
  USDC = 'usdc',
  BNB = 'bnb',
  SOLANA = 'solana',
  XRP = 'xrp',
  CARDANO = 'cardano',
  DOGECOIN = 'dogecoin',
  OTHER = 'other',
}

export enum WalletStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  PENDING = 'pending',
}

// Crypto symbols and their current approximate USD prices (should be fetched from API in production)
export const CRYPTO_INFO: Record<string, { symbol: string; name: string; icon: string }> = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  ethereum: { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  usdt: { symbol: 'USDT', name: 'Tether', icon: '₮' },
  usdc: { symbol: 'USDC', name: 'USD Coin', icon: '$' },
  bnb: { symbol: 'BNB', name: 'BNB', icon: 'B' },
  solana: { symbol: 'SOL', name: 'Solana', icon: '◎' },
  xrp: { symbol: 'XRP', name: 'Ripple', icon: 'X' },
  cardano: { symbol: 'ADA', name: 'Cardano', icon: '₳' },
  dogecoin: { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
  other: { symbol: 'CRYPTO', name: 'Other', icon: '¤' },
};

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: WalletType })
  type: WalletType;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  tokenBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  usdValue: number;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
