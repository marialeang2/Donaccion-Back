// src/modules/social-actions/dto/apply-to-social-action.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class ApplyToSocialActionDto {
  @IsOptional()
  @IsString()
  message?: string; // Mensaje opcional del aplicante
}