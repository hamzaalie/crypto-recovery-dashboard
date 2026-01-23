import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { CaseType, CaseStatus, CasePriority } from '../entities/case.entity';

export class CreateCaseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(CaseType)
  type: CaseType;

  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @IsOptional()
  @IsNumber()
  estimatedLoss?: number;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsOptional()
  @IsArray()
  attachments?: string[];
}

export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  estimatedLoss?: number;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsOptional()
  @IsArray()
  attachments?: string[];
}

export class AdminUpdateCaseDto extends UpdateCaseDto {
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsNumber()
  recoveredAmount?: number;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
