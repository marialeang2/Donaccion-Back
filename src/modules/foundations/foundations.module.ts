import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Foundation } from '../../entities/foundation.entity';
import { User } from '../../entities/user.entity';
import { FoundationsController } from './foundations.controller';
import { FoundationsService } from './foundations.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Foundation, User]),
    UsersModule
  ],
  controllers: [FoundationsController],
  providers: [FoundationsService],
  exports: [FoundationsService],
})
export class FoundationsModule {}
