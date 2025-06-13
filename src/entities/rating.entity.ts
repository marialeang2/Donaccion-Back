import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Check } from 'typeorm';
import { User } from './user.entity';
import { Donation } from './donation.entity';
import { SocialAction } from './social_action.entity';

@Entity('ratings')
@Check(`"rating" >= 1 AND "rating" <= 5`) // Constraint para rating
@Check(`("donation_id" IS NOT NULL OR "social_action_id" IS NOT NULL)`) // Constraint adicional
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  donation_id?: string;

  @Column('uuid', { nullable: true })
  social_action_id?: string;

  @Column('int')
  rating: number; // Rating from 1 to 5

  @CreateDateColumn()
  rating_date: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Donation, donation => donation.ratings, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'donation_id' })
  donation?: Donation;

  @ManyToOne(() => SocialAction, socialAction => socialAction.ratings, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'social_action_id' })
  social_action?: SocialAction;
}

