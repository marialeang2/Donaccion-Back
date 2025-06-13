// src/modules/ratings/ratings.controller.ts
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
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Rating } from '../../entities/rating.entity';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

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

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRatingDto: CreateRatingDto,
    @Req() req,
  ): Promise<Rating> {
    // Permitir creación a administradores con permisos de escritura
    if (this.hasWriteAccess(req)) {
      return this.ratingsService.create(createRatingDto);
    }
    
    // Asegurar que el usuario solo pueda crear calificaciones para sí mismo
    if (req.user.id !== createRatingDto.user_id) {
      throw new ForbiddenException('You can only create ratings for yourself');
    }
    
    return this.ratingsService.create(createRatingDto);
  }

  // Las consultas de calificaciones pueden ser públicas
  @Get()
  findAll(): Promise<Rating[]> {
    return this.ratingsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<Rating[]> {
    return this.ratingsService.findByUser(userId);
  }

  @Get('donation/:donationId')
  findByDonation(@Param('donationId', ParseUUIDPipe) donationId: string): Promise<Rating[]> {
    return this.ratingsService.findByDonation(donationId);
  }

  @Get('donation/:donationId/average')
  getAverageForDonation(@Param('donationId', ParseUUIDPipe) donationId: string): Promise<number> {
    return this.ratingsService.getAverageForDonation(donationId);
  }

  @Get('social-action/:socialActionId')
  findBySocialAction(@Param('socialActionId', ParseUUIDPipe) socialActionId: string): Promise<Rating[]> {
    return this.ratingsService.findBySocialAction(socialActionId);
  }

  @Get('social-action/:socialActionId/average')
  getAverageForSocialAction(@Param('socialActionId', ParseUUIDPipe) socialActionId: string): Promise<number> {
    return this.ratingsService.getAverageForSocialAction(socialActionId);
  }

  // Estas rutas también pueden ser públicas para la consulta
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Rating> {
    return this.ratingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @Req() req,
  ): Promise<Rating> {
    // Permitir actualización a administradores con permisos de escritura
    if (this.hasWriteAccess(req)) {
      return this.ratingsService.update(id, updateRatingDto);
    }
    
    // Verificar que el usuario sea dueño de la calificación
    const rating = await this.ratingsService.findOne(id);
    if (rating.user_id !== req.user.id) {
      throw new ForbiddenException('You can only update your own ratings');
    }
    
    return this.ratingsService.update(id, updateRatingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    // Permitir eliminación a administradores con permisos de eliminación
    if (this.hasDeleteAccess(req)) {
      return this.ratingsService.remove(id);
    }
    
    // Verificar que el usuario sea dueño de la calificación
    const rating = await this.ratingsService.findOne(id);
    if (rating.user_id !== req.user.id) {
      throw new ForbiddenException('You can only delete your own ratings');
    }
    
    return this.ratingsService.remove(id);
  }

  // Nuevos endpoints para compatibilidad con la API de oportunidades/social-actions
  @Get('opportunity/:opportunityId')
  findByOpportunity(@Param('opportunityId', ParseUUIDPipe) opportunityId: string): Promise<Rating[]> {
    return this.ratingsService.findBySocialAction(opportunityId);
  }

  @Get('opportunity/:opportunityId/average')
  getAverageForOpportunity(@Param('opportunityId', ParseUUIDPipe) opportunityId: string): Promise<number> {
    return this.ratingsService.getAverageForSocialAction(opportunityId);
  }
}