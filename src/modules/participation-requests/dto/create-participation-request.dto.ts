import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { RequestStatus } from '../../../entities/participation_request.entity';

export class CreateParticipationRequestDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  social_action_id: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
