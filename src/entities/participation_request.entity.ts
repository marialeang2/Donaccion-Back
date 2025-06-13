import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { SocialAction } from './social_action.entity';

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('participation_requests')
export class ParticipationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  social_action_id: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @CreateDateColumn()
  request_date: Date;

  // Relation to User
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // If user is deleted, delete their requests
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relation to Social Action
  @ManyToOne(() => SocialAction, socialAction => socialAction.participation_requests, { onDelete: 'CASCADE' }) // If action is deleted, delete requests
  @JoinColumn({ name: 'social_action_id' })
  social_action: SocialAction;
}
