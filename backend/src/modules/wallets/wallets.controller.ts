import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto, UpdateWalletDto, AdminUpdateWalletDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Request() req, @Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.create(req.user.id, createWalletDto);
  }

  @Get()
  findMyWallets(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.walletsService.findByUser(req.user.id, +page, +limit);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.walletsService.findAll(+page, +limit);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.walletsService.getStats();
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const wallet = await this.walletsService.findOne(id);
    
    // Authorization check: Allow access if user owns the wallet, is admin, or is assigned agent viewing user's wallet
    const hasAccess = 
      wallet.userId === req.user.id ||
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.SUPPORT_AGENT;
    
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this wallet');
    }
    
    return wallet;
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletsService.update(id, req.user.id, updateWalletDto);
  }

  @Patch(':id/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  adminUpdate(@Param('id') id: string, @Body() updateDto: AdminUpdateWalletDto) {
    return this.walletsService.adminUpdate(id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.walletsService.remove(id, req.user.id);
  }

  @Delete(':id/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  adminRemove(@Param('id') id: string) {
    return this.walletsService.adminRemove(id);
  }
}
