import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission, ContactStatus } from './entities/contact-submission.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailService } from '../email/email.service';
import { EmailTemplateType } from '../email/entities/email-template.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmission)
    private contactRepository: Repository<ContactSubmission>,
    private emailService: EmailService,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ContactSubmission> {
    const submission = this.contactRepository.create({
      ...createContactDto,
      ipAddress,
      userAgent,
    });

    const saved = await this.contactRepository.save(submission);

    // Send confirmation email to user
    try {
      await this.emailService.sendRawEmail(
        createContactDto.email,
        'Thank you for contacting CryptoRecover',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">CryptoRecover</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1f2937;">Thank You for Reaching Out!</h2>
            <p style="color: #4b5563;">Dear ${createContactDto.firstName},</p>
            <p style="color: #4b5563;">We have received your message and appreciate you contacting us. Our team will review your inquiry and get back to you within 24-48 business hours.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280;"><strong>Your Message:</strong></p>
              <p style="color: #4b5563; margin-top: 10px;">${createContactDto.message.substring(0, 200)}${createContactDto.message.length > 200 ? '...' : ''}</p>
            </div>
            <p style="color: #4b5563;">If your matter is urgent, please call our 24/7 hotline at <strong>+1 (800) 123-4567</strong>.</p>
            <p style="color: #4b5563;">Best regards,<br/>The CryptoRecover Team</p>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} CryptoRecover. All rights reserved.</p>
          </div>
        </div>
        `,
      );
    } catch (error) {
      console.error('Failed to send contact confirmation email:', error);
    }

    // Notify admin about new contact submission
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@cryptorecover.com';
      await this.emailService.sendRawEmail(
        adminEmail,
        `New Contact Submission: ${createContactDto.category || 'General'}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">New Contact Submission</h2>
          </div>
          <div style="padding: 20px; background: #ffffff; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${createContactDto.firstName} ${createContactDto.lastName}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${createContactDto.email}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${createContactDto.phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Category:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${createContactDto.category || 'General'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>IP Address:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${ipAddress || 'Unknown'}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
              <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
              <p style="margin: 0; white-space: pre-wrap;">${createContactDto.message}</p>
            </div>
          </div>
        </div>
        `,
      );
    } catch (error) {
      console.error('Failed to send admin notification:', error);
    }

    return saved;
  }

  async findAll(page = 1, limit = 20) {
    const [submissions, total] = await this.contactRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: submissions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ContactSubmission> {
    return this.contactRepository.findOneOrFail({ where: { id } });
  }

  async updateStatus(id: string, status: ContactStatus, notes?: string): Promise<ContactSubmission> {
    const submission = await this.findOne(id);
    submission.status = status;
    if (notes) {
      submission.internalNotes = notes;
    }
    return this.contactRepository.save(submission);
  }

  async getStats() {
    const total = await this.contactRepository.count();
    const newCount = await this.contactRepository.count({ where: { status: ContactStatus.NEW } });
    const inProgress = await this.contactRepository.count({ where: { status: ContactStatus.IN_PROGRESS } });
    const resolved = await this.contactRepository.count({ where: { status: ContactStatus.RESOLVED } });

    return {
      total,
      new: newCount,
      inProgress,
      resolved,
    };
  }
}
