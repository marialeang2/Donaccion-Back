// src/modules/social-actions/social-actions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { ParticipationRequest } from '../../entities/participation_request.entity';
import { SocialActionsController } from './social-actions.controller';
import { SocialActionsService } from './social-actions.service';
import { FoundationsModule } from '../foundations/foundations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialAction, Foundation, ParticipationRequest]),
    FoundationsModule
  ],
  controllers: [SocialActionsController],
  providers: [SocialActionsService],
  exports: [SocialActionsService],
})
export class SocialActionsModule {}