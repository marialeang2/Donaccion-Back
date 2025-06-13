import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

export enum FavoriteType {
  FOUNDATION = 'foundation',
  OPPORTUNITY = 'opportunity',
}

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  user_id: string;

  @Column('uuid')
  item_id: string;

  @Column({
    type: 'enum',
    enum: FavoriteType,
  })
  item_type: FavoriteType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}