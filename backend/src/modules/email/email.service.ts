import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailTemplate, EmailTemplateType } from './entities/email-template.entity';

@Injectable()
export class EmailService implements OnModuleInit {
  private resend: Resend;
  private fromEmail: string;

  constructor(
    @InjectRepository(EmailTemplate)
    private templateRepository: Repository<EmailTemplate>,
    private configService: ConfigService,
  ) {
    const resendApiKey = this.configService.get('RESEND_API_KEY');
    this.fromEmail = this.configService.get('SMTP_FROM') || 'onboarding@resend.dev';

    console.log('📧 Resend Configuration:');
    console.log(`   API Key: ${resendApiKey ? '****' + resendApiKey.slice(-8) : 'NOT SET'}`);
    console.log(`   From: ${this.fromEmail}`);

    // Initialize Resend client
    this.resend = new Resend(resendApiKey);
  }

  async onModuleInit() {
    // Test Resend connection on startup
    try {
      const resendApiKey = this.configService.get('RESEND_API_KEY');
      if (resendApiKey) {
        console.log('✅ Resend API key configured!');
      } else {
        console.error('❌ Resend API key not set!');
      }
    } catch (error) {
      console.error('❌ Resend initialization failed:', error.message);
    }
  }

  async testConnection() {
    try {
      const resendApiKey = this.configService.get('RESEND_API_KEY');
      if (!resendApiKey) {
        return { success: false, message: 'RESEND_API_KEY not configured' };
      }
      // Test by checking domains (lightweight API call)
      const { data, error } = await this.resend.domains.list();
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Resend connection successful', domains: data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async sendEmail(to: string, templateType: EmailTemplateType, variables: Record<string, string>) {
    const template = await this.templateRepository.findOne({
      where: { type: templateType, isActive: true },
    });

    if (!template) {
      console.warn(`Email template ${templateType} not found, using default`);
      // Send without template
      return this.sendRawEmail(to, 'Notification', `<p>${JSON.stringify(variables)}</p>`);
    }

    // Replace variables in template
    let htmlContent = template.htmlContent;
    let subject = template.subject;

    Object.entries(variables).forEach(([key, value]) => {
      htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return this.sendRawEmail(to, subject, htmlContent);
  }

  async sendRawEmail(to: string, subject: string, htmlContent: string) {
    try {
      console.log(`📨 Attempting to send email to: ${to}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`👤 From: ${this.fromEmail}`);
      
      const { data, error } = await this.resend.emails.send({
        from: `Crypto Recovery Platform <${this.fromEmail}>`,
        to: [to],
        subject,
        html: htmlContent,
      });

      if (error) {
        console.error(`❌ Failed to send email to ${to}`);
        console.error(`🔴 Error Message: ${error.message}`);
        return { success: false, message: error.message };
      }

      console.log(`✅ Email sent successfully to ${to}`);
      console.log(`📬 Email ID: ${data?.id}`);
      
      return { success: true, message: 'Email sent successfully', messageId: data?.id };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}`);
      console.error(`🔴 Error Message: ${error.message}`);
      
      return { success: false, message: error.message };
    }
  }

  async sendVerificationEmail(to: string, firstName: string, verificationLink: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for registering with Crypto Recovery Platform. To complete your registration and access your account, please verify your email address.</p>
            <p style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px; font-size: 14px;">${verificationLink}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Crypto Recovery Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendRawEmail(to, 'Verify Your Email - Crypto Recovery Platform', htmlContent);
  }

  async sendPasswordResetEmail(to: string, firstName: string, resetLink: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>We received a request to reset your password for your Crypto Recovery Platform account.</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset My Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px; font-size: 14px;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Crypto Recovery Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendRawEmail(to, 'Reset Your Password - Crypto Recovery Platform', htmlContent);
  }

  async sendInviteEmail(to: string, firstName: string, inviteLink: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #007ac2 0%, #005a8f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #007ac2; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .highlight { background: #e0f2fe; border: 1px solid #007ac2; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You've Been Invited!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>You have been invited to join the Crypto Recovery Platform. To get started, please complete your account setup by clicking the button below.</p>
            <p style="text-align: center;">
              <a href="${inviteLink}" class="button">Complete Your Signup</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px; font-size: 14px;">${inviteLink}</p>
            <div class="highlight">
              <strong>📋 What you'll need to do:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Set your password</li>
                <li>Review your account details</li>
                <li>Start using the platform</li>
              </ul>
            </div>
            <p><strong>This link will expire in 7 days.</strong></p>
            <p>If you didn't expect this invitation or have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Crypto Recovery Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendRawEmail(to, 'You\'ve Been Invited - Complete Your Signup', htmlContent);
  }

  async findAllTemplates() {
    return this.templateRepository.find({ order: { type: 'ASC' } });
  }

  async findTemplate(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updateTemplate(id: string, updateData: Partial<EmailTemplate>) {
    const template = await this.findTemplate(id);
    Object.assign(template, updateData);
    return this.templateRepository.save(template);
  }

  async createTemplate(templateData: Partial<EmailTemplate>) {
    const template = this.templateRepository.create(templateData);
    return this.templateRepository.save(template);
  }

  async seedDefaultTemplates() {
    const defaultTemplates = [
      {
        type: EmailTemplateType.WELCOME,
        name: 'Welcome Email',
        subject: 'Welcome to Crypto Recovery Platform',
        htmlContent: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining our platform.</p>',
      },
      {
        type: EmailTemplateType.PASSWORD_RESET,
        name: 'Password Reset',
        subject: 'Reset Your Password',
        htmlContent: '<h1>Password Reset</h1><p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
      },
      {
        type: EmailTemplateType.CASE_CREATED,
        name: 'Case Created',
        subject: 'Your Recovery Case Has Been Created',
        htmlContent: '<h1>Case Created</h1><p>Your case #{{caseId}} has been created and is under review.</p>',
      },
      {
        type: EmailTemplateType.CASE_STATUS_UPDATE,
        name: 'Case Status Update',
        subject: 'Case Status Update',
        htmlContent: '<h1>Case Update</h1><p>Your case #{{caseId}} status has been updated to: {{status}}</p>',
      },
      {
        type: EmailTemplateType.TICKET_CREATED,
        name: 'Ticket Created',
        subject: 'Support Ticket Created',
        htmlContent: '<h1>Ticket Created</h1><p>Your support ticket #{{ticketId}} has been created.</p>',
      },
      {
        type: EmailTemplateType.TICKET_REPLY,
        name: 'Ticket Reply',
        subject: 'New Reply to Your Ticket',
        htmlContent: '<h1>New Reply</h1><p>There is a new reply to your ticket #{{ticketId}}.</p>',
      },
    ];

    for (const template of defaultTemplates) {
      const exists = await this.templateRepository.findOne({
        where: { type: template.type },
      });
      if (!exists) {
        await this.templateRepository.save(template);
      }
    }
  }
}
