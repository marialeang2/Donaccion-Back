// src/modules/ratings/dto/create-rating.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Max, Min, ValidateIf } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @ValidateIf(o => !o.social_action_id)
  @IsUUID()
  donation_id?: string;

  @ValidateIf(o => !o.donation_id)
  @IsUUID()
  social_action_id?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}