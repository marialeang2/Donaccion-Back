import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, Index } from 'typeorm';
import { Foundation } from './foundation.entity';

export enum UserType {
  USER = 'user',
  FOUNDATION = 'foundation',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Remember to hash passwords in practice

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.USER,
  })
  user_type: UserType;

  @CreateDateColumn()
  created_at: Date;

  // Relation to Foundation (if user_type is 'foundation')
  @OneToOne(() => Foundation, foundation => foundation.user)
  foundation?: Foundation;
}
