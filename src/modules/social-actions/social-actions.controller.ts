// src/modules/social-actions/social-actions.controller.ts
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
import { SocialActionsService } from './social-actions.service';
import { CreateSocialActionDto } from './dto/create-social-action.dto';
import { UpdateSocialActionDto } from './dto/update-social-action.dto';
import { ApplyToSocialActionDto } from './dto/apply-to-social-action.dto';
import { SocialAction } from '../../entities/social_action.entity';
import { UserType } from '../../entities/user.entity';
import { ParticipationRequest } from '../../entities/participation_request.entity';

@Controller()
export class SocialActionsController {
  constructor(private readonly socialActionsService: SocialActionsService) {}

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

  // Endpoint para crear una acción social
  @UseGuards(JwtAuthGuard)
  @Post('social-actions')
  @HttpCode(HttpStatus.CREATED)
  createSocialAction(
    @Body() createSocialActionDto: CreateSocialActionDto,
    @Req() req,
  ): Promise<SocialAction> {
    // Si es admin@admin.com, permitir siempre
    if (this.isFullAdmin(req)) {
      return this.socialActionsService.createAsAdmin(createSocialActionDto);
    }
    
    // Usuarios con permisos de escritura pueden crear acciones sociales
    if (this.hasWriteAccess(req)) {
      return this.socialActionsService.create(createSocialActionDto, req.user.id, req.user.email);
    }
    
    // Los admins sin permisos de escritura no pueden crear
    if (this.isReadOnlyAdmin(req) || this.isDeleterAdmin(req)) {
      throw new ForbiddenException('Your admin role does not allow creating social actions');
    }
    
    // Solo las fundaciones pueden crear acciones sociales
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundations can create social actions');
    }
    
