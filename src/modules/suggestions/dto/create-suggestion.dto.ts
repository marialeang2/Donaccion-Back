import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSuggestionDto {
  @IsOptional()
  @IsUUID()
  user_id?: string; // Hacerlo opcional

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  processed?: boolean;
}