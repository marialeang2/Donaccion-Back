// src/modules/comments/comments.controller.ts
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
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from '../../entities/comment.entity';
import { UserType } from '../../entities/user.entity';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

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

  // Endpoint para crear un comentario (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Post('comments')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ): Promise<Comment> {
    // Administradores con permisos de escritura pueden crear comentarios para cualquier usuario
    if (this.hasWriteAccess(req)) {
      return this.commentsService.create(createCommentDto);
    }
    
    // Verificar que el usuario solo pueda crear comentarios para sí mismo
    if (req.user.id !== createCommentDto.user_id) {
      throw new ForbiddenException('You can only create comments as yourself');
    }
    
    // Verificar si el usuario tiene permiso para comentar en la donación o acción social
    if (createCommentDto.donation_id) {
      await this.commentsService.verifyDonationCommentPermission(
        createCommentDto.donation_id, 
        req.user.id
      );
    }
    
    if (createCommentDto.social_action_id) {
      await this.commentsService.verifySocialActionCommentPermission(
        createCommentDto.social_action_id, 
        req.user.id
      );
    }
    
    if (createCommentDto.foundation_id) {
      await this.commentsService.verifyFoundationCommentPermission(
        createCommentDto.foundation_id, 
        req.user.id
      );
    }
    
    return this.commentsService.create(createCommentDto);
  }

  // Endpoint específico para crear comentarios de fundación
  @UseGuards(JwtAuthGuard)
  @Post('foundation-detail/comment')
  @HttpCode(HttpStatus.CREATED)
  async createFoundationComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ): Promise<Comment> {
    // Administradores con permisos de escritura pueden crear comentarios para cualquier usuario
    if (this.hasWriteAccess(req)) {
      // Verificar que se está comentando una fundación
      if (!createCommentDto.foundation_id) {
        throw new BadRequestException('Foundation ID is required for this endpoint');
      }
      
      return this.commentsService.create(createCommentDto);
    }
    
    // Verificar que el usuario solo pueda crear comentarios para sí mismo
    if (req.user.id !== createCommentDto.user_id) {
      throw new ForbiddenException('You can only create comments as yourself');
    }
    
    // Verificar que se está comentando una fundación
    if (!createCommentDto.foundation_id) {
      throw new BadRequestException('Foundation ID is required for this endpoint');
    }
    
    // Verificar si el usuario tiene permiso para comentar en la fundación
    await this.commentsService.verifyFoundationCommentPermission(
      createCommentDto.foundation_id, 
      req.user.id
    );
    
    return this.commentsService.create(createCommentDto);
  }

  // Endpoint para listar todos los comentarios (con control de acceso)
  @UseGuards(JwtAuthGuard)
  @Get('comments')
  async findAll(@Req() req): Promise<Comment[]> {
    // Administradores con permisos de lectura pueden ver todos los comentarios
    if (this.hasReadAccess(req)) {
      return this.commentsService.findAll();
    }
    
    // Solo fundaciones pueden ver todos los comentarios
    if (req.user.user_type !== UserType.FOUNDATION) {
      // Si es un usuario normal, solo puede ver sus propios comentarios
      return this.commentsService.findByUser(req.user.id);
    }
    
    return this.commentsService.findAll();
  }

  // Endpoint para obtener comentarios de un usuario específico
  @UseGuards(JwtAuthGuard)
  @Get('comments/user/:userId')
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<Comment[]> {
    // Administradores con permisos de lectura pueden ver comentarios de cualquier usuario
    if (this.hasReadAccess(req)) {
      return this.commentsService.findByUser(userId);
    }
    
    // Verificar que el usuario solo pueda ver sus propios comentarios (a menos que sea fundación)
    if (req.user.id !== userId && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only view your own comments');
    }
    
    return this.commentsService.findByUser(userId);
  }

  // Endpoint para obtener comentarios de una donación (público)
  @Get('comments/donation/:donationId')
  findByDonation(@Param('donationId', ParseUUIDPipe) donationId: string): Promise<Comment[]> {
    return this.commentsService.findByDonation(donationId);
  }

  // Endpoint para obtener comentarios de una acción social (público)
  @Get('comments/social-action/:socialActionId')
  findBySocialAction(@Param('socialActionId', ParseUUIDPipe) socialActionId: string): Promise<Comment[]> {
    return this.commentsService.findBySocialAction(socialActionId);
  }

  // Endpoint para obtener comentarios de una fundación (público)
  @Get('comments/foundation/:foundationId')
  findByFoundation(@Param('foundationId', ParseUUIDPipe) foundationId: string): Promise<Comment[]> {
    return this.commentsService.findByFoundation(foundationId);
  }

  // Endpoint compatible para obtener comentarios de una oportunidad (acción social)
  @Get('comments/opportunity/:opportunityId')
  findByOpportunity(@Param('opportunityId', ParseUUIDPipe) opportunityId: string): Promise<Comment[]> {
    return this.commentsService.findBySocialAction(opportunityId);
  }

  // Endpoint para obtener un comentario específico (público)
  @Get('comments/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  // Endpoint para actualizar un comentario (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Patch('comments/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ): Promise<Comment> {
    const comment = await this.commentsService.findOne(id);
    
    // Administradores con permisos de escritura pueden actualizar cualquier comentario
    if (this.hasWriteAccess(req)) {
      return this.commentsService.update(id, updateCommentDto);
    }
    
    // Verificar que el usuario solo pueda actualizar sus propios comentarios
    if (comment.user_id !== req.user.id) {
      throw new ForbiddenException('You can only update your own comments');
    }
    
    return this.commentsService.update(id, updateCommentDto);
  }

  // Endpoint para eliminar un comentario (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    const comment = await this.commentsService.findOne(id);
    
    // Administradores con permisos de eliminación pueden eliminar cualquier comentario
    if (this.hasDeleteAccess(req)) {
      return this.commentsService.remove(id);
    }
    
    // Verificar que el usuario solo pueda eliminar sus propios comentarios o sea administrador
    if (comment.user_id !== req.user.id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    
    return this.commentsService.remove(id);
  }
}