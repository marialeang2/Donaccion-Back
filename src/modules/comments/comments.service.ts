// src/modules/comments/comments.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { User } from '../../entities/user.entity';
import { Donation } from '../../entities/donation.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
    @InjectRepository(SocialAction)
    private socialActionsRepository: Repository<SocialAction>,
    @InjectRepository(Foundation)
    private foundationsRepository: Repository<Foundation>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // Verificar si el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createCommentDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${createCommentDto.user_id}" not found`);
    }

    // Verificar que al menos uno de donation_id, social_action_id o foundation_id esté presente
    if (!createCommentDto.donation_id && !createCommentDto.social_action_id && !createCommentDto.foundation_id) {
      throw new BadRequestException('Either donation_id, social_action_id, or foundation_id must be provided');
    }

    // Verificar que solo uno esté presente
    const fieldsPresent = [
      createCommentDto.donation_id, 
      createCommentDto.social_action_id, 
      createCommentDto.foundation_id
    ].filter(Boolean).length;
    
    if (fieldsPresent > 1) {
      throw new BadRequestException('Only one of donation_id, social_action_id, or foundation_id should be provided');
    }

    // Verificar si la donación existe (si se proporciona)
    if (createCommentDto.donation_id) {
      const donation = await this.donationsRepository.findOne({
        where: { id: createCommentDto.donation_id },
      });

      if (!donation) {
        throw new NotFoundException(`Donation with ID "${createCommentDto.donation_id}" not found`);
      }
    }

    // Verificar si la acción social existe (si se proporciona)
    if (createCommentDto.social_action_id) {
      const socialAction = await this.socialActionsRepository.findOne({
        where: { id: createCommentDto.social_action_id },
      });

      if (!socialAction) {
        throw new NotFoundException(`Social Action with ID "${createCommentDto.social_action_id}" not found`);
      }
    }

    // Verificar si la fundación existe (si se proporciona)
    if (createCommentDto.foundation_id) {
      const foundation = await this.foundationsRepository.findOne({
        where: { id: createCommentDto.foundation_id },
      });

      if (!foundation) {
        throw new NotFoundException(`Foundation with ID "${createCommentDto.foundation_id}" not found`);
      }
    }

    // Crear y guardar el nuevo comentario
    const newComment = this.commentsRepository.create({
      ...createCommentDto,
      comment_date: new Date()
    });
    
    return this.commentsRepository.save(newComment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentsRepository.find({
      relations: ['user', 'donation', 'social_action', 'foundation'],
      order: { comment_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'donation', 'social_action', 'foundation'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return comment;
  }

  async findByUser(userId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { user_id: userId },
      relations: ['donation', 'social_action', 'foundation'],
      order: { comment_date: 'DESC' },
    });
  }

  async findByDonation(donationId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { donation_id: donationId },
      relations: ['user'],
      order: { comment_date: 'DESC' },
    });
  }

  async findBySocialAction(socialActionId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { social_action_id: socialActionId },
      relations: ['user'],
      order: { comment_date: 'DESC' },
    });
  }

  async findByFoundation(foundationId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { foundation_id: foundationId },
      relations: ['user'],
      order: { comment_date: 'DESC' },
    });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    
    // Actualizar el comentario
    await this.commentsRepository.update(id, updateCommentDto);
    
    // Devolver el comentario actualizado
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.commentsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }
  }

  // Métodos de verificación
  async verifyDonationCommentPermission(donationId: string, userId: string): Promise<void> {
    const donation = await this.donationsRepository.findOne({
      where: { id: donationId },
      relations: ['user', 'foundation', 'foundation.user'],
    });
    
    if (!donation) {
      throw new NotFoundException(`Donation with ID "${donationId}" not found`);
    }
    
    // Verificar que el usuario esté relacionado con la donación (donante o fundación receptora)
    const isFoundationUser = donation.foundation && 
                             donation.foundation.user && 
                             donation.foundation.user.id === userId;
                             
    if (donation.user_id !== userId && !isFoundationUser) {
      throw new ForbiddenException('You do not have permission to comment on this donation');
    }
  }
  
  async verifySocialActionCommentPermission(socialActionId: string, userId: string): Promise<void> {
    const socialAction = await this.socialActionsRepository.findOne({
      where: { id: socialActionId },
      relations: ['foundation', 'foundation.user', 'participation_requests'],
    });
    
    if (!socialAction) {
      throw new NotFoundException(`Social Action with ID "${socialActionId}" not found`);
    }
    
    // Verificar que el usuario sea la fundación o un participante aceptado
    const isFoundationUser = socialAction.foundation && 
                             socialAction.foundation.user && 
                             socialAction.foundation.user.id === userId;
                             
    const isParticipant = socialAction.participation_requests?.some(
      request => request.user_id === userId && request.status === 'accepted'
    );
    
    if (!isFoundationUser && !isParticipant) {
      throw new ForbiddenException('You do not have permission to comment on this social action');
    }
  }

  async verifyFoundationCommentPermission(foundationId: string, userId: string): Promise<void> {
    const foundation = await this.foundationsRepository.findOne({
      where: { id: foundationId },
    });
    
    if (!foundation) {
      throw new NotFoundException(`Foundation with ID "${foundationId}" not found`);
    }
    
    // En el caso de comentarios a fundaciones, cualquier usuario autenticado puede comentar
    // Así que no hay restricciones adicionales aquí, pero podríamos agregarlas si fuera necesario
  }
}