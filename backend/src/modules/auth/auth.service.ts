import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create(registerDto);

    // Log registration
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.USER_REGISTER,
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email },
    });

    // Send verification email
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${user.emailVerificationToken}`;
    
    // Send email asynchronously - don't block registration if email fails
    this.emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      verificationLink,
    ).then(result => {
      if (result.success) {
        console.log(`✅ Verification email sent to ${user.email}`);
      } else {
        console.error(`❌ Failed to send verification email to ${user.email}:`, result.message);
      }
    }).catch(error => {
      console.error(`❌ Error sending verification email to ${user.email}:`, error);
    });

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
      requiresVerification: true,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.verifyEmail(token);
    
    const tokens = await this.generateTokens(user);
    
    return {
      message: 'Email verified successfully',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account exists with this email, a verification link has been sent.' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const newToken = await this.usersService.generateNewVerificationToken(user.id);
    
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${newToken}`;
    
    await this.emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      verificationLink,
    );

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return {
        requiresVerification: true,
        email: user.email,
        message: 'Please verify your email before logging in',
      };
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!loginDto.twoFactorCode) {
        return { requiresTwoFactor: true };
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: loginDto.twoFactorCode,
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    await this.usersService.updateLastLogin(user.id);

    // Log successful login
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.USER_LOGIN,
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email },
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      const tokens = await this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // Don't reveal if user exists, but only send email if user found
    if (user) {
      // Generate password reset token
      const resetToken = await this.usersService.generatePasswordResetToken(user.id);
      
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      // Send password reset email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetLink,
      );
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Verify the token and reset the password
    const user = await this.usersService.verifyPasswordResetToken(resetPasswordDto.token);
    
    await this.usersService.updatePassword(user.id, resetPasswordDto.newPassword);
    await this.usersService.clearPasswordResetToken(user.id);

    return { message: 'Password reset successfully. You can now login with your new password.' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    await this.usersService.updatePassword(userId, changePasswordDto.newPassword);

    // Log password change
    await this.auditService.log({
      userId,
      action: AuditAction.PASSWORD_CHANGE,
      entityType: 'user',
      entityId: userId,
      details: { email: user.email },
    });

    return { message: 'Password changed successfully' };
  }

  async setup2FA(userId: string) {
    const user = await this.usersService.findOne(userId);

    const secret = speakeasy.generateSecret({
      name: `CryptoRecovery:${user.email}`,
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async enable2FA(userId: string, code: string, secret: string) {
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.usersService.enable2FA(userId, secret);

    // Log 2FA enable
    await this.auditService.log({
      userId,
      action: AuditAction.TWO_FA_ENABLE,
      entityType: 'user',
      entityId: userId,
    });

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: string, code: string) {
    const user = await this.usersService.findOne(userId);

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.usersService.disable2FA(userId);

    // Log 2FA disable
    await this.auditService.log({
      userId,
      action: AuditAction.TWO_FA_DISABLE,
      entityType: 'user',
      entityId: userId,
    });

    return { message: '2FA disabled successfully' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User) {
    const { password, twoFactorSecret, ...sanitized } = user;
    return sanitized;
  }
}
