import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Favorite, FavoriteType } from '../../entities/favorite.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar si el email ya está en uso
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear y guardar el nuevo usuario
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);
    return new UserResponseDto(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map(user => new UserResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    
    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Si se actualiza el email, verificar que no esté en uso
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    // Si se actualiza la contraseña, hash
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar usuario
    await this.usersRepository.update(id, updateUserDto);
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    
    return new UserResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  // Métodos para favoritos
  async getFavorites(userId: string): Promise<FavoriteResponseDto[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    
    const favorites = await this.favoritesRepository.find({ 
      where: { user_id: userId } 
    });
    
    return favorites.map(favorite => new FavoriteResponseDto(favorite));
  }

  async addFavorite(userId: string, addFavoriteDto: AddFavoriteDto): Promise<FavoriteResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    
    // Verificar si ya existe el favorito
    const existingFavorite = await this.favoritesRepository.findOne({
      where: { 
        user_id: userId,
        item_id: addFavoriteDto.item_id,
        item_type: addFavoriteDto.item_type
      }
    });
    
    if (existingFavorite) {
      throw new ConflictException('This item is already in favorites');
    }
    
    // Crear nuevo favorito
    const newFavorite = this.favoritesRepository.create({
      user_id: userId,
      item_id: addFavoriteDto.item_id,
      item_type: addFavoriteDto.item_type
    });
    
    const savedFavorite = await this.favoritesRepository.save(newFavorite);
    return new FavoriteResponseDto(savedFavorite);
  }

  async removeFavorite(userId: string, itemId: string): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { 
        user_id: userId,
        item_id: itemId
      }
    });
    
    if (!favorite) {
      throw new NotFoundException(`Favorite not found`);
    }
    
    await this.favoritesRepository.remove(favorite);
  }
}