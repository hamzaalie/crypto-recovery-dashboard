import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { TicketCategory, TicketStatus, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsUUID()
  caseId?: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;
}

export class AdminUpdateTicketDto extends UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}

export class CreateTicketMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  attachments?: string[];
}
