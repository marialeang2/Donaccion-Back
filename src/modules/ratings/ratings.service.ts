// src/modules/ratings/ratings.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../../entities/rating.entity';
import { User } from '../../entities/user.entity';
import { Donation } from '../../entities/donation.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
    @InjectRepository(SocialAction)
    private socialActionsRepository: Repository<SocialAction>,
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    // Verificar si el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createRatingDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${createRatingDto.user_id}" not found`);
    }

    // Verificar que al menos uno de donation_id o social_action_id esté presente
    if (!createRatingDto.donation_id && !createRatingDto.social_action_id) {
      throw new BadRequestException('Either donation_id or social_action_id must be provided');
    }

    // Verificar que no ambos estén presentes
    if (createRatingDto.donation_id && createRatingDto.social_action_id) {
      throw new BadRequestException('Cannot provide both donation_id and social_action_id');
    }

    // Verificar si la donación existe (si se proporciona)
    if (createRatingDto.donation_id) {
      const donation = await this.donationsRepository.findOne({
        where: { id: createRatingDto.donation_id },
      });

      if (!donation) {
        throw new NotFoundException(`Donation with ID "${createRatingDto.donation_id}" not found`);
      }

      // Verificar si el usuario ya ha calificado esta donación
      const existingRating = await this.ratingsRepository.findOne({
        where: {
          user_id: createRatingDto.user_id,
          donation_id: createRatingDto.donation_id,
        },
      });

      if (existingRating) {
        throw new ConflictException(`User already rated this donation`);
      }
      
      // Verificar que el usuario está relacionado con esta donación
      if (donation.user_id !== createRatingDto.user_id) {
        throw new ForbiddenException('You can only rate donations you have made');
      }
    }

    // Verificar si la acción social existe (si se proporciona)
    if (createRatingDto.social_action_id) {
      const socialAction = await this.socialActionsRepository.findOne({
        where: { id: createRatingDto.social_action_id },
        relations: ['participation_requests'],
      });

      if (!socialAction) {
        throw new NotFoundException(`Social Action with ID "${createRatingDto.social_action_id}" not found`);
      }

      // Verificar si el usuario ya ha calificado esta acción social
      const existingRating = await this.ratingsRepository.findOne({
        where: {
          user_id: createRatingDto.user_id,
          social_action_id: createRatingDto.social_action_id,
        },
      });

      if (existingRating) {
        throw new ConflictException(`User already rated this social action`);
      }
      
      // Verificar si el usuario participó en la acción social
      const userParticipated = socialAction.participation_requests?.some(
        request => request.user_id === createRatingDto.user_id && request.status === 'accepted'
      );
      
      if (!userParticipated) {
        throw new ForbiddenException('You can only rate social actions you have participated in');
      }
    }

    // Crear y guardar la nueva calificación
    const newRating = this.ratingsRepository.create({
      ...createRatingDto,
      rating_date: new Date(),
    });
    
    return this.ratingsRepository.save(newRating);
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingsRepository.find({
      relations: ['user', 'donation', 'social_action'],
      order: { rating_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Rating> {
    const rating = await this.ratingsRepository.findOne({
      where: { id },
      relations: ['user', 'donation', 'social_action'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID "${id}" not found`);
    }

    return rating;
  }

  async findByUser(userId: string): Promise<Rating[]> {
    return this.ratingsRepository.find({
      where: { user_id: userId },
      relations: ['donation', 'social_action'],
      order: { rating_date: 'DESC' },
    });
  }

  async findByDonation(donationId: string): Promise<Rating[]> {
    return this.ratingsRepository.find({
      where: { donation_id: donationId },
      relations: ['user'],
      order: { rating_date: 'DESC' },
    });
  }

  async findBySocialAction(socialActionId: string): Promise<Rating[]> {
    return this.ratingsRepository.find({
      where: { social_action_id: socialActionId },
      relations: ['user'],
      order: { rating_date: 'DESC' },
    });
  }

  async getAverageForDonation(donationId: string): Promise<number> {
    // Verificar si la donación existe
    const donation = await this.donationsRepository.findOne({
      where: { id: donationId },
    });

    if (!donation) {
      throw new NotFoundException(`Donation with ID "${donationId}" not found`);
    }

    const ratings = await this.ratingsRepository.find({
      where: { donation_id: donationId },
    });

    if (ratings.length === 0) {
      return 0;
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  }

  async getAverageForSocialAction(socialActionId: string): Promise<number> {
    // Verificar si la acción social existe
    const socialAction = await this.socialActionsRepository.findOne({
      where: { id: socialActionId },
    });

    if (!socialAction) {
      throw new NotFoundException(`Social Action with ID "${socialActionId}" not found`);
    }

    const ratings = await this.ratingsRepository.find({
      where: { social_action_id: socialActionId },
    });

    if (ratings.length === 0) {
      return 0;
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  }

  async update(id: string, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.findOne(id);
    
    // Actualizar la calificación
    await this.ratingsRepository.update(id, updateRatingDto);
    
    // Devolver la calificación actualizada
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const rating = await this.findOne(id);
    
    if (!rating) {
      throw new NotFoundException(`Rating with ID "${id}" not found`);
    }
    
    const result = await this.ratingsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Rating with ID "${id}" not found`);
    }
  }

  // Método adicional para verificar propiedad
  async checkRatingOwnership(ratingId: string, userId: string): Promise<boolean> {
    const rating = await this.findOne(ratingId);
    return rating.user_id === userId;
  }
}