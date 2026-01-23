import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import {
  CreateTicketDto,
  UpdateTicketDto,
  AdminUpdateTicketDto,
  CreateTicketMessageDto,
} from './dto/ticket.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(TicketMessage)
    private messagesRepository: Repository<TicketMessage>,
  ) {}

  async create(userId: string, createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      userId,
    });
    const savedTicket = await this.ticketsRepository.save(ticket);

    // Create initial message
    await this.messagesRepository.save({
      ticketId: savedTicket.id,
      userId,
      message: createTicketDto.message,
      isStaff: false,
    });

    return savedTicket;
  }

  async findAll(page = 1, limit = 10, status?: TicketStatus) {
    const where: any = {};
    if (status) where.status = status;

    const [tickets, total] = await this.ticketsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'assignedTo'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [tickets, total] = await this.ticketsRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAssigned(agentId: string, page = 1, limit = 10) {
    const [tickets, total] = await this.ticketsRepository.findAndCount({
      where: { assignedToId: agentId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['user', 'assignedTo', 'case'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async getMessages(ticketId: string) {
    return this.messagesRepository.find({
      where: { ticketId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async addMessage(
    ticketId: string,
    userId: string,
    userRole: UserRole,
    createMessageDto: CreateTicketMessageDto,
  ): Promise<TicketMessage> {
    const ticket = await this.findOne(ticketId);

    // Check access
    const isStaff = userRole === UserRole.ADMIN || userRole === UserRole.SUPPORT_AGENT;
    if (!isStaff && ticket.userId !== userId) {
      throw new ForbiddenException('You can only reply to your own tickets');
    }

    const message = this.messagesRepository.create({
      ticketId,
      userId,
      message: createMessageDto.message,
      attachments: createMessageDto.attachments,
      isStaff,
    });

    // Update ticket status
    if (isStaff) {
      ticket.status = TicketStatus.AWAITING_RESPONSE;
    } else {
      ticket.status = TicketStatus.OPEN;
    }
    await this.ticketsRepository.save(ticket);

    return this.messagesRepository.save(message);
  }

  async update(id: string, userId: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    if (ticket.userId !== userId) {
      throw new ForbiddenException('You can only update your own tickets');
    }
    Object.assign(ticket, updateTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async adminUpdate(id: string, updateDto: AdminUpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (updateDto.status === TicketStatus.RESOLVED || updateDto.status === TicketStatus.CLOSED) {
      ticket.resolvedAt = new Date();
    }

    Object.assign(ticket, updateDto);
    return this.ticketsRepository.save(ticket);
  }

  async assignTicket(id: string, agentId: string): Promise<Ticket> {
    const ticket = await this.findOne(id);
    ticket.assignedToId = agentId;
    ticket.status = TicketStatus.IN_PROGRESS;
    return this.ticketsRepository.save(ticket);
  }

  async getStats() {
    const total = await this.ticketsRepository.count();
    const open = await this.ticketsRepository.count({ where: { status: TicketStatus.OPEN } });
    const inProgress = await this.ticketsRepository.count({ where: { status: TicketStatus.IN_PROGRESS } });
    const resolved = await this.ticketsRepository.count({ where: { status: TicketStatus.RESOLVED } });
    
    // Tickets this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await this.ticketsRepository.count({
      where: { createdAt: MoreThan(startOfMonth) },
    });

    const byCategory = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.category')
      .getRawMany();

    return { total, open, inProgress, resolved, newThisMonth, byCategory };
  }

  async findAllAdmin(page = 1, limit = 10, filters: { search?: string; status?: TicketStatus; priority?: string; sort?: string } = {}) {
    const queryBuilder = this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo');

    if (filters.search) {
      queryBuilder.andWhere(
        '(ticket.ticketNumber LIKE :search OR ticket.subject LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    
    if (filters.status) {
      queryBuilder.andWhere('ticket.status = :status', { status: filters.status });
    }
    
    if (filters.priority) {
      queryBuilder.andWhere('ticket.priority = :priority', { priority: filters.priority });
    }

    // Handle sorting
    if (filters.sort) {
      const [field, order] = filters.sort.split(':');
      queryBuilder.orderBy(`ticket.${field}`, order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    } else {
      queryBuilder.orderBy('ticket.createdAt', 'DESC');
    }

    const total = await queryBuilder.getCount();
    const tickets = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
