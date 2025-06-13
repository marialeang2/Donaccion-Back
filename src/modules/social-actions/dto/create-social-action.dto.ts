import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSocialActionDto {
  @IsNotEmpty()
  @IsUUID()
  foundation_id: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;
}
