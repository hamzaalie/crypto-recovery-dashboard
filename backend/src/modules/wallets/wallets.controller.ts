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
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto, UpdateWalletDto, CreateWalletRequestDto, UpdateWalletRequestDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  // Admin creates wallet for user
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.create(createWalletDto);
  }

  // User gets their wallets
  @Get()
  findMyWallets(@Request() req) {
    return this.walletsService.findByUser(req.user.id);
  }

  // Admin gets all wallets
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.walletsService.findAll(+page, +limit);
  }

  // Get wallet stats
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.walletsService.getStats();
  }

  // ============ Wallet Requests ============

  // User creates a deposit/withdrawal request
  @Post('requests')
  createRequest(@Request() req, @Body() createDto: CreateWalletRequestDto) {
    return this.walletsService.createRequest(req.user.id, createDto);
  }

  // User gets their requests
  @Get('requests')
  findMyRequests(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.walletsService.findUserRequests(req.user.id, +page, +limit);
  }

  // Admin gets all requests
  @Get('requests/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllRequests(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.walletsService.findAllRequests(+page, +limit, { status, type });
  }

  // Get pending requests count
  @Get('requests/pending-count')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getPendingCount() {
    return this.walletsService.getPendingRequestsCount();
  }

  // Admin updates request status
  @Patch('requests/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateRequest(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateWalletRequestDto) {
    return this.walletsService.updateRequest(id, req.user.id, updateDto);
  }

  // Get single wallet
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletsService.findOne(id);
  }

  // Admin updates wallet
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletsService.update(id, updateWalletDto);
  }

  // Admin deletes wallet
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.walletsService.remove(id);
  }
}