    // Verificar que la fundación sea la misma que está autenticada
    return this.socialActionsService.create(createSocialActionDto, req.user.id, req.user.email);
  }

  // Endpoints compatibles con 'opportunities'
  @UseGuards(JwtAuthGuard)
  @Post('opportunities')
  @HttpCode(HttpStatus.CREATED)
  createOpportunity(
    @Body() createSocialActionDto: CreateSocialActionDto,
    @Req() req,
  ): Promise<SocialAction> {
    return this.createSocialAction(createSocialActionDto, req);
  }

  // Endpoint para listar todas las acciones sociales
  @Get('social-actions')
  findAllSocialActions(): Promise<SocialAction[]> {
    return this.socialActionsService.findAll();
  }

  // Endpoint compatible con 'opportunities'
  @Get('opportunities')
  findAllOpportunities(): Promise<SocialAction[]> {
    return this.socialActionsService.findAll();
  }

  // Acciones sociales próximas
  @Get('social-actions/upcoming')
  findUpcomingSocialActions(): Promise<SocialAction[]> {
    return this.socialActionsService.findUpcoming();
  }

  // Oportunidades próximas (compatible)
  @Get('opportunities/upcoming')
  findUpcomingOpportunities(): Promise<SocialAction[]> {
    return this.socialActionsService.findUpcoming();
  }

  // Acciones sociales activas
  @Get('social-actions/active')
  findActiveSocialActions(): Promise<SocialAction[]> {
    return this.socialActionsService.findActive();
  }

  // Oportunidades activas (compatible)
  @Get('opportunities/active')
  findActiveOpportunities(): Promise<SocialAction[]> {
    return this.socialActionsService.findActive();
  }

  // Acciones sociales por fundación
  @Get('social-actions/foundation/:foundationId')
  findSocialActionsByFoundation(@Param('foundationId', ParseUUIDPipe) foundationId: string): Promise<SocialAction[]> {
    return this.socialActionsService.findByFoundation(foundationId);
  }

  // Oportunidades por fundación (compatible)
  @Get('opportunities/foundation/:foundationId')
  findOpportunitiesByFoundation(@Param('foundationId', ParseUUIDPipe) foundationId: string): Promise<SocialAction[]> {
    return this.socialActionsService.findByFoundation(foundationId);
  }

  // Detalle de acción social
  @Get('social-actions/:id')
  findOneSocialAction(@Param('id', ParseUUIDPipe) id: string): Promise<SocialAction> {
    return this.socialActionsService.findOne(id);
  }

  // Detalle de oportunidad (compatible)
  @Get('opportunities/:id')
  findOneOpportunity(@Param('id', ParseUUIDPipe) id: string): Promise<SocialAction> {
    return this.socialActionsService.findOne(id);
  }

  // Actualizar acción social
  @UseGuards(JwtAuthGuard)
  @Patch('social-actions/:id')
  async updateSocialActionPatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSocialActionDto: UpdateSocialActionDto,
    @Req() req,
  ): Promise<SocialAction> {
    // Si es admin@admin.com, permitir siempre
    if (this.isFullAdmin(req)) {
      return this.socialActionsService.updateAsAdmin(id, updateSocialActionDto);
    }
    
    const socialAction = await this.socialActionsService.findOne(id);
    
    // Usuarios con permisos de escritura pueden actualizar
    if (this.hasWriteAccess(req)) {
      return this.socialActionsService.update(id, updateSocialActionDto, req.user.email);
    }
    
    // Los demás tipos de admin no pueden actualizar
    if (this.isReadOnlyAdmin(req) || this.isDeleterAdmin(req)) {
      throw new ForbiddenException('Your admin role does not allow updating social actions');
    }
    
    // Verificar permisos: Solo la fundación propietaria puede actualizar
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundations can update social actions');
    }
    
    // Verificar que el usuario tenga permiso en esta fundación
    await this.socialActionsService.checkFoundationUser(socialAction.foundation_id, req.user.id, req.user.email);
    
    return this.socialActionsService.update(id, updateSocialActionDto, req.user.email);
  }

  // PUT method for social-actions (requerido según specs)
  @UseGuards(JwtAuthGuard)
  @Put('social-actions/:id')
  async updateSocialActionPut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSocialActionDto: UpdateSocialActionDto,
    @Req() req,
  ): Promise<SocialAction> {
    return this.updateSocialActionPatch(id, updateSocialActionDto, req);
  }

  // Actualizar oportunidad (compatible)
  @UseGuards(JwtAuthGuard)
  @Patch('opportunities/:id')
  async updateOpportunityPatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSocialActionDto: UpdateSocialActionDto,
    @Req() req,
  ): Promise<SocialAction> {
    return this.updateSocialActionPatch(id, updateSocialActionDto, req);
  }

  // PUT method for opportunities (requerido según specs)
  @UseGuards(JwtAuthGuard)
  @Put('opportunities/:id')
  async updateOpportunityPut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSocialActionDto: UpdateSocialActionDto,
    @Req() req,
  ): Promise<SocialAction> {
    return this.updateSocialActionPatch(id, updateSocialActionDto, req);
  }

  // Eliminar acción social
  @UseGuards(JwtAuthGuard)
  @Delete('social-actions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSocialAction(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    // Si es admin@admin.com, permitir siempre
    if (this.isFullAdmin(req)) {
      return this.socialActionsService.removeAsAdmin(id);
    }
    
    const socialAction = await this.socialActionsService.findOne(id);
    
    // Usuarios con permisos de eliminación pueden eliminar
    if (this.hasDeleteAccess(req)) {
      return this.socialActionsService.remove(id, req.user.email);
    }
    
    // Los demás tipos de admin no pueden eliminar
    if (this.isReadOnlyAdmin(req) || this.isWriterAdmin(req)) {
      throw new ForbiddenException('Your admin role does not allow deleting social actions');
    }
    
    // Verificar permisos: Solo la fundación propietaria puede eliminar
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundations can delete social actions');
    }
    
    // Verificar que el usuario tenga permiso en esta fundación
    await this.socialActionsService.checkFoundationUser(socialAction.foundation_id, req.user.id, req.user.email);
    
    return this.socialActionsService.remove(id, req.user.email);
  }

  // Eliminar oportunidad (compatible)
  @UseGuards(JwtAuthGuard)
  @Delete('opportunities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeOpportunity(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    return this.removeSocialAction(id, req);
  }

  // NUEVO ENDPOINT: Postularse a una acción social (participación)
  @UseGuards(JwtAuthGuard)
  @Post('social-actions/:id/apply')
  @HttpCode(HttpStatus.CREATED)
  async applyToSocialAction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() applyDto: ApplyToSocialActionDto,
    @Req() req,
  ): Promise<ParticipationRequest> {
    // Si es admin@admin.com, permitir aplicar a cualquier acción social
    if (this.isFullAdmin(req)) {
      return this.socialActionsService.applyToSocialActionAsAdmin(id, req.user.id, applyDto);
    }
    
    // Solo los usuarios regulares pueden postularse
    if (req.user.user_type !== UserType.USER) {
      throw new ForbiddenException('Only regular users can apply to social actions');
    }
    
    // El usuario solo puede postularse a sí mismo
    return this.socialActionsService.applyToSocialAction(id, req.user.id, applyDto);
  }

  // NUEVO ENDPOINT: Postularse a una oportunidad (participación) - compatible
  @UseGuards(JwtAuthGuard)
  @Post('opportunities/:id/apply')
  @HttpCode(HttpStatus.CREATED)
  async applyToOpportunity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() applyDto: ApplyToSocialActionDto,
    @Req() req,
  ): Promise<ParticipationRequest> {
    return this.applyToSocialAction(id, applyDto, req);
  }
}