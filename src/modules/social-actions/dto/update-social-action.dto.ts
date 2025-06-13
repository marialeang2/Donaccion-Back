import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateSocialActionDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
