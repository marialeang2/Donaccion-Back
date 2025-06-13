import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Check } from 'typeorm';
import { User } from './user.entity';
import { Donation } from './donation.entity';
import { SocialAction } from './social_action.entity';
import { Foundation } from './foundation.entity';

@Entity('comments')
@Check(`("donation_id" IS NOT NULL OR "social_action_id" IS NOT NULL OR "foundation_id" IS NOT NULL)`) 
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  donation_id?: string;

  @Column('uuid', { nullable: true })
  social_action_id?: string;

  @Column('uuid', { nullable: true })
  foundation_id?: string;

  @Column('text')
  text: string;

  @CreateDateColumn()
  comment_date: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Donation, donation => donation.comments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'donation_id' })
  donation?: Donation;

  @ManyToOne(() => SocialAction, socialAction => socialAction.comments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'social_action_id' })
  social_action?: SocialAction;

  @ManyToOne(() => Foundation, foundation => foundation.comments, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'foundation_id' })
  foundation?: Foundation;
}