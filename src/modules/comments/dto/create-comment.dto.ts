import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @ValidateIf(o => !o.social_action_id && !o.foundation_id)
  @IsUUID()
  donation_id?: string;

  @ValidateIf(o => !o.donation_id && !o.foundation_id)
  @IsUUID()
  social_action_id?: string;

  @ValidateIf(o => !o.donation_id && !o.social_action_id)
  @IsUUID()
  foundation_id?: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}