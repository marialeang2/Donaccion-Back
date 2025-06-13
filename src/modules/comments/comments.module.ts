import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../../entities/comment.entity';
import { User } from '../../entities/user.entity';
import { Donation } from '../../entities/donation.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { UsersModule } from '../users/users.module';
import { DonationsModule } from '../donations/donations.module';
import { SocialActionsModule } from '../social-actions/social-actions.module';
import { FoundationsModule } from '../foundations/foundations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User, Donation, SocialAction, Foundation]),
    UsersModule,
    DonationsModule,
    SocialActionsModule,
    FoundationsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}