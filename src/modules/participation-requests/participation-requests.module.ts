// src/modules/participation-requests/participation-requests.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipationRequest } from '../../entities/participation_request.entity';
import { User } from '../../entities/user.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { ParticipationRequestsController } from './participation-requests.controller';
import { ParticipationRequestsService } from './participation-requests.service';
import { UsersModule } from '../users/users.module';
import { SocialActionsModule } from '../social-actions/social-actions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParticipationRequest, User, SocialAction, Foundation]),
    UsersModule,
    SocialActionsModule,
    NotificationsModule,
  ],
  controllers: [ParticipationRequestsController],
  providers: [ParticipationRequestsService],
  exports: [ParticipationRequestsService],
})
export class ParticipationRequestsModule {}