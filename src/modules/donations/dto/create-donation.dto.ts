import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateDonationDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  foundation_id: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
