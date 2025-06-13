// src/modules/certificates/certificates.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from '../../entities/certificate.entity';
import { User } from '../../entities/user.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { ParticipationRequest } from '../../entities/participation_request.entity';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SocialActionsModule } from '../social-actions/social-actions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, User, SocialAction, ParticipationRequest]),
    UsersModule,
    NotificationsModule,
    SocialActionsModule,
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}