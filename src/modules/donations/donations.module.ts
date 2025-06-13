import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from '../../entities/donation.entity';
import { User } from '../../entities/user.entity';
import { Foundation } from '../../entities/foundation.entity';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { UsersModule } from '../users/users.module';
import { FoundationsModule } from '../foundations/foundations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, User, Foundation]),
    UsersModule,
    FoundationsModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
