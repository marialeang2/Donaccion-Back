import { registerAs } from '@nestjs/config';
import { join } from 'path';
import { User } from '../entities/user.entity';
import { Foundation } from '../entities/foundation.entity';
import { Donation } from '../entities/donation.entity';
import { SocialAction } from '../entities/social_action.entity';
import { Comment } from '../entities/comment.entity';
import { Rating } from '../entities/rating.entity';
import { ParticipationRequest } from '../entities/participation_request.entity';
import { Certificate } from '../entities/certificate.entity';
import { Notification } from '../entities/notification.entity';
import { Suggestion } from '../entities/suggestion.entity';
import { Favorite } from '../entities/favorite.entity';

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'social_donations',
  entities: [
    User, 
    Foundation, 
    Donation, 
    SocialAction, 
    Comment, 
    Rating, 
    ParticipationRequest, 
    Certificate, 
    Notification, 
    Suggestion,
    Favorite
  ],
  synchronize: process.env.NODE_ENV !== 'production', // No usar en producción
    // dropSchema: true,  // ¡CUIDADO! Esto borrará toda la base de datos
  logging: process.env.NODE_ENV !== 'production',
}));