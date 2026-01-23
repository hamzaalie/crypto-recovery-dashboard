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

export enum CaseStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  RECOVERED = 'recovered',
  PARTIALLY_RECOVERED = 'partially_recovered',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum CaseType {
  LOST_ACCESS = 'lost_access',
  SCAM = 'scam',
  THEFT = 'theft',
  EXCHANGE_ISSUE = 'exchange_issue',
  WALLET_RECOVERY = 'wallet_recovery',
  OTHER = 'other',
}

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: CaseType })
  type: CaseType;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.PENDING })
  status: CaseStatus;

  @Column({ type: 'enum', enum: CasePriority, default: CasePriority.MEDIUM })
  priority: CasePriority;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  estimatedLoss: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  recoveredAmount: number;

  @Column({ nullable: true })
  walletAddress: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column('simple-array', { nullable: true })
  attachments: string[];

  @Column('text', { nullable: true })
  internalNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  closedAt: Date;
}
