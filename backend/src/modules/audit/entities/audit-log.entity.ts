import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  // User actions
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  PASSWORD_CHANGE = 'password_change',
  TWO_FA_ENABLE = '2fa_enable',
  TWO_FA_DISABLE = '2fa_disable',

  // Case actions
  CASE_CREATE = 'case_create',
  CASE_UPDATE = 'case_update',
  CASE_STATUS_CHANGE = 'case_status_change',
  CASE_ASSIGN = 'case_assign',

  // Ticket actions
  TICKET_CREATE = 'ticket_create',
  TICKET_UPDATE = 'ticket_update',
  TICKET_REPLY = 'ticket_reply',
  TICKET_CLOSE = 'ticket_close',

  // Wallet actions
  WALLET_CREATE = 'wallet_create',
  WALLET_UPDATE = 'wallet_update',
  WALLET_DELETE = 'wallet_delete',

  // Admin actions
  ADMIN_USER_UPDATE = 'admin_user_update',
  ADMIN_SETTINGS_UPDATE = 'admin_settings_update',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column('jsonb', { nullable: true })
  details: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
