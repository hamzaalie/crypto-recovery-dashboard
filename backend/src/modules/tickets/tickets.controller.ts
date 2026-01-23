import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  AdminUpdateTicketDto,
  CreateTicketMessageDto,
} from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TicketStatus } from './entities/ticket.entity';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(req.user.id, createTicketDto);
  }

  @Get()
  findMyTickets(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.ticketsService.findByUser(req.user.id, +page, +limit);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: TicketStatus,
  ) {
    return this.ticketsService.findAll(+page, +limit, status);
  }

  @Get('assigned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPORT_AGENT)
  findAssigned(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.ticketsService.findAssigned(req.user.id, +page, +limit);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.ticketsService.getStats();
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id);
    
    // Authorization check: Allow access if user owns the ticket, is admin, or is assigned agent
    const hasAccess = 
      ticket.userId === req.user.id ||
      req.user.role === UserRole.ADMIN ||
      (req.user.role === UserRole.SUPPORT_AGENT && ticket.assignedToId === req.user.id);
    
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this ticket');
    }
    
    return ticket;
  }

  @Get(':id/messages')
  async getMessages(@Request() req, @Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id);
    
    // Authorization check: Same as ticket access
    const hasAccess = 
      ticket.userId === req.user.id ||
      req.user.role === UserRole.ADMIN ||
      (req.user.role === UserRole.SUPPORT_AGENT && ticket.assignedToId === req.user.id);
    
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this ticket');
    }
    
    return this.ticketsService.getMessages(id);
  }

  @Post(':id/messages')
  addMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() createMessageDto: CreateTicketMessageDto,
  ) {
    return this.ticketsService.addMessage(id, req.user.id, req.user.role, createMessageDto);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, req.user.id, updateTicketDto);
  }

  @Patch(':id/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  adminUpdate(@Param('id') id: string, @Body() updateDto: AdminUpdateTicketDto) {
    return this.ticketsService.adminUpdate(id, updateDto);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  assignTicket(@Param('id') id: string, @Body('agentId') agentId: string) {
    return this.ticketsService.assignTicket(id, agentId);
  }
}
