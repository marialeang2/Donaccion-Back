import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCertificateDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
