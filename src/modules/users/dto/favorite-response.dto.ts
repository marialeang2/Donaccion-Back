import { Exclude, Expose } from 'class-transformer';
import { FavoriteType } from '../../../entities/favorite.entity';

@Exclude()
export class FavoriteResponseDto {
  @Expose()
  id: string;

  @Expose()
  user_id: string;

  @Expose()
  item_id: string;

  @Expose()
  item_type: FavoriteType;

  constructor(partial: Partial<FavoriteResponseDto>) {
    Object.assign(this, partial);
  }
}