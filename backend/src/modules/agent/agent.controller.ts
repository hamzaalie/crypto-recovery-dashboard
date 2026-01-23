import { Controller, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CaseStatus } from '../cases/entities/case.entity';
import { TicketStatus } from '../tickets/entities/ticket.entity';

@Controller('agent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPPORT_AGENT, UserRole.ADMIN)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get('stats')
  getStats(@Request() req) {
    return this.agentService.getStats(req.user.id);
  }

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.agentService.getDashboard(req.user.id);
  }

  // Cases assigned to agent
  @Get('cases')
  getMyCases(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: CaseStatus,
  ) {
    return this.agentService.getAssignedCases(req.user.id, +page, +limit, status);
  }

  @Get('cases/:id')
  getCase(@Request() req, @Param('id') id: string) {
    return this.agentService.getAssignedCase(req.user.id, id);
  }

  @Patch('cases/:id')
  updateCase(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: { status?: CaseStatus; notes?: string; recoveredAmount?: number },
  ) {
    return this.agentService.updateAssignedCase(req.user.id, id, updateDto);
  }

  // Tickets assigned to agent
  @Get('tickets')
  getMyTickets(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: TicketStatus,
  ) {
    return this.agentService.getAssignedTickets(req.user.id, +page, +limit, status);
  }

  @Get('tickets/:id')
  getTicket(@Request() req, @Param('id') id: string) {
    return this.agentService.getAssignedTicket(req.user.id, id);
  }

  @Patch('tickets/:id')
  updateTicket(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: { status?: TicketStatus; priority?: string },
  ) {
    return this.agentService.updateAssignedTicket(req.user.id, id, updateDto);
  }

  // Performance metrics
  @Get('performance')
  getPerformance(@Request() req, @Query('period') period = '30d') {
    return this.agentService.getPerformanceMetrics(req.user.id, period);
  }
}
