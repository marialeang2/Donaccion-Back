import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateDonationDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
