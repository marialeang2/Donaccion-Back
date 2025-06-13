import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from '../../entities/rating.entity';
import { User } from '../../entities/user.entity';
import { Donation } from '../../entities/donation.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { UsersModule } from '../users/users.module';
import { DonationsModule } from '../donations/donations.module';
import { SocialActionsModule } from '../social-actions/social-actions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rating, User, Donation, SocialAction]),
    UsersModule,
    DonationsModule,
    SocialActionsModule,
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
