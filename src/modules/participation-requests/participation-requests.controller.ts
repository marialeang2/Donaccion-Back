// src/modules/participation-requests/participation-requests.controller.ts
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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ParticipationRequestsService } from './participation-requests.service';
import { CreateParticipationRequestDto } from './dto/create-participation-request.dto';
import { UpdateParticipationRequestDto } from './dto/update-participation-request.dto';
import { ParticipationRequest, RequestStatus } from '../../entities/participation_request.entity';
import { UserType } from '../../entities/user.entity';

@Controller()
export class ParticipationRequestsController {
  constructor(private readonly participationRequestsService: ParticipationRequestsService) {}

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

  // Crear una solicitud de participación
  @UseGuards(JwtAuthGuard)
  @Post('participation-requests')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createParticipationRequestDto: CreateParticipationRequestDto,
    @Req() req,
  ): Promise<ParticipationRequest> {
    // Usuarios con permisos de escritura pueden crear solicitudes para cualquier usuario
    if (this.hasWriteAccess(req)) {
      return this.participationRequestsService.create(createParticipationRequestDto);
    }
    
    // Verificar que el usuario solo pueda crear solicitudes para sí mismo
    if (req.user.id !== createParticipationRequestDto.user_id) {
      throw new ForbiddenException('You can only create participation requests for yourself');
    }
    
    return this.participationRequestsService.create(createParticipationRequestDto);
  }

  // Endpoint compatible con la especificación 'opportunities/{id}/apply'
  @UseGuards(JwtAuthGuard)
  @Post('opportunities/:id/apply')
  @HttpCode(HttpStatus.CREATED)
  async applyToOpportunity(
    @Param('id', ParseUUIDPipe) socialActionId: string,
    @Body() applyDto: any,
    @Req() req,
  ): Promise<ParticipationRequest> {
    // Crear DTO automáticamente con el ID del usuario y la acción social
    const createDto: CreateParticipationRequestDto = {
      user_id: req.user.id,
      social_action_id: socialActionId,
      ...applyDto, // Incluir mensaje si existe
    };
    
    return this.participationRequestsService.create(createDto);
  }

  // Lista todas las solicitudes (para administradores)
  @UseGuards(JwtAuthGuard)
  @Get('participation-requests')
  async findAll(@Req() req): Promise<ParticipationRequest[]> {
    // Cualquier tipo de admin o las fundaciones pueden ver todas las solicitudes
    if (this.hasReadAccess(req) || req.user.user_type === UserType.FOUNDATION) {
      return this.participationRequestsService.findAll();
    }
    
    throw new ForbiddenException('Only foundations and admins can view all participation requests');
  }

  // Solicitudes de un usuario específico
  @UseGuards(JwtAuthGuard)
  @Get('participation-requests/user/:userId')
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<ParticipationRequest[]> {
    // Cualquier tipo de admin puede ver las solicitudes de cualquier usuario
    if (this.hasReadAccess(req)) {
      return this.participationRequestsService.findByUser(userId);
    }
    
    // Usuario solo puede ver sus propias solicitudes (excepto admin y fundaciones)
    if (req.user.id !== userId && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only view your own participation requests');
    }
    
    return this.participationRequestsService.findByUser(userId);
  }

  // Solicitudes para una acción social específica
  @UseGuards(JwtAuthGuard)
  @Get('participation-requests/social-action/:socialActionId')
  async findBySocialAction(
    @Param('socialActionId', ParseUUIDPipe) socialActionId: string,
    @Req() req,
  ): Promise<ParticipationRequest[]> {
    // Cualquier tipo de admin puede ver todas las solicitudes para cualquier acción social
    if (this.hasReadAccess(req)) {
      return this.participationRequestsService.findBySocialAction(socialActionId);
    }
    
    // Verificar si el usuario es una fundación o el propietario de la solicitud
    const socialAction = await this.participationRequestsService.getSocialAction(socialActionId);
    
    // Solo fundaciones propietarias de la acción social pueden ver todas las solicitudes
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundations can view all participation requests for a social action');
    }
    
    return this.participationRequestsService.findBySocialAction(socialActionId);
  }

  // Endpoint compatible: Solicitudes para una oportunidad específica
  @UseGuards(JwtAuthGuard)
  @Get('opportunities/:opportunityId/applications')
  async findByOpportunity(
    @Param('opportunityId', ParseUUIDPipe) opportunityId: string,
    @Req() req,
    @Query('status') status?: RequestStatus,
  ): Promise<ParticipationRequest[]> {
    // Cualquier tipo de admin puede ver todas las aplicaciones
    if (this.hasReadAccess(req)) {
      // Si se proporciona status, filtrar por status
      if (status) {
        return this.participationRequestsService.findBySocialActionAndStatus(opportunityId, status);
      }
      
      // Si no, obtener todas con detalles
      return this.participationRequestsService.findDetailedBySocialAction(opportunityId);
    }
    
    // Verificar si el usuario es una fundación propietaria
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundations can view applications for an opportunity');
    }
    
    // Verificar propiedad (excepto para admin)
    await this.participationRequestsService.checkFoundationOwnership(opportunityId, req.user.id);
    
    // Si se proporciona status, filtrar por status
    if (status) {
      return this.participationRequestsService.findBySocialActionAndStatus(opportunityId, status);
    }
    
    // Si no, obtener todas con detalles
    return this.participationRequestsService.findDetailedBySocialAction(opportunityId);
  }

  // Solicitudes pendientes para una acción social
  @UseGuards(JwtAuthGuard)
  @Get('participation-requests/social-action/:socialActionId/pending')
  async findPendingBySocialAction(
    @Param('socialActionId', ParseUUIDPipe) socialActionId: string,
    @Req() req,
  ): Promise<ParticipationRequest[]> {
    // Cualquier tipo de admin puede ver todas las solicitudes pendientes
    if (this.hasReadAccess(req)) {
      return this.participationRequestsService.findPendingBySocialAction(socialActionId);
    }
    
    // Solo fundaciones pueden ver solicitudes pendientes
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundations can view pending participation requests');
    }
    
    return this.participationRequestsService.findPendingBySocialAction(socialActionId);
  }

  // Endpoint compatible: Solicitudes pendientes para una oportunidad
  @UseGuards(JwtAuthGuard)
  @Get('opportunities/:opportunityId/pending-applications')
  async findPendingByOpportunity(
    @Param('opportunityId', ParseUUIDPipe) opportunityId: string,
    @Req() req,
  ): Promise<ParticipationRequest[]> {
    return this.findPendingBySocialAction(opportunityId, req);
  }

  // Obtener una solicitud específica
  @UseGuards(JwtAuthGuard)
  @Get('participation-requests/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<ParticipationRequest> {
    const request = await this.participationRequestsService.findOne(id);
    
    // Cualquier tipo de admin puede ver cualquier solicitud
    if (this.hasReadAccess(req)) {
      return request;
    }
    
    // Verificar permisos: Solo el usuario que hizo la solicitud o la fundación pueden verla
    if (req.user.id !== request.user_id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You are not authorized to view this participation request');
    }
    
    return request;
  }

  // Actualizar estado de una solicitud (aprobar/rechazar)
  @UseGuards(JwtAuthGuard)
  @Patch('participation-requests/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateParticipationRequestDto: UpdateParticipationRequestDto,
    @Req() req,
  ): Promise<ParticipationRequest> {
    // Solo usuarios con permisos de escritura pueden actualizar solicitudes
    if (this.hasWriteAccess(req)) {
      return this.participationRequestsService.update(id, updateParticipationRequestDto);
    }
    
    // Los demás tipos de admin no pueden modificar solicitudes
    if (this.isReadOnlyAdmin(req) || this.isDeleterAdmin(req)) {
      throw new ForbiddenException('Your admin role does not allow modifying participation requests');
    }
    
    // Verificar que solo fundaciones puedan actualizar solicitudes
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundations can update participation requests');
    }
    
    const request = await this.participationRequestsService.findOne(id);
    
    // Verificar que la fundación sea propietaria de la acción social
    await this.participationRequestsService.checkFoundationOwnership(request.social_action_id, req.user.id);
    
    return this.participationRequestsService.update(id, updateParticipationRequestDto);
  }

  // Eliminar una solicitud
  @UseGuards(JwtAuthGuard)
  @Delete('participation-requests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    const request = await this.participationRequestsService.findOne(id);
    
    // Solo usuarios con permisos de eliminación pueden eliminar solicitudes
    if (this.hasDeleteAccess(req)) {
      return this.participationRequestsService.remove(id);
    }
    
    // Los demás tipos de admin no pueden eliminar solicitudes
    if (this.isReadOnlyAdmin(req) || this.isWriterAdmin(req)) {
      throw new ForbiddenException('Your admin role does not allow deleting participation requests');
    }
    
    // Solo el creador o la fundación pueden eliminar la solicitud
    if (req.user.id !== request.user_id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You are not authorized to delete this participation request');
    }
    
    // Si es fundación, verificar que sea propietaria de la acción social
    if (req.user.user_type === UserType.FOUNDATION) {
      await this.participationRequestsService.checkFoundationOwnership(request.social_action_id, req.user.id);
    }
    
    return this.participationRequestsService.remove(id);
  }
}