import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { WalletType, WalletStatus } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsString()
  name: string;

  @IsEnum(WalletType)
  type: WalletType;

  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWalletDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdminUpdateWalletDto extends UpdateWalletDto {
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;
}
