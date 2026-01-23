import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ticket } from './ticket.entity';

@Entity('ticket_messages')
export class TicketMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('text')
  message: string;

  @Column({ default: false })
  isStaff: boolean;

  @Column('simple-array', { nullable: true })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;
}
