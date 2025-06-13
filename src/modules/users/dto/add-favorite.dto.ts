import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { FavoriteType } from '../../../entities/favorite.entity';

export class AddFavoriteDto {
  @IsNotEmpty()
  @IsUUID()
  item_id: string;

  @IsNotEmpty()
  @IsEnum(FavoriteType)
  item_type: FavoriteType;
}