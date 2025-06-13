import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { SuggestionsService } from './suggestions.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { Suggestion } from '../../entities/suggestion.entity';
import { UserType } from '../../entities/user.entity';

@Controller('suggestions')
@UseGuards(JwtAuthGuard) // Proteger todos los endpoints con JWT
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSuggestionDto: CreateSuggestionDto,
    @Req() req,
  ): Promise<Suggestion> {
    // Permitir creación a administradores con permisos de escritura
    if (this.hasWriteAccess(req)) {
      return this.suggestionsService.create(createSuggestionDto);
    }
    
    // Asegurarse de que el usuario solo pueda crear sugerencias para sí mismo
    if (req.user.id !== createSuggestionDto.user_id) {
      throw new ForbiddenException("You can only create suggestions for yourself");
    }
    
    return this.suggestionsService.create(createSuggestionDto);
  }

  @Get()
  async findAll(@Req() req): Promise<Suggestion[]> {
    // Permitir lectura a cualquier tipo de administrador
    if (this.hasReadAccess(req)) {
      return this.suggestionsService.findAll();
    }
    
    // Solo administradores pueden ver todas las sugerencias
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException("Only foundation administrators can view all suggestions");
    }
    
    return this.suggestionsService.findAll();
  }

  @Get('unprocessed')
  async findUnprocessed(@Req() req): Promise<Suggestion[]> {
    // Permitir lectura a cualquier tipo de administrador
    if (this.hasReadAccess(req)) {
      return this.suggestionsService.findUnprocessed();
    }
    
    // Solo administradores pueden ver las sugerencias sin procesar
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException("Only foundation administrators can view unprocessed suggestions");
    }
    
    return this.suggestionsService.findUnprocessed();
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<Suggestion[]> {
    // Permitir lectura a cualquier tipo de administrador
    if (this.hasReadAccess(req)) {
      return this.suggestionsService.findByUser(userId);
    }
    
    // Usuario solo puede ver sus propias sugerencias (excepto administradores)
    if (req.user.id !== userId && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException("You can only view your own suggestions");
    }
    
    return this.suggestionsService.findByUser(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Suggestion> {
    const suggestion = await this.suggestionsService.findOne(id);
    
    // Permitir lectura a cualquier tipo de administrador
    if (this.hasReadAccess(req)) {
      return suggestion;
    }
    
    // Usuario solo puede ver sus propias sugerencias (excepto administradores)
    if (req.user.id !== suggestion.user_id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException("You can only view your own suggestions");
    }
    
    return suggestion;
  }

  @Patch(':id/process')
  async markAsProcessed(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Suggestion> {
    // Permitir actualización a administradores con permisos de escritura
    if (this.hasWriteAccess(req)) {
      return this.suggestionsService.markAsProcessed(id);
    }
    
    // Solo administradores pueden marcar como procesada
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException("Only foundation administrators can process suggestions");
    }
    
    return this.suggestionsService.markAsProcessed(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSuggestionDto: UpdateSuggestionDto,
    @Req() req,
  ): Promise<Suggestion> {
    const suggestion = await this.suggestionsService.findOne(id);
    
    // Permitir actualización a administradores con permisos de escritura
    if (this.hasWriteAccess(req)) {
      return this.suggestionsService.update(id, updateSuggestionDto);
    }
    
    // Solo el creador puede actualizar la sugerencia (excepto para procesarla)
    if (req.user.id !== suggestion.user_id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException("You can only update your own suggestions");
    }
    
    // Solo administradores pueden marcar como procesada
    if (updateSuggestionDto.processed !== undefined && 
        req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException("Only foundation administrators can process suggestions");
    }
    
    return this.suggestionsService.update(id, updateSuggestionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    const suggestion = await this.suggestionsService.findOne(id);
    
    // Permitir eliminación a administradores con permisos de eliminación
    if (this.hasDeleteAccess(req)) {
      return this.suggestionsService.remove(id);
    }
    
    // Solo el creador o administrador puede eliminar la sugerencia
    if (req.user.id !== suggestion.user_id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException("You can only delete your own suggestions");
    }
    
    return this.suggestionsService.remove(id);
  }
}