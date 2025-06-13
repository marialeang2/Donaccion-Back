import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSuggestionDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  processed?: boolean;
}
