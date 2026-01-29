import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { CasesModule } from './modules/cases/cases.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { EmailModule } from './modules/email/email.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { AgentModule } from './modules/agent/agent.module';
import { FilesModule } from './modules/files/files.module';
import { ContactModule } from './modules/contact/contact.module';
import { HealthController, ApiHealthController } from './health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting - 100 requests per minute globally
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),

    // Database - supports DATABASE_URL or individual config
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        if (databaseUrl) {
          // Use connection string (for Neon, Supabase, Railway, etc.)
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Auto-create tables in development
            logging: configService.get('NODE_ENV') === 'development',
            ssl: { rejectUnauthorized: false },
          };
        }
        
        // Fallback to individual config
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_DATABASE', 'crypto_recovery'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: configService.get('NODE_ENV') === 'development',
          ssl: configService.get('DB_SSL') === 'true' 
            ? { rejectUnauthorized: false } 
            : false,
        };
      },
      inject: [ConfigService],
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    WalletsModule,
    CasesModule,
    TicketsModule,
    EmailModule,
    AuditModule,
    AdminModule,
    AgentModule,
    FilesModule,
    ContactModule,
  ],
  controllers: [HealthController, ApiHealthController],
})
export class AppModule {}
