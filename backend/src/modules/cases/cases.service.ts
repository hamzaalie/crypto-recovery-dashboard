import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan, FindOptionsWhere } from 'typeorm';
import { Case, CaseStatus, CasePriority } from './entities/case.entity';
import { CreateCaseDto, UpdateCaseDto, AdminUpdateCaseDto, AdminCreateCaseDto } from './dto/case.dto';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
  ) {}

  async create(userId: string, createCaseDto: CreateCaseDto): Promise<Case> {
    const caseEntity = this.casesRepository.create({
      ...createCaseDto,
      userId,
    });
    return this.casesRepository.save(caseEntity);
  }

  async adminCreate(createDto: AdminCreateCaseDto): Promise<Case> {
    const caseEntity = this.casesRepository.create({
      title: createDto.title,
      description: createDto.description,
      type: createDto.type,
      priority: createDto.priority || CasePriority.MEDIUM,
      estimatedLoss: createDto.estimatedLoss || 0,
      walletAddress: createDto.walletAddress || null,
      userId: createDto.userId,
      assignedToId: createDto.assignedToId || null,
    });
    return this.casesRepository.save(caseEntity);
  }

  async findAll(page = 1, limit = 10, status?: CaseStatus) {
    const where: any = {};
    if (status) where.status = status;

    const [cases, total] = await this.casesRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'assignedTo'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: cases,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [cases, total] = await this.casesRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: cases,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAssigned(agentId: string, page = 1, limit = 10) {
    const [cases, total] = await this.casesRepository.findAndCount({
      where: { assignedToId: agentId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: cases,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Case> {
    const caseEntity = await this.casesRepository.findOne({
      where: { id },
      relations: ['user', 'assignedTo'],
    });
    if (!caseEntity) throw new NotFoundException('Case not found');
    return caseEntity;
  }

  async update(id: string, userId: string, updateCaseDto: UpdateCaseDto): Promise<Case> {
    const caseEntity = await this.findOne(id);
    if (caseEntity.userId !== userId) {
      throw new ForbiddenException('You can only update your own cases');
    }
    Object.assign(caseEntity, updateCaseDto);
    return this.casesRepository.save(caseEntity);
  }

  async adminUpdate(id: string, updateDto: AdminUpdateCaseDto): Promise<Case> {
    const caseEntity = await this.findOne(id);
    
    if (updateDto.status === CaseStatus.CLOSED || updateDto.status === CaseStatus.REJECTED) {
      caseEntity.closedAt = new Date();
    }
    
    Object.assign(caseEntity, updateDto);
    return this.casesRepository.save(caseEntity);
  }

  async assignCase(id: string, agentId: string): Promise<Case> {
    const caseEntity = await this.findOne(id);
    caseEntity.assignedToId = agentId;
    caseEntity.status = CaseStatus.UNDER_REVIEW;
    return this.casesRepository.save(caseEntity);
  }

  async getStats() {
    const total = await this.casesRepository.count();
    const pending = await this.casesRepository.count({ where: { status: CaseStatus.PENDING } });
    const inProgress = await this.casesRepository.count({ where: { status: CaseStatus.IN_PROGRESS } });
    const recovered = await this.casesRepository.count({ where: { status: CaseStatus.RECOVERED } });
    const closed = await this.casesRepository.count({ where: { status: CaseStatus.CLOSED } });
    
    // Active cases = not closed, not rejected
    const active = await this.casesRepository
      .createQueryBuilder('case')
      .where('case.status NOT IN (:...statuses)', { statuses: [CaseStatus.CLOSED, CaseStatus.REJECTED] })
      .getCount();
    
    // Cases this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await this.casesRepository.count({
      where: { createdAt: MoreThan(startOfMonth) },
    });

    const byPriority = await this.casesRepository
      .createQueryBuilder('case')
      .select('case.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.priority')
      .getRawMany();

    const totalRecovered = await this.casesRepository
      .createQueryBuilder('case')
      .select('SUM(case.recoveredAmount)', 'total')
      .getRawOne();

    return {
      total,
      active,
      pending,
      inProgress,
      recovered,
      closed,
      newThisMonth,
      byPriority,
      totalRecovered: totalRecovered?.total || 0,
    };
  }

  async findAllAdmin(page = 1, limit = 10, filters: { search?: string; status?: CaseStatus; priority?: string; sort?: string } = {}) {
    const queryBuilder = this.casesRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.user', 'user')
      .leftJoinAndSelect('case.assignedTo', 'assignedTo');

    if (filters.search) {
      queryBuilder.andWhere(
        '(case.caseNumber LIKE :search OR case.description LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    
    if (filters.status) {
      queryBuilder.andWhere('case.status = :status', { status: filters.status });
    }
    
    if (filters.priority) {
      queryBuilder.andWhere('case.priority = :priority', { priority: filters.priority });
    }

    // Handle sorting
    if (filters.sort) {
      const [field, order] = filters.sort.split(':');
      queryBuilder.orderBy(`case.${field}`, order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    } else {
      queryBuilder.orderBy('case.createdAt', 'DESC');
    }

    const total = await queryBuilder.getCount();
    const cases = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: cases,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserStats(userId: string) {
    const total = await this.casesRepository.count({ where: { userId } });
    const pending = await this.casesRepository.count({ where: { userId, status: CaseStatus.PENDING } });
    const inProgress = await this.casesRepository.count({ where: { userId, status: CaseStatus.IN_PROGRESS } });
    const recovered = await this.casesRepository.count({ where: { userId, status: CaseStatus.RECOVERED } });

    return { total, pending, inProgress, recovered };
  }
}
