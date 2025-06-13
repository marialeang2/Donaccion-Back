// src/modules/participation-requests/participation-requests.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipationRequest, RequestStatus } from '../../entities/participation_request.entity';
import { User } from '../../entities/user.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { CreateParticipationRequestDto } from './dto/create-participation-request.dto';
import { UpdateParticipationRequestDto } from './dto/update-participation-request.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ParticipationRequestsService {
  constructor(
    @InjectRepository(ParticipationRequest)
    private participationRequestsRepository: Repository<ParticipationRequest>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SocialAction)
    private socialActionsRepository: Repository<SocialAction>,
    @InjectRepository(Foundation)
    private foundationsRepository: Repository<Foundation>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createParticipationRequestDto: CreateParticipationRequestDto): Promise<ParticipationRequest> {
    // Verificar si el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createParticipationRequestDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${createParticipationRequestDto.user_id}" not found`);
    }

    // Verificar si la acción social existe
    const socialAction = await this.socialActionsRepository.findOne({
      where: { id: createParticipationRequestDto.social_action_id },
      relations: ['foundation', 'foundation.user'],
    });

    if (!socialAction) {
      throw new NotFoundException(`Social Action with ID "${createParticipationRequestDto.social_action_id}" not found`);
    }

    // Verificar si ya existe una solicitud para este usuario y acción social
    const existingRequest = await this.participationRequestsRepository.findOne({
      where: {
        user_id: createParticipationRequestDto.user_id,
        social_action_id: createParticipationRequestDto.social_action_id,
      },
    });

    if (existingRequest) {
      throw new ConflictException(`Participation request already exists for this user and social action`);
    }

    // Establecer estado por defecto si no se proporciona
    const status = createParticipationRequestDto.status || RequestStatus.PENDING;

    // Crear y guardar la nueva solicitud
    const newRequest = this.participationRequestsRepository.create({
      ...createParticipationRequestDto,
      status,
      request_date: new Date()
    });
    
    const savedRequest = await this.participationRequestsRepository.save(newRequest);

    // Notificar a la fundación sobre la nueva solicitud
    if (socialAction.foundation && socialAction.foundation.user) {
      await this.notificationsService.create({
        user_id: socialAction.foundation.user.id,
        message: `New participation request for "${socialAction.description}" from ${user.name}`,
      });
    }

    return savedRequest;
  }

  async findAll(): Promise<ParticipationRequest[]> {
    return this.participationRequestsRepository.find({
      relations: ['user', 'social_action', 'social_action.foundation'],
      order: { request_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ParticipationRequest> {
    const request = await this.participationRequestsRepository.findOne({
      where: { id },
      relations: ['user', 'social_action', 'social_action.foundation'],
    });

    if (!request) {
      throw new NotFoundException(`Participation Request with ID "${id}" not found`);
    }

    return request;
  }

  async findByUser(userId: string): Promise<ParticipationRequest[]> {
    return this.participationRequestsRepository.find({
      where: { user_id: userId },
      relations: ['social_action', 'social_action.foundation'],
      order: { request_date: 'DESC' },
    });
  }

  async findBySocialAction(socialActionId: string): Promise<ParticipationRequest[]> {
    return this.participationRequestsRepository.find({
      where: { social_action_id: socialActionId },
      relations: ['user'],
      order: { request_date: 'DESC' },
    });
  }

  async findPendingBySocialAction(socialActionId: string): Promise<ParticipationRequest[]> {
    return this.participationRequestsRepository.find({
      where: { 
        social_action_id: socialActionId,
        status: RequestStatus.PENDING
      },
      relations: ['user'],
      order: { request_date: 'ASC' },
    });
  }
  
  // Nuevo método para obtener solicitudes por status
  async findBySocialActionAndStatus(socialActionId: string, status: RequestStatus): Promise<ParticipationRequest[]> {
    return this.participationRequestsRepository.find({
      where: { 
        social_action_id: socialActionId,
        status
      },
      relations: ['user'],
      order: { request_date: 'DESC' },
    });
  }

  // Método para obtener solicitudes con usuarios detallados, ordenados por estado y fecha
  async findDetailedBySocialAction(socialActionId: string): Promise<ParticipationRequest[]> {
    return this.participationRequestsRepository.find({
      where: { social_action_id: socialActionId },
      relations: ['user'],
      order: {
        status: 'ASC', // Pending primero, luego accepted, luego rejected
        request_date: 'DESC'
      }
    });
  }

  async update(id: string, updateParticipationRequestDto: UpdateParticipationRequestDto): Promise<ParticipationRequest> {
    const request = await this.findOne(id);
    
    // Si el estado está cambiando, enviar notificación al usuario
    if (request.status !== updateParticipationRequestDto.status) {
      const user = await this.usersRepository.findOne({
        where: { id: request.user_id },
      });
      
      const socialAction = await this.socialActionsRepository.findOne({
        where: { id: request.social_action_id },
      });
      
      if (user && socialAction) {
        let message = '';
        if (updateParticipationRequestDto.status === RequestStatus.ACCEPTED) {
          message = `Your participation request for "${socialAction.description}" has been accepted.`;
        } else if (updateParticipationRequestDto.status === RequestStatus.REJECTED) {
          message = `Your participation request for "${socialAction.description}" has been rejected.`;
        }
        
        if (message) {
          await this.notificationsService.create({
            user_id: user.id,
            message,
          });
        }
      }
    }
    
    // Actualizar la solicitud
    await this.participationRequestsRepository.update(id, updateParticipationRequestDto);
    
    // Devolver la solicitud actualizada
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.participationRequestsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Participation Request with ID "${id}" not found`);
    }
  }

  // Método para obtener una acción social
  async getSocialAction(socialActionId: string): Promise<SocialAction> {
    const socialAction = await this.socialActionsRepository.findOne({
      where: { id: socialActionId },
      relations: ['foundation', 'foundation.user'],
    });

    if (!socialAction) {
      throw new NotFoundException(`Social Action with ID "${socialActionId}" not found`);
    }

    return socialAction;
  }

  // Método para verificar que un usuario (fundación) sea propietario de una acción social
  async checkFoundationOwnership(socialActionId: string, userId: string): Promise<void> {
    const socialAction = await this.getSocialAction(socialActionId);
    
    // Verificar que la fundación sea propietaria
    if (!socialAction.foundation || !socialAction.foundation.user) {
      throw new ForbiddenException('This social action is not associated with a foundation');
    }
    
    if (socialAction.foundation.user.id !== userId) {
      throw new ForbiddenException('You are not authorized to manage this social action');
    }
  }
}