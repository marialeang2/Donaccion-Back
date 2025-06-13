import { IsOptional, IsString } from 'class-validator';

export class UpdateCertificateDto {
  @IsOptional()
  @IsString()
  description?: string;
}
