// src/modules/social-actions/social-actions.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Repository } from 'typeorm';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { ParticipationRequest, RequestStatus } from '../../entities/participation_request.entity';
import { CreateSocialActionDto } from './dto/create-social-action.dto';
import { UpdateSocialActionDto } from './dto/update-social-action.dto';
import { ApplyToSocialActionDto } from './dto/apply-to-social-action.dto';

@Injectable()
export class SocialActionsService {
  constructor(
    @InjectRepository(SocialAction)
    private socialActionsRepository: Repository<SocialAction>,
    @InjectRepository(Foundation)
    private foundationsRepository: Repository<Foundation>,
    @InjectRepository(ParticipationRequest)
    private participationRequestsRepository: Repository<ParticipationRequest>,
  ) {}

  private isAdminWithWriteAccess(email: string): boolean {
    return email === 'admin@admin.com' || email === 'admin@escritor.com';
  }

  private isAdminWithDeleteAccess(email: string): boolean {
    return email === 'admin@admin.com' || email === 'admin@eliminador.com';
  }

  private isFullAdmin(email: string): boolean {
    return email === 'admin@admin.com';
  }

  // Métodos especiales para admin@admin.com
  async createAsAdmin(createSocialActionDto: CreateSocialActionDto): Promise<SocialAction> {
    // Verificar si la fundación existe
    const foundation = await this.foundationsRepository.findOne({
      where: { id: createSocialActionDto.foundation_id },
    });

    if (!foundation) {
      throw new NotFoundException(`Foundation with ID "${createSocialActionDto.foundation_id}" not found`);
    }
    
    // Crear y guardar la nueva acción social sin verificar permisos
    const newSocialAction = this.socialActionsRepository.create(createSocialActionDto);
    return this.socialActionsRepository.save(newSocialAction);
  }

  async updateAsAdmin(id: string, updateSocialActionDto: UpdateSocialActionDto): Promise<SocialAction> {
    const socialAction = await this.findOne(id);
    
    // Actualizar la acción social sin verificar permisos
    await this.socialActionsRepository.update(id, updateSocialActionDto);
    
    // Devolver la acción social actualizada
    return this.findOne(id);
  }

