import { Controller, Get, Patch, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { UsersService } from '../users/users.service';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  // Public endpoint to test SMTP connection
  @Get('test-connection')
  testConnection() {
    return this.emailService.testConnection();
  }

  // Public endpoint to send a test email
  @Post('send-test')
  sendTestEmail(@Body('email') email: string) {
    return this.emailService.sendVerificationEmail(
      email,
      'Test User',
      'http://localhost:5173/verify-email?token=test-token-12345'
    );
  }

  // Public endpoint to manually verify a user (for testing)
  @Post('verify-user')
  async manuallyVerifyUser(@Body('email') email: string) {
    const user = await this.usersService.manuallyVerifyByEmail(email);
    return { 
      success: true, 
      message: `User ${email} has been verified`,
      email: user.email,
      isEmailVerified: user.isEmailVerified 
    };
  }

  // Public endpoint to make a user admin (for testing/setup)
  @Post('make-admin')
  async makeUserAdmin(@Body('email') email: string) {
    const user = await this.usersService.makeAdmin(email);
    return { 
      success: true, 
      message: `User ${email} is now an ADMIN`,
      email: user.email,
      role: user.role 
    };
  }

  // Public endpoint to make a user support agent (for testing/setup)
  @Post('make-agent')
  async makeUserAgent(@Body('email') email: string) {
    const user = await this.usersService.makeAgent(email);
    return { 
      success: true, 
      message: `User ${email} is now a SUPPORT AGENT`,
      email: user.email,
      role: user.role 
    };
  }

  @Get('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllTemplates() {
    return this.emailService.findAllTemplates();
  }

  @Get('templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findTemplate(@Param('id') id: string) {
    return this.emailService.findTemplate(id);
  }

  @Patch('templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateTemplate(@Param('id') id: string, @Body() updateData: Partial<EmailTemplate>) {
    return this.emailService.updateTemplate(id, updateData);
  }

  @Post('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createTemplate(@Body() templateData: Partial<EmailTemplate>) {
    return this.emailService.createTemplate(templateData);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  seedTemplates() {
    return this.emailService.seedDefaultTemplates();
  }
}
