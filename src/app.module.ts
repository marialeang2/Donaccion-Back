import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { FoundationsModule } from './modules/foundations/foundations.module';
import { DonationsModule } from './modules/donations/donations.module';
import { SocialActionsModule } from './modules/social-actions/social-actions.module';
import { CommentsModule } from './modules/comments/comments.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { ParticipationRequestsModule } from './modules/participation-requests/participation-requests.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SuggestionsModule } from './modules/suggestions/suggestions.module';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    
    // Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database'),
    }),
    
    // Módulos de la aplicación
    AuthModule, // Módulo de autenticación
    UsersModule,
    FoundationsModule,
    DonationsModule,
    SocialActionsModule,
    CommentsModule,
    RatingsModule,
    ParticipationRequestsModule,
    CertificatesModule,
    NotificationsModule,
    SuggestionsModule,
  ],
})
export class AppModule {}
