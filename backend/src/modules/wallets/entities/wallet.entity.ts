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
  LITECOIN = 'litecoin',
  RIPPLE = 'ripple',
  DOGECOIN = 'dogecoin',
  OTHER = 'other',
}

export enum WalletStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: WalletType })
  type: WalletType;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.PENDING })
  status: WalletStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
