import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  CASE_CREATED = 'case_created',
  CASE_STATUS_UPDATE = 'case_status_update',
  TICKET_CREATED = 'ticket_created',
  TICKET_REPLY = 'ticket_reply',
  TWO_FA_ENABLED = '2fa_enabled',
  VERIFICATION = 'verification',
}

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EmailTemplateType, unique: true })
  type: EmailTemplateType;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column('text')
  htmlContent: string;

  @Column('text', { nullable: true })
  textContent: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
