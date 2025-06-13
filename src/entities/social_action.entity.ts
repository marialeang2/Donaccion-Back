import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Foundation } from './foundation.entity';
import { ParticipationRequest } from './participation_request.entity';
import { Comment } from './comment.entity';
import { Rating } from './rating.entity';

@Entity('social_actions')
export class SocialAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  foundation_id: string;

  @Column('text')
  description: string;

  @Index()
  @Column('timestamp')
  start_date: Date;

  @Index()
  @Column('timestamp')
  end_date: Date;

  @ManyToOne(() => Foundation, (foundation) => foundation.social_actions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'foundation_id' })
  foundation: Foundation;

  @OneToMany(() => ParticipationRequest, (request) => request.social_action)
  participation_requests: ParticipationRequest[];

  @OneToMany(() => Comment, (comment) => comment.social_action)
  comments: Comment[];

  @OneToMany(() => Rating, (rating) => rating.social_action)
  ratings: Rating[];
}
