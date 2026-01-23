import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { Case, CaseStatus, CasePriority } from '../cases/entities/case.entity';
import { Ticket, TicketStatus, TicketPriority } from '../tickets/entities/ticket.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async getStats(agentId: string) {
    const assignedCases = await this.casesRepository.count({ where: { assignedToId: agentId } });
    const activeCases = await this.casesRepository.count({
      where: {
        assignedToId: agentId,
        status: CaseStatus.IN_PROGRESS,
      },
    });
    const resolvedCases = await this.casesRepository.count({
      where: {
        assignedToId: agentId,
        status: CaseStatus.RECOVERED,
      },
    });

    const assignedTickets = await this.ticketsRepository.count({ where: { assignedToId: agentId } });
    const openTickets = await this.ticketsRepository.count({
      where: {
        assignedToId: agentId,
        status: TicketStatus.OPEN,
      },
    });
    const resolvedTickets = await this.ticketsRepository.count({
      where: {
        assignedToId: agentId,
        status: TicketStatus.RESOLVED,
      },
    });

    // Calculate this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const casesClosedThisMonth = await this.casesRepository.count({
      where: {
        assignedToId: agentId,
        closedAt: MoreThan(startOfMonth),
      },
    });

    const ticketsResolvedThisMonth = await this.ticketsRepository.count({
      where: {
        assignedToId: agentId,
        status: TicketStatus.RESOLVED,
        updatedAt: MoreThan(startOfMonth),
      },
    });

    // Calculate total recovered amount
    const recoveredAmount = await this.casesRepository
      .createQueryBuilder('case')
      .select('SUM(case.recoveredAmount)', 'total')
      .where('case.assignedToId = :agentId', { agentId })
      .andWhere('case.status = :status', { status: CaseStatus.RECOVERED })
      .getRawOne();

    return {
      cases: {
        total: assignedCases,
        active: activeCases,
        resolved: resolvedCases,
        closedThisMonth: casesClosedThisMonth,
      },
      tickets: {
        total: assignedTickets,
        open: openTickets,
        resolved: resolvedTickets,
        resolvedThisMonth: ticketsResolvedThisMonth,
      },
      performance: {
        totalRecovered: recoveredAmount?.total || 0,
        casesClosedThisMonth,
        ticketsResolvedThisMonth,
      },
    };
  }

  async getDashboard(agentId: string) {
    const stats = await this.getStats(agentId);

    // Get recent cases
    const recentCases = await this.casesRepository.find({
      where: { assignedToId: agentId },
      relations: ['user'],
      order: { updatedAt: 'DESC' },
      take: 5,
    });

    // Get recent tickets
    const recentTickets = await this.ticketsRepository.find({
      where: { assignedToId: agentId },
      relations: ['user'],
      order: { updatedAt: 'DESC' },
      take: 5,
    });

    // Get urgent items (high priority)
    const urgentCases = await this.casesRepository.find({
      where: {
        assignedToId: agentId,
        priority: CasePriority.URGENT,
        status: CaseStatus.IN_PROGRESS,
      },
      relations: ['user'],
      take: 5,
    });

    const urgentTickets = await this.ticketsRepository.find({
      where: {
        assignedToId: agentId,
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
      },
      relations: ['user'],
      take: 5,
    });

    return {
      stats,
      recentCases,
      recentTickets,
      urgentItems: {
        cases: urgentCases,
        tickets: urgentTickets,
      },
    };
  }

  async getAssignedCases(agentId: string, page = 1, limit = 10, status?: CaseStatus) {
    const where: any = { assignedToId: agentId };
    if (status) where.status = status;

    const [cases, total] = await this.casesRepository.findAndCount({
      where,
      relations: ['user'],
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: cases,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAssignedCase(agentId: string, caseId: string) {
    const caseEntity = await this.casesRepository.findOne({
      where: { id: caseId },
      relations: ['user', 'assignedTo'],
    });

    if (!caseEntity) {
      throw new NotFoundException('Case not found');
    }

    if (caseEntity.assignedToId !== agentId) {
      throw new ForbiddenException('You are not assigned to this case');
    }

    return caseEntity;
  }

  async updateAssignedCase(
    agentId: string,
    caseId: string,
    updateDto: { status?: CaseStatus; notes?: string; recoveredAmount?: number },
  ) {
    const caseEntity = await this.getAssignedCase(agentId, caseId);

    if (updateDto.status) {
      caseEntity.status = updateDto.status;
      if (updateDto.status === CaseStatus.CLOSED || updateDto.status === CaseStatus.RECOVERED) {
        caseEntity.closedAt = new Date();
      }
    }

    if (updateDto.notes) {
      caseEntity.internalNotes = updateDto.notes;
    }

    if (updateDto.recoveredAmount !== undefined) {
      caseEntity.recoveredAmount = updateDto.recoveredAmount;
    }

    return this.casesRepository.save(caseEntity);
  }

  async getAssignedTickets(agentId: string, page = 1, limit = 10, status?: TicketStatus) {
    const where: any = { assignedToId: agentId };
    if (status) where.status = status;

    const [tickets, total] = await this.ticketsRepository.findAndCount({
      where,
      relations: ['user'],
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAssignedTicket(agentId: string, ticketId: string) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['user', 'assignedTo'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.assignedToId !== agentId) {
      throw new ForbiddenException('You are not assigned to this ticket');
    }

    return ticket;
  }

  async updateAssignedTicket(
    agentId: string,
    ticketId: string,
    updateDto: { status?: TicketStatus; priority?: string },
  ) {
    const ticket = await this.getAssignedTicket(agentId, ticketId);

    if (updateDto.status) {
      ticket.status = updateDto.status;
      if (updateDto.status === TicketStatus.RESOLVED || updateDto.status === TicketStatus.CLOSED) {
        ticket.resolvedAt = new Date();
      }
    }

    if (updateDto.priority) {
      ticket.priority = updateDto.priority as TicketPriority;
    }

    return this.ticketsRepository.save(ticket);
  }

  async getPerformanceMetrics(agentId: string, period: string) {
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Cases closed in period
    const casesClosed = await this.casesRepository.count({
      where: {
        assignedToId: agentId,
        closedAt: Between(startDate, endDate),
      },
    });

    // Tickets resolved in period
    const ticketsResolved = await this.ticketsRepository.count({
      where: {
        assignedToId: agentId,
        status: TicketStatus.RESOLVED,
        updatedAt: Between(startDate, endDate),
      },
    });

    // Total recovered in period
    const recovered = await this.casesRepository
      .createQueryBuilder('case')
      .select('SUM(case.recoveredAmount)', 'total')
      .where('case.assignedToId = :agentId', { agentId })
      .andWhere('case.closedAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('case.status = :status', { status: CaseStatus.RECOVERED })
      .getRawOne();

    // Average resolution time (for cases)
    const avgResolutionTime = await this.casesRepository
      .createQueryBuilder('case')
      .select('AVG(EXTRACT(EPOCH FROM (case.closedAt - case.createdAt)))', 'avgSeconds')
      .where('case.assignedToId = :agentId', { agentId })
      .andWhere('case.closedAt IS NOT NULL')
      .andWhere('case.closedAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .getRawOne();

    return {
      period,
      startDate,
      endDate,
      metrics: {
        casesClosed,
        ticketsResolved,
        totalRecovered: recovered?.total || 0,
        avgResolutionTimeHours: avgResolutionTime?.avgSeconds 
          ? Math.round(parseFloat(avgResolutionTime.avgSeconds) / 3600) 
          : 0,
      },
    };
  }
}
