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
import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseDto, AdminUpdateCaseDto } from './dto/case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CaseStatus } from './entities/case.entity';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  create(@Request() req, @Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(req.user.id, createCaseDto);
  }

  @Get()
  findMyCases(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.casesService.findByUser(req.user.id, +page, +limit);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: CaseStatus,
  ) {
    return this.casesService.findAll(+page, +limit, status);
  }

  @Get('assigned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPORT_AGENT)
  findAssigned(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.casesService.findAssigned(req.user.id, +page, +limit);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.casesService.getStats();
  }

  @Get('my-stats')
  getUserStats(@Request() req) {
    return this.casesService.getUserStats(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const caseEntity = await this.casesService.findOne(id);
    
    // Authorization check: Allow access if user owns the case, is admin, or is assigned agent
    const hasAccess = 
      caseEntity.userId === req.user.id ||
      req.user.role === UserRole.ADMIN ||
      (req.user.role === UserRole.SUPPORT_AGENT && caseEntity.assignedToId === req.user.id);
    
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this case');
    }
    
    return caseEntity;
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, req.user.id, updateCaseDto);
  }

  @Patch(':id/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  adminUpdate(@Param('id') id: string, @Body() updateDto: AdminUpdateCaseDto) {
    return this.casesService.adminUpdate(id, updateDto);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  assignCase(@Param('id') id: string, @Body('agentId') agentId: string) {
    return this.casesService.assignCase(id, agentId);
  }
}
