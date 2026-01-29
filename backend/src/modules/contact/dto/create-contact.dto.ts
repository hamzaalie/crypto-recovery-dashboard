import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ContactCategory } from '../entities/contact-submission.entity';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(ContactCategory)
  category?: ContactCategory;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
