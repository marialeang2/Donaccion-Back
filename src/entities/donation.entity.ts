import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from './user.entity';
import { Foundation } from './foundation.entity';
import { Comment } from './comment.entity';
import { Rating } from './rating.entity';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  user_id: string;

  @Index()
  @Column('uuid')
  foundation_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Index()
  @CreateDateColumn()
  donation_date: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Foundation, foundation => foundation.donations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'foundation_id' })
  foundation: Foundation;

  @OneToMany(() => Comment, comment => comment.donation)
  comments: Comment[];

  @OneToMany(() => Rating, rating => rating.donation)
  ratings: Rating[];
}
