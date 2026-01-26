import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';
import { WalletType, WalletStatus } from '../entities/wallet.entity';
import { RequestType } from '../entities/wallet-request.entity';

// Admin creates wallet for user
export class CreateWalletDto {
  @IsUUID()
  userId: string;

  @IsEnum(WalletType)
  type: WalletType;

  @IsNumber()
  @Min(0)
  tokenBalance: number;

  @IsNumber()
  @Min(0)
  usdValue: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Admin updates wallet
export class UpdateWalletDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  tokenBalance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  usdValue?: number;

  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdminUpdateWalletDto extends UpdateWalletDto {}

// User creates withdrawal/deposit request
export class CreateWalletRequestDto {
  @IsUUID()
  walletId: string;

  @IsEnum(RequestType)
  type: RequestType;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  walletAddress?: string; // Required for withdrawals

  @IsOptional()
  @IsString()
  notes?: string;
}

// Admin updates request status
export class UpdateWalletRequestDto {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;
}
