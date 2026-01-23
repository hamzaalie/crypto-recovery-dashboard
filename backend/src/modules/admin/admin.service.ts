import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UsersService } from '../users/users.service';
import { CasesService } from '../cases/cases.service';
import { TicketsService } from '../tickets/tickets.service';
import { WalletsService } from '../wallets/wallets.service';
import { AuditService } from '../audit/audit.service';
import { Case, CaseStatus } from '../cases/entities/case.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private casesService: CasesService,
    private ticketsService: TicketsService,
    private walletsService: WalletsService,
    private auditService: AuditService,
  ) {}

  async getDashboardStats() {
    const [userStats, caseStats, ticketStats, walletStats] = await Promise.all([
      this.usersService.getStats(),
      this.casesService.getStats(),
      this.ticketsService.getStats(),
      this.walletsService.getStats(),
    ]);

    return {
      users: userStats,
      cases: caseStats,
      tickets: ticketStats,
      wallets: walletStats,
    };
  }

  async getSettings(category?: string) {
    const where = category ? { category } : {};
    return this.settingsRepository.find({ where, order: { key: 'ASC' } });
  }

  async getSetting(key: string) {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async updateSetting(key: string, value: string) {
    let setting = await this.settingsRepository.findOne({ where: { key } });
    
    if (!setting) {
      setting = this.settingsRepository.create({ key, value });
    } else {
      setting.value = value;
    }
    
    return this.settingsRepository.save(setting);
  }

  async updateMultipleSettings(settings: { key: string; value: string }[]) {
    const results = [];
    for (const { key, value } of settings) {
      const result = await this.updateSetting(key, value);
      results.push(result);
    }
    return results;
  }

  async seedDefaultSettings() {
    const defaultSettings = [
      { key: 'site_name', value: 'Crypto Recovery Platform', category: 'general' },
      { key: 'support_email', value: 'support@cryptorecovery.com', category: 'general' },
      { key: 'max_file_size', value: '10485760', category: 'uploads', description: 'Max file size in bytes (10MB)' },
      { key: 'allowed_file_types', value: 'pdf,jpg,jpeg,png,doc,docx', category: 'uploads' },
      { key: 'case_auto_assign', value: 'false', category: 'cases' },
      { key: 'ticket_auto_close_days', value: '7', category: 'tickets' },
      { key: 'two_factor_required', value: 'false', category: 'security' },
      { key: 'session_timeout', value: '3600', category: 'security', description: 'Session timeout in seconds' },
    ];

    for (const setting of defaultSettings) {
      const exists = await this.settingsRepository.findOne({ where: { key: setting.key } });
      if (!exists) {
        await this.settingsRepository.save(setting);
      }
    }
  }

  private getDateRange(period: string): { startDate: Date; endDate: Date } {
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
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  async getReportsOverview(period: string) {
    const { startDate, endDate } = this.getDateRange(period);

    const [caseStats, ticketStats, userStats, walletStats] = await Promise.all([
      this.casesService.getStats(),
      this.ticketsService.getStats(),
      this.usersService.getStats(),
      this.walletsService.getStats(),
    ]);

    // Cases in period
    const casesInPeriod = await this.casesRepository.count({
      where: { createdAt: Between(startDate, endDate) },
    });

    // Tickets in period
    const ticketsInPeriod = await this.ticketsRepository.count({
      where: { createdAt: Between(startDate, endDate) },
    });

    // Users in period
    const usersInPeriod = await this.usersRepository.count({
      where: { createdAt: Between(startDate, endDate) },
    });

    // Recovery amount in period
    const recoveryInPeriod = await this.casesRepository
      .createQueryBuilder('case')
      .select('SUM(case.recoveredAmount)', 'total')
      .where('case.closedAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('case.status = :status', { status: CaseStatus.RECOVERED })
      .getRawOne();

    return {
      period,
      startDate,
      endDate,
      overview: {
        totalCases: caseStats.total,
        casesInPeriod,
        totalTickets: ticketStats.total,
        ticketsInPeriod,
        totalUsers: userStats.total,
        usersInPeriod,
        totalRecovered: caseStats.totalRecovered,
        recoveredInPeriod: recoveryInPeriod?.total || 0,
      },
      stats: {
        cases: caseStats,
        tickets: ticketStats,
        users: userStats,
        wallets: walletStats,
      },
    };
  }

  async getCasesReport(period: string, groupBy: string) {
    const { startDate, endDate } = this.getDateRange(period);

    // Get cases by status
    const byStatus = await this.casesRepository
      .createQueryBuilder('case')
      .select('case.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('case.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('case.status')
      .getRawMany();

    // Get cases by priority
    const byPriority = await this.casesRepository
      .createQueryBuilder('case')
      .select('case.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('case.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('case.priority')
      .getRawMany();

    // Get cases by type
    const byType = await this.casesRepository
      .createQueryBuilder('case')
      .select('case.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('case.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('case.type')
      .getRawMany();

    // Get daily case creation trend
    const dailyTrend = await this.casesRepository
      .createQueryBuilder('case')
      .select("DATE_TRUNC('day', case.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('case.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', case.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      period,
      startDate,
      endDate,
      byStatus,
      byPriority,
      byType,
      dailyTrend,
    };
  }

  async getTicketsReport(period: string, groupBy: string) {
    const { startDate, endDate } = this.getDateRange(period);

    // Get tickets by status
    const byStatus = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('ticket.status')
      .getRawMany();

    // Get tickets by priority
    const byPriority = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('ticket.priority')
      .getRawMany();

    // Get tickets by category
    const byCategory = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('ticket.category')
      .getRawMany();

    // Get daily ticket creation trend
    const dailyTrend = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select("DATE_TRUNC('day', ticket.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', ticket.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      period,
      startDate,
      endDate,
      byStatus,
      byPriority,
      byCategory,
      dailyTrend,
    };
  }

  async getUsersReport(period: string) {
    const { startDate, endDate } = this.getDateRange(period);

    // Get users by role
    const byRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // Get users by status
    const byStatus = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.status')
      .getRawMany();

    // Get new users in period
    const newUsersInPeriod = await this.usersRepository.count({
      where: { createdAt: Between(startDate, endDate) },
    });

    // Get daily user registration trend
    const dailyTrend = await this.usersRepository
      .createQueryBuilder('user')
      .select("DATE_TRUNC('day', user.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', user.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    // Get 2FA adoption
    const twoFactorEnabled = await this.usersRepository.count({
      where: { twoFactorEnabled: true },
    });
    const total = await this.usersRepository.count();

    return {
      period,
      startDate,
      endDate,
      byRole,
      byStatus,
      newUsersInPeriod,
      dailyTrend,
      security: {
        twoFactorEnabled,
        twoFactorDisabled: total - twoFactorEnabled,
        adoptionRate: total > 0 ? ((twoFactorEnabled / total) * 100).toFixed(1) : 0,
      },
    };
  }

  async getRecoveryReport(period: string) {
    const { startDate, endDate } = this.getDateRange(period);

    // Total recovered amount
    const totalRecovered = await this.casesRepository
      .createQueryBuilder('case')
      .select('SUM(case.recoveredAmount)', 'total')
      .where('case.status = :status', { status: CaseStatus.RECOVERED })
      .getRawOne();

    // Recovered in period
    const recoveredInPeriod = await this.casesRepository
      .createQueryBuilder('case')
      .select('SUM(case.recoveredAmount)', 'total')
      .where('case.closedAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('case.status = :status', { status: CaseStatus.RECOVERED })
      .getRawOne();

    // Cases recovered vs total
    const recoveredCases = await this.casesRepository.count({
      where: { status: CaseStatus.RECOVERED },
    });
    const totalCases = await this.casesRepository.count();

    // Recovery by case type
    const byType = await this.casesRepository
      .createQueryBuilder('case')
      .select('case.type', 'type')
      .addSelect('SUM(case.recoveredAmount)', 'amount')
      .addSelect('COUNT(*)', 'count')
      .where('case.status = :status', { status: CaseStatus.RECOVERED })
      .groupBy('case.type')
      .getRawMany();

    // Monthly recovery trend
    const monthlyTrend = await this.casesRepository
      .createQueryBuilder('case')
      .select("DATE_TRUNC('month', case.closedAt)", 'month')
      .addSelect('SUM(case.recoveredAmount)', 'amount')
      .addSelect('COUNT(*)', 'count')
      .where('case.status = :status', { status: CaseStatus.RECOVERED })
      .andWhere('case.closedAt IS NOT NULL')
      .groupBy("DATE_TRUNC('month', case.closedAt)")
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      period,
      startDate,
      endDate,
      totalRecovered: totalRecovered?.total || 0,
      recoveredInPeriod: recoveredInPeriod?.total || 0,
      successRate: totalCases > 0 ? ((recoveredCases / totalCases) * 100).toFixed(1) : 0,
      recoveredCases,
      totalCases,
      byType,
      monthlyTrend,
    };
  }

  async getTrendsReport(period: string) {
    const { startDate, endDate } = this.getDateRange(period);

    // Daily trends for cases, tickets, users
    const caseTrend = await this.casesRepository
      .createQueryBuilder('case')
      .select("DATE_TRUNC('day', case.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('case.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', case.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    const ticketTrend = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select("DATE_TRUNC('day', ticket.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', ticket.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    const userTrend = await this.usersRepository
      .createQueryBuilder('user')
      .select("DATE_TRUNC('day', user.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', user.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      period,
      startDate,
      endDate,
      trends: {
        cases: caseTrend,
        tickets: ticketTrend,
        users: userTrend,
      },
    };
  }

  async exportAuditLogs(startDate?: Date, endDate?: Date) {
    const logs = await this.auditService.findAll(1, 10000, undefined, undefined);
    
    // Filter by date if provided
    let filteredLogs = logs.data;
    if (startDate && endDate) {
      filteredLogs = logs.data.filter(
        log => log.createdAt >= startDate && log.createdAt <= endDate
      );
    }

    return {
      exportedAt: new Date(),
      startDate,
      endDate,
      totalRecords: filteredLogs.length,
      data: filteredLogs,
    };
  }
}
