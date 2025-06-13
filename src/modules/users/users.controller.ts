import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Función auxiliar para verificar roles de admin
  private isFullAdmin(req): boolean {
    return req.user && req.user.email === 'admin@admin.com';
  }

  private isReadOnlyAdmin(req): boolean {
    return req.user && req.user.email === 'admin@lector.com';
  }

  private isWriterAdmin(req): boolean {
    return req.user && req.user.email === 'admin@escritor.com';
  }

  private isDeleterAdmin(req): boolean {
    return req.user && req.user.email === 'admin@eliminador.com';
  }

  // Funciones para verificar tipos de acceso
  private hasReadAccess(req): boolean {
    return this.isFullAdmin(req) || this.isReadOnlyAdmin(req) || 
           this.isWriterAdmin(req) || this.isDeleterAdmin(req);
  }

  private hasWriteAccess(req): boolean {
    return this.isFullAdmin(req) || this.isWriterAdmin(req);
  }

  private hasDeleteAccess(req): boolean {
    return this.isFullAdmin(req) || this.isDeleterAdmin(req);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  // Alias para mantener compatibilidad con endpoint anterior
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  findAll(@Req() req): Promise<UserResponseDto[]> {
    // Permitir acceso a cualquier tipo de administrador
    if (this.hasReadAccess(req)) {
      return this.usersService.findAll();
    }
    
    // Usuarios normales no pueden ver todos los usuarios
    throw new ForbiddenException('You do not have permission to view all users');
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req
  ): Promise<UserResponseDto> {
    // Permitir acceso a cualquier tipo de administrador
    if (this.hasReadAccess(req)) {
      return this.usersService.findOne(id);
    }
    
    // Los usuarios normales solo pueden ver su propio perfil
    if (req.user.id !== id) {
      throw new ForbiddenException('You do not have permission to view this user');
    }
    
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  async updatePatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<UserResponseDto> {
    // Permitir modificación a administradores con permisos de escritura
    if (this.hasWriteAccess(req)) {
      return this.usersService.update(id, updateUserDto);
    }
    
    // Los usuarios normales solo pueden actualizar su propio perfil
    if (req.user.id !== id) {
      throw new ForbiddenException('You do not have permission to update this user');
    }
    
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id')
  async updatePut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<UserResponseDto> {
    return this.updatePatch(id, updateUserDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    // Permitir eliminación a administradores con permisos de eliminación
    if (this.hasDeleteAccess(req)) {
      return this.usersService.remove(id);
    }
    
    // Los usuarios normales solo pueden eliminar su propio perfil
    if (req.user.id !== id) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }
    
    return this.usersService.remove(id);
  }

  // Endpoints de favoritos
  @UseGuards(JwtAuthGuard)
  @Get('users/:id/favorites')
  async getFavorites(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<FavoriteResponseDto[]> {
    // Permitir acceso a cualquier tipo de administrador
    if (this.hasReadAccess(req)) {
      return this.usersService.getFavorites(id);
    }
    
    // Los usuarios normales solo pueden ver sus propios favoritos
    if (req.user.id !== id) {
      throw new ForbiddenException('You do not have permission to view this user\'s favorites');
    }
    
    return this.usersService.getFavorites(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/:id/favorites')
  async addFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addFavoriteDto: AddFavoriteDto,
    @Req() req,
  ): Promise<FavoriteResponseDto> {
    // Permitir creación a administradores con permisos de escritura
    if (this.hasWriteAccess(req)) {
      return this.usersService.addFavorite(id, addFavoriteDto);
    }
    
    // Los usuarios normales solo pueden añadir a sus propios favoritos
    if (req.user.id !== id) {
      throw new ForbiddenException('You do not have permission to add favorites for this user');
    }
    
    return this.usersService.addFavorite(id, addFavoriteDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id/favorites/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Req() req,
  ): Promise<void> {
    // Permitir eliminación a administradores con permisos de eliminación
    if (this.hasDeleteAccess(req)) {
      return this.usersService.removeFavorite(id, itemId);
    }
    
    // Los usuarios normales solo pueden eliminar de sus propios favoritos
    if (req.user.id !== id) {
      throw new ForbiddenException('You do not have permission to remove favorites for this user');
    }
    
    return this.usersService.removeFavorite(id, itemId);
  }
}