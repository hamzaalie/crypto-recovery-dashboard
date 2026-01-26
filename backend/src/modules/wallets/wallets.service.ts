import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import { WalletRequest, RequestStatus, RequestType } from './entities/wallet-request.entity';
import { CreateWalletDto, UpdateWalletDto, CreateWalletRequestDto, UpdateWalletRequestDto } from './dto/wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(WalletRequest)
    private walletRequestsRepository: Repository<WalletRequest>,
  ) {}

  // Admin creates wallet for user
  async create(createWalletDto: CreateWalletDto): Promise<Wallet> {
    // Check if user already has this currency type
    const existing = await this.walletsRepository.findOne({
      where: { userId: createWalletDto.userId, type: createWalletDto.type },
    });
    if (existing) {
      throw new BadRequestException('User already has a wallet of this currency type');
    }

    const wallet = this.walletsRepository.create(createWalletDto);
    return this.walletsRepository.save(wallet);
  }

  // Get all wallets (admin)
  async findAll(page = 1, limit = 10) {
    const [wallets, total] = await this.walletsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: wallets,
      total,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get user's wallets
  async findByUser(userId: string) {
    const wallets = await this.walletsRepository.find({
      where: { userId },
      order: { type: 'ASC' },
    });
    return wallets;
  }

  async findOne(id: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  // Admin updates wallet
  async update(id: string, updateWalletDto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOne(id);
    Object.assign(wallet, updateWalletDto);
    return this.walletsRepository.save(wallet);
  }

  async adminUpdate(id: string, updateDto: UpdateWalletDto): Promise<Wallet> {
    return this.update(id, updateDto);
  }

  // Admin removes wallet
  async remove(id: string): Promise<void> {
    const wallet = await this.findOne(id);
    await this.walletsRepository.remove(wallet);
  }

  async adminRemove(id: string): Promise<void> {
    return this.remove(id);
  }

  // Get wallet stats
  async getStats() {
    const total = await this.walletsRepository.count();
    const active = await this.walletsRepository.count({ where: { status: WalletStatus.ACTIVE } });
    const frozen = await this.walletsRepository.count({ where: { status: WalletStatus.FROZEN } });
    
    const totalValue = await this.walletsRepository
      .createQueryBuilder('wallet')
      .select('SUM(wallet.usdValue)', 'total')
      .getRawOne();

    const byType = await this.walletsRepository
      .createQueryBuilder('wallet')
      .select('wallet.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(wallet.usdValue)', 'totalValue')
      .groupBy('wallet.type')
      .getRawMany();

    const pendingRequests = await this.walletRequestsRepository.count({
      where: { status: RequestStatus.PENDING },
    });

    return { total, active, frozen, totalUsdValue: totalValue?.total || 0, byType, pendingRequests };
  }

  // Admin search wallets
  async findAllAdmin(page = 1, limit = 10, filters: { search?: string; type?: string; userId?: string } = {}) {
    const queryBuilder = this.walletsRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user');

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    
    if (filters.type) {
      queryBuilder.andWhere('wallet.type = :type', { type: filters.type });
    }

    if (filters.userId) {
      queryBuilder.andWhere('wallet.userId = :userId', { userId: filters.userId });
    }

    queryBuilder.orderBy('wallet.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const wallets = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: wallets,
      total,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============ Wallet Requests ============

  // User creates request
  async createRequest(userId: string, createDto: CreateWalletRequestDto): Promise<WalletRequest> {
    const wallet = await this.findOne(createDto.walletId);
    
    if (wallet.userId !== userId) {
      throw new ForbiddenException('You can only create requests for your own wallets');
    }

    if (wallet.status === WalletStatus.FROZEN) {
      throw new BadRequestException('This wallet is frozen and cannot process requests');
    }

    // For withdrawals, check balance
    if (createDto.type === RequestType.WITHDRAWAL) {
      if (!createDto.walletAddress) {
        throw new BadRequestException('Wallet address is required for withdrawals');
      }
      if (createDto.amount > wallet.tokenBalance) {
        throw new BadRequestException('Insufficient balance for withdrawal');
      }
    }

    const request = this.walletRequestsRepository.create({
      ...createDto,
      userId,
    });

    return this.walletRequestsRepository.save(request);
  }

  // Get user's requests
  async findUserRequests(userId: string, page = 1, limit = 10) {
    const [requests, total] = await this.walletRequestsRepository.findAndCount({
      where: { userId },
      relations: ['wallet'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: requests,
      total,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get all requests (admin)
  async findAllRequests(page = 1, limit = 10, filters: { status?: string; type?: string } = {}) {
    const queryBuilder = this.walletRequestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.wallet', 'wallet');

    if (filters.status) {
      queryBuilder.andWhere('request.status = :status', { status: filters.status });
    }

    if (filters.type) {
      queryBuilder.andWhere('request.type = :type', { type: filters.type });
    }

    queryBuilder.orderBy('request.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const requests = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: requests,
      total,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Admin updates request
  async updateRequest(id: string, adminId: string, updateDto: UpdateWalletRequestDto): Promise<WalletRequest> {
    const request = await this.walletRequestsRepository.findOne({
      where: { id },
      relations: ['wallet'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // If completing a withdrawal, update the wallet balance
    if (updateDto.status === 'completed' && request.type === RequestType.WITHDRAWAL) {
      const wallet = request.wallet;
      wallet.tokenBalance = Number(wallet.tokenBalance) - Number(request.amount);
      const ratio = wallet.tokenBalance > 0 ? wallet.tokenBalance / (Number(wallet.tokenBalance) + Number(request.amount)) : 0;
      wallet.usdValue = Number(wallet.usdValue) * ratio;
      await this.walletsRepository.save(wallet);
    }

    // If completing a deposit, update the wallet balance
    if (updateDto.status === 'completed' && request.type === RequestType.DEPOSIT) {
      const wallet = request.wallet;
      wallet.tokenBalance = Number(wallet.tokenBalance) + Number(request.amount);
      await this.walletsRepository.save(wallet);
    }

    Object.assign(request, {
      ...updateDto,
      processedBy: adminId,
      processedAt: new Date(),
    });

    return this.walletRequestsRepository.save(request);
  }

  // Get pending requests count (for alerts)
  async getPendingRequestsCount(): Promise<number> {
    return this.walletRequestsRepository.count({
      where: { status: RequestStatus.PENDING },
    });
  }
}
