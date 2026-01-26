import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Setting } from './entities/setting.entity';
import { UsersModule } from '../users/users.module';
import { CasesModule } from '../cases/cases.module';
import { TicketsModule } from '../tickets/tickets.module';
import { WalletsModule } from '../wallets/wallets.module';
import { AuditModule } from '../audit/audit.module';
import { EmailModule } from '../email/email.module';
import { Case } from '../cases/entities/case.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, Case, Ticket, User]),
    UsersModule,
    CasesModule,
    TicketsModule,
    WalletsModule,
    AuditModule,
    EmailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
