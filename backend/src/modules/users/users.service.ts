import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, AdminUpdateUserDto } from './dto/user.dto';
import { Case } from '../cases/entities/case.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Wallet } from '../wallets/entities/wallet.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    return this.usersRepository.save(user);
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    return this.usersRepository.save(user);
  }

  async generateNewVerificationToken(userId: string): Promise<string> {
    const user = await this.findOne(userId);
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    
    await this.usersRepository.save(user);
    
    return verificationToken;
  }

  // Admin method to manually verify a user by email
  async manuallyVerifyByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    return this.usersRepository.save(user);
  }

  async findAll(page = 1, limit = 10) {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt'],
    });

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async adminUpdate(id: string, updateDto: AdminUpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    // Check if user has related records
    const casesCount = await this.casesRepository.count({ 
      where: [{ userId: id }, { assignedToId: id }] 
    });
    const ticketsCount = await this.ticketsRepository.count({ 
      where: [{ userId: id }, { assignedToId: id }] 
    });
    const walletsCount = await this.walletsRepository.count({ where: { userId: id } });
    
    if (casesCount > 0 || ticketsCount > 0 || walletsCount > 0) {
      throw new BadRequestException(
        `Cannot delete user. User has ${casesCount} case(s), ${ticketsCount} ticket(s), and ${walletsCount} wallet(s). Please reassign or delete these records first.`
      );
    }
    
    await this.usersRepository.remove(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async enable2FA(id: string, secret: string): Promise<void> {
    await this.usersRepository.update(id, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    });
  }

  async disable2FA(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
  }

  async getStats() {
    const total = await this.usersRepository.count();
    const active = await this.usersRepository.count({ where: { status: UserStatus.ACTIVE } });
    const admins = await this.usersRepository.count({ where: { role: UserRole.ADMIN } });
    const agents = await this.usersRepository.count({ where: { role: UserRole.SUPPORT_AGENT } });
    
    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await this.usersRepository.count({
      where: { createdAt: MoreThan(startOfMonth) },
    });

    return { total, active, admins, agents, newThisMonth };
  }

  async findAllAdmin(page = 1, limit = 10, filters: { search?: string; role?: string; status?: string } = {}) {
    const where: FindOptionsWhere<User>[] = [];
    
    let baseWhere: FindOptionsWhere<User> = {};
    
    if (filters.role) {
      baseWhere.role = filters.role as UserRole;
    }
    if (filters.status) {
      baseWhere.status = filters.status as UserStatus;
    }
    
    if (filters.search) {
      // Search in email, firstName, lastName
      where.push(
        { ...baseWhere, email: Like(`%${filters.search}%`) },
        { ...baseWhere, firstName: Like(`%${filters.search}%`) },
        { ...baseWhere, lastName: Like(`%${filters.search}%`) },
      );
    } else {
      where.push(baseWhere);
    }

    const [users, total] = await this.usersRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'status', 'isEmailVerified', 'twoFactorEnabled', 'createdAt', 'lastLoginAt'],
    });

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDashboardStats(userId: string) {
    // Return basic stats for the user dashboard
    return {
      totalWallets: 0,
      totalBalance: 0,
      activeCases: 0,
      openTickets: 0,
      recentActivity: [],
    };
  }

  async makeAdmin(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    user.role = UserRole.ADMIN;
    return this.usersRepository.save(user);
  }

  async makeAgent(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    user.role = UserRole.SUPPORT_AGENT;
    return this.usersRepository.save(user);
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    const user = await this.findOne(userId);
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    
    await this.usersRepository.save(user);
    
    return resetToken;
  }

  async verifyPasswordResetToken(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    return user;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  // Admin creates user and sends invite email
  async createInvitedUser(data: { email: string; firstName: string; lastName: string; role?: string }): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate a random temporary password (user will set their own via invite link)
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Generate invite token (same as email verification token)
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const user = this.usersRepository.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      role: (data.role as UserRole) || UserRole.USER,
      status: UserStatus.PENDING,
      isEmailVerified: false,
      emailVerificationToken: inviteToken,
      emailVerificationExpires: inviteExpires,
    });

    return this.usersRepository.save(user);
  }

  // User completes signup (sets password after clicking invite link)
  async completeSignup(token: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired invitation token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    user.password = hashedPassword;
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.status = UserStatus.ACTIVE;

    return this.usersRepository.save(user);
  }

  // Resend invite for pending users
  async regenerateInviteToken(userId: string): Promise<string> {
    const user = await this.findOne(userId);
    
    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException('User has already completed signup');
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    user.emailVerificationToken = inviteToken;
    user.emailVerificationExpires = inviteExpires;
    
    await this.usersRepository.save(user);
    
    return inviteToken;
  }

  // Find user by invite token
  async findByInviteToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: MoreThan(new Date()),
      },
    });
  }
}
