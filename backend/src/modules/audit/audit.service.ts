import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

interface CreateAuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(params: CreateAuditLogParams): Promise<AuditLog> {
    const auditLog = this.auditRepository.create(params);
    return this.auditRepository.save(auditLog);
  }

  async findAll(page = 1, limit = 20, action?: AuditAction, userId?: string) {
    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [logs, total] = await this.auditRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const [logs, total] = await this.auditRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.auditRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const total = await this.auditRepository.count({ where });

    const byAction = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where(where.createdAt ? 'audit.createdAt BETWEEN :start AND :end' : '1=1', {
        start: startDate,
        end: endDate,
      })
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    return { total, byAction };
  }
}
