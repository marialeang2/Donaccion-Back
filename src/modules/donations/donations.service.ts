// src/modules/donations/donations.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from '../../entities/donation.entity';
import { User } from '../../entities/user.entity';
import { Foundation } from '../../entities/foundation.entity';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Foundation)
    private foundationsRepository: Repository<Foundation>,
  ) {}

  async create(createDonationDto: CreateDonationDto): Promise<Donation> {
    // Verificar si el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createDonationDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${createDonationDto.user_id}" not found`);
    }

    // Verificar si la fundación existe
    const foundation = await this.foundationsRepository.findOne({
      where: { id: createDonationDto.foundation_id },
    });

    if (!foundation) {
      throw new NotFoundException(`Foundation with ID "${createDonationDto.foundation_id}" not found`);
    }

    // Crear y guardar la nueva donación
    const newDonation = this.donationsRepository.create({
      ...createDonationDto,
      donation_date: new Date()
    });
    
    return this.donationsRepository.save(newDonation);
  }

  async findAll(): Promise<Donation[]> {
    return this.donationsRepository.find({
      relations: ['user', 'foundation'],
      order: { donation_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Donation> {
    const donation = await this.donationsRepository.findOne({
      where: { id },
      relations: ['user', 'foundation', 'comments', 'ratings'],
    });

    if (!donation) {
      throw new NotFoundException(`Donation with ID "${id}" not found`);
    }

    return donation;
  }

  async findByUser(userId: string): Promise<Donation[]> {
    return this.donationsRepository.find({
      where: { user_id: userId },
      relations: ['user', 'foundation'],
      order: { donation_date: 'DESC' },
    });
  }

  async findByFoundation(foundationId: string): Promise<Donation[]> {
    return this.donationsRepository.find({
      where: { foundation_id: foundationId },
      relations: ['user'],
      order: { donation_date: 'DESC' },
    });
  }

  async findByUserAndFoundation(userId: string, foundationId: string): Promise<Donation[]> {
    return this.donationsRepository.find({
      where: { 
        user_id: userId,
        foundation_id: foundationId
      },
      relations: ['user', 'foundation'],
      order: { donation_date: 'DESC' },
    });
  }

  async update(id: string, updateDonationDto: UpdateDonationDto): Promise<Donation> {
    const donation = await this.findOne(id);
    
    // Actualizar la donación
    await this.donationsRepository.update(id, updateDonationDto);
    
    // Devolver la donación actualizada
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.donationsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Donation with ID "${id}" not found`);
    }
  }

  async getFoundation(foundationId: string): Promise<Foundation> {
    const foundation = await this.foundationsRepository.findOne({
      where: { id: foundationId },
      relations: ['user'],
    });

    if (!foundation) {
      throw new NotFoundException(`Foundation with ID "${foundationId}" not found`);
    }

    return foundation;
  }

  async getFoundationByUserId(userId: string): Promise<Foundation> {
    const foundation = await this.foundationsRepository.findOne({
      where: { user_id: userId },
    });

    if (!foundation) {
      throw new NotFoundException(`Foundation not found for user with ID "${userId}"`);
    }

    return foundation;
  }

  async isFoundationUserForDonation(donationId: string, userId: string): Promise<boolean> {
    const donation = await this.donationsRepository.findOne({
      where: { id: donationId },
      relations: ['foundation'],
    });

    if (!donation || !donation.foundation) {
      return false;
    }

    const foundation = await this.foundationsRepository.findOne({
      where: { id: donation.foundation_id },
    });

    return foundation && foundation.user_id === userId;
  }
}