import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import { CreateWalletDto, UpdateWalletDto, AdminUpdateWalletDto } from './dto/wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async create(userId: string, createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletsRepository.create({
      ...createWalletDto,
      userId,
    });
    return this.walletsRepository.save(wallet);
  }

  async findAll(page = 1, limit = 10) {
    const [wallets, total] = await this.walletsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: wallets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [wallets, total] = await this.walletsRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: wallets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async update(id: string, userId: string, updateWalletDto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOne(id);
    if (wallet.userId !== userId) {
      throw new ForbiddenException('You can only update your own wallets');
    }
    Object.assign(wallet, updateWalletDto);
    return this.walletsRepository.save(wallet);
  }

  async adminUpdate(id: string, updateDto: AdminUpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOne(id);
    Object.assign(wallet, updateDto);
    return this.walletsRepository.save(wallet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const wallet = await this.findOne(id);
    if (wallet.userId !== userId) {
      throw new ForbiddenException('You can only delete your own wallets');
    }
    await this.walletsRepository.remove(wallet);
  }

  async adminRemove(id: string): Promise<void> {
    const wallet = await this.findOne(id);
    await this.walletsRepository.remove(wallet);
  }

  async getStats() {
    const total = await this.walletsRepository.count();
    const verified = await this.walletsRepository.count({ where: { status: WalletStatus.VERIFIED } });
    const pending = await this.walletsRepository.count({ where: { status: WalletStatus.PENDING } });

    const byType = await this.walletsRepository
      .createQueryBuilder('wallet')
      .select('wallet.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('wallet.type')
      .getRawMany();

    return { total, verified, pending, byType };
  }

  async findAllAdmin(page = 1, limit = 10, filters: { search?: string; blockchain?: string } = {}) {
    const queryBuilder = this.walletsRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user');

    if (filters.search) {
      queryBuilder.andWhere(
        '(wallet.address LIKE :search OR wallet.label LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    
    if (filters.blockchain) {
      queryBuilder.andWhere('wallet.blockchain = :blockchain', { blockchain: filters.blockchain });
    }

    queryBuilder.orderBy('wallet.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const wallets = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: wallets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
