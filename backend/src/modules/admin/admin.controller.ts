import { Controller, Get, Patch, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CasesService } from '../cases/cases.service';
import { TicketsService } from '../tickets/tickets.service';
import { WalletsService } from '../wallets/wallets.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';
import { CaseStatus } from '../cases/entities/case.entity';
import { TicketStatus } from '../tickets/entities/ticket.entity';
import { ConfigService } from '@nestjs/config';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly casesService: CasesService,
    private readonly ticketsService: TicketsService,
    private readonly walletsService: WalletsService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Get('stats')
  async getStats() {
    const [userStats, caseStats, ticketStats, walletStats] = await Promise.all([
      this.usersService.getStats(),
      this.casesService.getStats(),
      this.ticketsService.getStats(),
      this.walletsService.getStats(),
    ]);

    return {
      totalUsers: userStats.total || 0,
      newUsersThisMonth: userStats.newThisMonth || 0,
      totalCases: caseStats.total || 0,
      activeCases: caseStats.active || 0,
      casesThisMonth: caseStats.newThisMonth || 0,
      totalTickets: ticketStats.total || 0,
      openTickets: ticketStats.open || 0,
      ticketsThisMonth: ticketStats.newThisMonth || 0,
      totalWallets: walletStats.total || 0,
      totalRecovered: caseStats.totalRecovered || 0,
    };
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // User Management
  @Get('users')
  findAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAllAdmin(+page, +limit, { search, role, status });
  }

  // Invite a new user (admin creates user, sends invite email)
  // NOTE: This must come BEFORE users/:id routes to avoid route conflict
  @Post('users/invite')
  async inviteUser(
    @Body() inviteDto: { email: string; firstName: string; lastName: string; role?: string }
  ) {
    const user = await this.usersService.createInvitedUser(inviteDto);
    
    // Send invite email
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/complete-signup?token=${user.emailVerificationToken}`;
    
    await this.emailService.sendInviteEmail(
      user.email,
      user.firstName,
      inviteLink,
    );

    return {
      message: 'User created and invite email sent',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  @Get('users/:id')
  findOneUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() updateDto: any) {
    return this.usersService.adminUpdate(id, updateDto);
  }

  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Resend invite email for pending user
  @Post('users/:id/resend-invite')
  async resendInvite(@Param('id') id: string) {
    const token = await this.usersService.regenerateInviteToken(id);
    const user = await this.usersService.findOne(id);
    
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/complete-signup?token=${token}`;
    
    await this.emailService.sendInviteEmail(
      user.email,
      user.firstName,
      inviteLink,
    );

    return { message: 'Invite email resent successfully' };
  }

  // Cases Management
  @Get('cases')
  findAllCases(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: CaseStatus,
    @Query('priority') priority?: string,
    @Query('sort') sort?: string,
  ) {
    return this.casesService.findAllAdmin(+page, +limit, { search, status, priority, sort });
  }

  @Get('cases/:id')
  findOneCase(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Patch('cases/:id')
  updateCase(@Param('id') id: string, @Body() updateDto: any) {
    return this.casesService.adminUpdate(id, updateDto);
  }

  // Tickets Management
  @Get('tickets')
  findAllTickets(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: string,
    @Query('sort') sort?: string,
  ) {
    return this.ticketsService.findAllAdmin(+page, +limit, { search, status, priority, sort });
  }

  @Get('tickets/:id')
  findOneTicket(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch('tickets/:id')
  updateTicket(@Param('id') id: string, @Body() updateDto: any) {
    return this.ticketsService.adminUpdate(id, updateDto);
  }

  // Wallets Overview
  @Get('wallets')
  findAllWallets(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('blockchain') blockchain?: string,
  ) {
    return this.walletsService.findAllAdmin(+page, +limit, { search, blockchain });
  }

  @Get('settings')
  getSettings(@Query('category') category?: string) {
    return this.adminService.getSettings(category);
  }

  @Patch('settings')
  updateSettings(@Body() settings: { key: string; value: string }[]) {
    return this.adminService.updateMultipleSettings(settings);
  }

  @Post('settings/seed')
  seedSettings() {
    return this.adminService.seedDefaultSettings();
  }

  // Reports
  @Get('reports/overview')
  getReportsOverview(@Query('period') period = '30d') {
    return this.adminService.getReportsOverview(period);
  }

  @Get('reports/cases')
  getCasesReport(
    @Query('period') period = '30d',
    @Query('groupBy') groupBy = 'status',
  ) {
    return this.adminService.getCasesReport(period, groupBy);
  }

  @Get('reports/tickets')
  getTicketsReport(
    @Query('period') period = '30d',
    @Query('groupBy') groupBy = 'status',
  ) {
    return this.adminService.getTicketsReport(period, groupBy);
  }

  @Get('reports/users')
  getUsersReport(@Query('period') period = '30d') {
    return this.adminService.getUsersReport(period);
  }

  @Get('reports/recovery')
  getRecoveryReport(@Query('period') period = '30d') {
    return this.adminService.getRecoveryReport(period);
  }

  @Get('reports/trends')
  getTrendsReport(@Query('period') period = '30d') {
    return this.adminService.getTrendsReport(period);
  }

  // Audit logs export
  @Get('audit-logs')
  getAuditLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.auditService.findAll(+page, +limit, action as any, userId);
  }

  @Get('audit-logs/export')
  exportAuditLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.exportAuditLogs(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
