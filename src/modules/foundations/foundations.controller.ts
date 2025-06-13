// src/modules/foundations/foundations.controller.ts
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
import { FoundationsService } from './foundations.service';
import { CreateFoundationDto } from './dto/create-foundation.dto';
import { UpdateFoundationDto } from './dto/update-foundation.dto';
import { Foundation } from '../../entities/foundation.entity';
import { UserType } from '../../entities/user.entity';

@Controller()
export class FoundationsController {
  constructor(private readonly foundationsService: FoundationsService) {}

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

  // Endpoint para crear una fundación (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Post('api/foundations')
  @HttpCode(HttpStatus.CREATED)
  async createFoundation(
    @Body() createFoundationDto: CreateFoundationDto,
    @Req() req,
  ): Promise<Foundation> {
    // Administradores con permisos de escritura pueden crear fundaciones
    if (this.hasWriteAccess(req)) {
      return this.foundationsService.create(createFoundationDto);
    }
    
    // Verificar que el usuario solo pueda crear una fundación para sí mismo
    if (req.user.id !== createFoundationDto.user_id) {
      throw new ForbiddenException('You can only create a foundation for yourself');
    }
    
    // Verificar que el usuario sea de tipo FOUNDATION
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only users with FOUNDATION type can create foundations');
    }
    
    return this.foundationsService.create(createFoundationDto);
  }

  // Endpoint para compatibilidad con /foundations
  @UseGuards(JwtAuthGuard)
  @Post('foundations')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createFoundationDto: CreateFoundationDto,
    @Req() req,
  ): Promise<Foundation> {
    return this.createFoundation(createFoundationDto, req);
  }

  // Endpoint para listar todas las fundaciones (público)
  @Get('api/foundations')
  async listFoundations(): Promise<Foundation[]> {
    return this.foundationsService.findAll();
  }

  // Endpoint para compatibilidad con /foundations
  @Get('foundations')
  async findAll(): Promise<Foundation[]> {
    return this.foundationsService.findAll();
  }

  // Endpoint para obtener detalles de una fundación específica (público)
  @Get('api/foundations/:id')
  async getFoundationDetails(@Param('id', ParseUUIDPipe) id: string): Promise<Foundation> {
    return this.foundationsService.findOne(id);
  }

  // Endpoint para compatibilidad con /foundations/:id
  @Get('foundations/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Foundation> {
    return this.foundationsService.findOne(id);
  }

  // Endpoint para buscar una fundación por el ID del usuario
  @Get('api/foundations/user/:userId')
  async getFoundationByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<Foundation> {
    return this.foundationsService.findByUserId(userId);
  }

  // Endpoint para compatibilidad
  @Get('foundations/user/:userId')
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<Foundation> {
    return this.foundationsService.findByUserId(userId);
  }

  // Endpoint para actualizar una fundación - método PUT (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Put('api/foundations/:id')
  async updateFoundationPut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFoundationDto: UpdateFoundationDto,
    @Req() req,
  ): Promise<Foundation> {
    const foundation = await this.foundationsService.findOne(id);
    
    // Administradores con permisos de escritura pueden actualizar cualquier fundación
    if (this.hasWriteAccess(req)) {
      return this.foundationsService.update(id, updateFoundationDto);
    }
    
    // Verificar permisos: Solo el propietario puede actualizar
    if (foundation.user_id !== req.user.id) {
      throw new ForbiddenException('You do not have permission to update this foundation');
    }
    
    return this.foundationsService.update(id, updateFoundationDto);
  }

  // Endpoint para compatibilidad - método PUT
  @UseGuards(JwtAuthGuard)
  @Put('foundations/:id')
  async updatePut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFoundationDto: UpdateFoundationDto,
    @Req() req,
  ): Promise<Foundation> {
    return this.updateFoundationPut(id, updateFoundationDto, req);
  }

  // Endpoint para actualizar una fundación - método PATCH (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Patch('api/foundations/:id')
  async updateFoundationPatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFoundationDto: UpdateFoundationDto,
    @Req() req,
  ): Promise<Foundation> {
    const foundation = await this.foundationsService.findOne(id);
    
    // Administradores con permisos de escritura pueden actualizar cualquier fundación
    if (this.hasWriteAccess(req)) {
      return this.foundationsService.update(id, updateFoundationDto);
    }
    
    // Verificar permisos: Solo el propietario puede actualizar
    if (foundation.user_id !== req.user.id) {
      throw new ForbiddenException('You do not have permission to update this foundation');
    }
    
    return this.foundationsService.update(id, updateFoundationDto);
  }

  // Endpoint para compatibilidad - método PATCH
  @UseGuards(JwtAuthGuard)
  @Patch('foundations/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFoundationDto: UpdateFoundationDto,
    @Req() req,
  ): Promise<Foundation> {
    return this.updateFoundationPatch(id, updateFoundationDto, req);
  }

  // Endpoint para eliminar una fundación (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Delete('api/foundations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFoundation(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    const foundation = await this.foundationsService.findOne(id);
    
    // Administradores con permisos de eliminación pueden eliminar cualquier fundación
    if (this.hasDeleteAccess(req)) {
      return this.foundationsService.remove(id);
    }
    
    // Verificar permisos: Solo el propietario puede eliminar
    if (foundation.user_id !== req.user.id) {
      throw new ForbiddenException('You do not have permission to delete this foundation');
    }
    
    return this.foundationsService.remove(id);
  }

  // Endpoint para compatibilidad
  @UseGuards(JwtAuthGuard)
  @Delete('foundations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    return this.deleteFoundation(id, req);
  }
}