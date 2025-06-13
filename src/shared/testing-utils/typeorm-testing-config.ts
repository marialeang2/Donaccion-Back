import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from '../../entities/certificate.entity';
import {Comment} from '../../entities/comment.entity';
import { Donation } from '../../entities/donation.entity';
import { Favorite } from '../../entities/favorite.entity';
import { Foundation } from '../../entities/foundation.entity';
import { Notification } from '../../entities/notification.entity';
import { ParticipationRequest } from '../../entities/participation_request.entity';
import { Rating } from '../../entities/rating.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { Suggestion } from '../..//entities/suggestion.entity';
import { User } from '../../entities/user.entity';



export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [Certificate, Comment, Donation, Favorite, Foundation, Notification, ParticipationRequest, Rating, SocialAction, Suggestion, User],
    synchronize: true,
    //keepConnectionAlive: true,
  }),
  TypeOrmModule.forFeature([Certificate, Comment, Donation, Favorite, Foundation, Notification, ParticipationRequest, Rating, SocialAction, Suggestion, User]),
];
