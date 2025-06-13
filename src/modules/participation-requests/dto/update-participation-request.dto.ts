import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestStatus } from '../../../entities/participation_request.entity';

export class UpdateParticipationRequestDto {
  @IsNotEmpty()
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