  async removeAsAdmin(id: string): Promise<void> {
    const result = await this.socialActionsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Social Action with ID "${id}" not found`);
    }
  }

  async applyToSocialActionAsAdmin(
    socialActionId: string, 
    userId: string, 
    applyDto: ApplyToSocialActionDto
  ): Promise<ParticipationRequest> {
    // Verificar que la acción social existe
    const socialAction = await this.findOne(socialActionId);
    
    // Crear la solicitud de participación sin verificar restricciones
    const newRequest = this.participationRequestsRepository.create({
      user_id: userId,
      social_action_id: socialActionId,
      status: RequestStatus.PENDING,
      request_date: new Date(),
      ...applyDto
    });
    
    return this.participationRequestsRepository.save(newRequest);
  }

  // Métodos regulares con verificaciones de permisos
  async checkFoundationUser(foundationId: string, userId: string, userEmail?: string): Promise<void> {
    // Si es admin@admin.com, permitir acceso total
    if (userEmail && this.isFullAdmin(userEmail)) {
      return;
    }
    
    // Si es un administrador con permisos, permitir acceso
    if (userEmail && (this.isAdminWithWriteAccess(userEmail) || this.isAdminWithDeleteAccess(userEmail))) {
      return;
    }
    
    // Para usuarios normales, verificar si la fundación existe
    const foundation = await this.foundationsRepository.findOne({
      where: { id: foundationId }
    });
    
    if (!foundation) {
      throw new NotFoundException(`Foundation with ID "${foundationId}" not found`);
    }
    
    // Verificar si el usuario está asociado a esta fundación
    if (foundation.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to manage this foundation');
    }
  }

  async create(createSocialActionDto: CreateSocialActionDto, userId: string, userEmail?: string): Promise<SocialAction> {
    // Si es admin@admin.com, permitir siempre
    if (userEmail && this.isFullAdmin(userEmail)) {
      return this.createAsAdmin(createSocialActionDto);
    }
    
    // Verificar si la fundación existe
    const foundation = await this.foundationsRepository.findOne({
      where: { id: createSocialActionDto.foundation_id },
    });

    if (!foundation) {
      throw new NotFoundException(`Foundation with ID "${createSocialActionDto.foundation_id}" not found`);
    }
    
    // Verificar que el usuario tenga permiso para esta fundación
    await this.checkFoundationUser(foundation.id, userId, userEmail);

    // Crear y guardar la nueva acción social
    const newSocialAction = this.socialActionsRepository.create(createSocialActionDto);
    return this.socialActionsRepository.save(newSocialAction);
  }

  async findAll(): Promise<SocialAction[]> {
    return this.socialActionsRepository.find({
      relations: ['foundation'],
      order: { start_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SocialAction> {
    const socialAction = await this.socialActionsRepository.findOne({
      where: { id },
      relations: ['foundation', 'participation_requests', 'comments', 'ratings'],
    });

    if (!socialAction) {
      throw new NotFoundException(`Social Action with ID "${id}" not found`);
    }

    return socialAction;
  }

  async findByFoundation(foundationId: string): Promise<SocialAction[]> {
    return this.socialActionsRepository.find({
      where: { foundation_id: foundationId },
      order: { start_date: 'DESC' },
    });
  }

  async findUpcoming(): Promise<SocialAction[]> {
    const currentDate = new Date();
    return this.socialActionsRepository.find({
      where: { start_date: MoreThan(currentDate) },
      relations: ['foundation'],
      order: { start_date: 'ASC' },
    });
  }

  async findActive(): Promise<SocialAction[]> {
    const currentDate = new Date();
    return this.socialActionsRepository.find({
      where: { 
        start_date: LessThanOrEqual(currentDate),
        end_date: MoreThanOrEqual(currentDate)
      },
      relations: ['foundation'],
      order: { end_date: 'ASC' },
    });
  }

  async update(id: string, updateSocialActionDto: UpdateSocialActionDto, userEmail?: string): Promise<SocialAction> {
    // Si es admin@admin.com, permitir siempre
    if (userEmail && this.isFullAdmin(userEmail)) {
      return this.updateAsAdmin(id, updateSocialActionDto);
    }
    
    const socialAction = await this.findOne(id);
    
    // Si es un admin con permisos de escritura, no hace falta verificar
    if (userEmail && this.isAdminWithWriteAccess(userEmail)) {
      // Actualizar la acción social
      await this.socialActionsRepository.update(id, updateSocialActionDto);
      return this.findOne(id);
    }
    
    // Actualizar la acción social
    await this.socialActionsRepository.update(id, updateSocialActionDto);
    
    // Devolver la acción social actualizada
    return this.findOne(id);
  }

  async remove(id: string, userEmail?: string): Promise<void> {
    // Si es admin@admin.com, permitir siempre
    if (userEmail && this.isFullAdmin(userEmail)) {
      return this.removeAsAdmin(id);
    }
    
    // Si es un admin con permisos de eliminación, no hace falta verificar
    if (userEmail && this.isAdminWithDeleteAccess(userEmail)) {
      const result = await this.socialActionsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Social Action with ID "${id}" not found`);
      }
      return;
    }
    
    const result = await this.socialActionsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Social Action with ID "${id}" not found`);
    }
  }

  // Método para aplicar a una acción social (nuevo)
  async applyToSocialAction(
    socialActionId: string, 
    userId: string, 
    applyDto: ApplyToSocialActionDto,
    userEmail?: string
  ): Promise<ParticipationRequest> {
    // Si es admin@admin.com, permitir siempre
    if (userEmail && this.isFullAdmin(userEmail)) {
      return this.applyToSocialActionAsAdmin(socialActionId, userId, applyDto);
    }
    
    // Verificar que la acción social existe
    const socialAction = await this.findOne(socialActionId);
    
    // Verificar si ya existe una solicitud pendiente
    const existingRequest = await this.participationRequestsRepository.findOne({
      where: { 
        user_id: userId,
        social_action_id: socialActionId 
      }
    });
    
    if (existingRequest) {
      throw new ForbiddenException('You have already applied to this social action');
    }
    
    // Crear la solicitud de participación
    const newRequest = this.participationRequestsRepository.create({
      user_id: userId,
      social_action_id: socialActionId,
      status: RequestStatus.PENDING,
      request_date: new Date(),
      ...applyDto // Cualquier información adicional de la solicitud
    });
    
    return this.participationRequestsRepository.save(newRequest);
  }
}