import { IsOptional, IsString } from 'class-validator';

export class UpdateFoundationDto {
  @IsOptional()
  @IsString()
  legal_name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
