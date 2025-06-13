import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from './user.entity';
import { Donation } from './donation.entity';
import { SocialAction } from './social_action.entity';
import { Comment } from './comment.entity';

@Entity('foundations')
export class Foundation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  user_id: string;

  @OneToOne(() => User, user => user.foundation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  legal_name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  website?: string;

  @OneToMany(() => Donation, donation => donation.foundation)
  donations: Donation[];

  @OneToMany(() => SocialAction, socialAction => socialAction.foundation)
  social_actions: SocialAction[];

  @OneToMany(() => Comment, comment => comment.foundation)
  comments: Comment[];
}