import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Foundation } from '../../entities/foundation.entity';
import { User } from '../../entities/user.entity';
import { CreateFoundationDto } from './dto/create-foundation.dto';
import { UpdateFoundationDto } from './dto/update-foundation.dto';
import { UserType } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class FoundationsService {
  constructor(
    @InjectRepository(Foundation)
    private foundationsRepository: Repository<Foundation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
  ) {}

  async create(createFoundationDto: CreateFoundationDto): Promise<Foundation> {
    // Verificar si el usuario existe y es de tipo FOUNDATION
    const user = await this.usersRepository.findOne({
      where: { id: createFoundationDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${createFoundationDto.user_id}" not found`);
    }

    if (user.user_type !== UserType.FOUNDATION) {
      throw new BadRequestException(`User with ID "${createFoundationDto.user_id}" is not a foundation type user`);
    }

    // Verificar si ya existe una fundación para ese usuario
    const existingFoundation = await this.foundationsRepository.findOne({
      where: { user_id: createFoundationDto.user_id },
    });

    if (existingFoundation) {
      throw new ConflictException(`Foundation already exists for user with ID "${createFoundationDto.user_id}"`);
    }

    // Crear y guardar la nueva fundación
    const newFoundation = this.foundationsRepository.create(createFoundationDto);
    return this.foundationsRepository.save(newFoundation);
  }

  async findAll(): Promise<Foundation[]> {
    return this.foundationsRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Foundation> {
    const foundation = await this.foundationsRepository.findOne({
      where: { id },
      relations: ['user', 'donations', 'social_actions'],
    });

    if (!foundation) {
      throw new NotFoundException(`Foundation with ID "${id}" not found`);
    }

    return foundation;
  }

  async findByUserId(userId: string): Promise<Foundation> {
    const foundation = await this.foundationsRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!foundation) {
      throw new NotFoundException(`Foundation for user with ID "${userId}" not found`);
    }

    return foundation;
  }

  async update(id: string, updateFoundationDto: UpdateFoundationDto): Promise<Foundation> {
    const foundation = await this.findOne(id);
    
    // Actualizar la fundación
    await this.foundationsRepository.update(id, updateFoundationDto);
    
    // Devolver la fundación actualizada
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.foundationsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Foundation with ID "${id}" not found`);
    }
  }
}
