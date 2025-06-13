// src/modules/donations/donations.controller.ts
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
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { Donation } from '../../entities/donation.entity';
import { UserType } from '../../entities/user.entity';

@Controller()
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

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

  // Endpoint para crear una donación (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Post('api/donations')
  @HttpCode(HttpStatus.CREATED)
  async makeDonation(
    @Body() createDonationDto: CreateDonationDto,
    @Req() req,
  ): Promise<Donation> {
    // Debug usando console.log (siempre se muestra)
    console.log('\n=== DONATION CREATION DEBUG ===');
    console.log('Request user:', JSON.stringify(req.user, null, 2));
    console.log('DTO received:', JSON.stringify(createDonationDto, null, 2));
    console.log('User ID from JWT:', req.user.id, '(type:', typeof req.user.id, ')');
    console.log('User ID from DTO:', createDonationDto.user_id, '(type:', typeof createDonationDto.user_id, ')');
    console.log('IDs are equal:', req.user.id === createDonationDto.user_id);
    console.log('IDs strict equal (===):', req.user.id === createDonationDto.user_id);
    console.log('IDs loose equal (==):', req.user.id == createDonationDto.user_id);
    
    // Administradores con permisos de escritura pueden crear donaciones para cualquier usuario
    if (this.hasWriteAccess(req)) {
      console.log('✅ Admin write access, creating donation');
      try {
        const donation = await this.donationsService.create(createDonationDto);
        console.log('✅ Donation created successfully:', donation.id);
        return donation;
      } catch (error) {
        console.error('❌ Error creating donation:', error.message);
        throw error;
      }
    }
    
    // Verificar que el usuario solo pueda crear donaciones para sí mismo
    if (req.user.id !== createDonationDto.user_id) {
      console.error('❌ Permission denied: User ID mismatch');
      console.error('Expected:', req.user.id);
      console.error('Received:', createDonationDto.user_id);
      throw new ForbiddenException('You can only make donations on your own behalf');
    }
    
    console.log('✅ Permission check passed');
    
    try {
      console.log('Creating donation...');
      const donation = await this.donationsService.create(createDonationDto);
      console.log('✅ Donation created successfully:', donation.id);
      console.log('Donation details:', JSON.stringify(donation, null, 2));
      return donation;
    } catch (error) {
      console.error('❌ Error creating donation:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }

  // Endpoint para compatibilidad
  @UseGuards(JwtAuthGuard)
  @Post('donations')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDonationDto: CreateDonationDto,
    @Req() req,
  ): Promise<Donation> {
    console.log('📝 Using legacy donations endpoint');
    return this.makeDonation(createDonationDto, req);
  }

  // GET endpoints con logging básico
  @UseGuards(JwtAuthGuard)
  @Get('api/donations')
  async listDonations(@Req() req): Promise<Donation[]> {
    console.log('📋 Listing donations for user:', req.user.id);
    
    // Administradores con permisos de lectura pueden ver todas las donaciones
    if (this.hasReadAccess(req)) {
      console.log('📋 Admin read access, returning all donations');
      return this.donationsService.findAll();
    }
    
    if (req.user.user_type === UserType.FOUNDATION) {
      try {
        const foundation = await this.donationsService.getFoundationByUserId(req.user.id);
        console.log('Foundation found:', foundation.id);
        return this.donationsService.findByFoundation(foundation.id);
      } catch (error) {
        console.log('No foundation found, returning user donations');
        return this.donationsService.findByUser(req.user.id);
      }
    }
    
    return this.donationsService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('donations')
  async findAll(@Req() req): Promise<Donation[]> {
    console.log('📋 Finding all donations for:', req.user.user_type);
    
    // Administradores con permisos de lectura pueden ver todas las donaciones
    if (this.hasReadAccess(req)) {
      return this.donationsService.findAll();
    }
    
    if (req.user.user_type === UserType.FOUNDATION) {
      return this.donationsService.findAll();
    }
    
    return this.donationsService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/donations/user/:userId')
  async getUserDonations(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<Donation[]> {
    console.log('👤 Getting donations for user:', userId);
    
    // Administradores con permisos de lectura pueden ver donaciones de cualquier usuario
    if (this.hasReadAccess(req)) {
      return this.donationsService.findByUser(userId);
    }
    
    if (req.user.id !== userId && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only view your own donations');
    }
    
    return this.donationsService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('donations/user/:userId')
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<Donation[]> {
    return this.getUserDonations(userId, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/donations/foundation/:foundationId')
  async getFoundationDonations(
    @Param('foundationId', ParseUUIDPipe) foundationId: string,
    @Req() req,
  ): Promise<Donation[]> {
    console.log('🏢 Getting donations for foundation:', foundationId);
    
    // Administradores con permisos de lectura pueden ver donaciones de cualquier fundación
    if (this.hasReadAccess(req)) {
      return this.donationsService.findByFoundation(foundationId);
    }
    
    const foundation = await this.donationsService.getFoundation(foundationId);
    
    if (req.user.id === foundation.user_id) {
      return this.donationsService.findByFoundation(foundationId);
    }
    
    const userDonations = await this.donationsService.findByUserAndFoundation(req.user.id, foundationId);
    if (userDonations.length === 0) {
      throw new ForbiddenException('You can only view donations to foundations where you have donated');
    }
    
    return userDonations;
  }

  @UseGuards(JwtAuthGuard)
  @Get('donations/foundation/:foundationId')
  async findByFoundation(
    @Param('foundationId', ParseUUIDPipe) foundationId: string,
    @Req() req,
  ): Promise<Donation[]> {
    return this.getFoundationDonations(foundationId, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/donations/:id')
  async getDonationDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Donation> {
    console.log('🔍 Getting donation details:', id);
    
    const donation = await this.donationsService.findOne(id);
    
    // Administradores con permisos de lectura pueden ver cualquier donación
    if (this.hasReadAccess(req)) {
      return donation;
    }
    
    if (req.user.id !== donation.user_id && 
      !(req.user.user_type === UserType.FOUNDATION && 
        await this.donationsService.isFoundationUserForDonation(id, req.user.id))
    ) {
      throw new ForbiddenException('You do not have permission to view this donation');
    }
    
    return donation;
  }

  @UseGuards(JwtAuthGuard)
  @Get('donations/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Donation> {
    return this.getDonationDetails(id, req);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('api/donations/:id')
  async updateDonation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDonationDto: UpdateDonationDto,
    @Req() req,
  ): Promise<Donation> {
    console.log('✏️ Updating donation:', id);
    
    const donation = await this.donationsService.findOne(id);
    
    // Administradores con permisos de escritura pueden actualizar cualquier donación
    if (this.hasWriteAccess(req)) {
      return this.donationsService.update(id, updateDonationDto);
    }
    
    if (req.user.id !== donation.user_id) {
      throw new ForbiddenException('You do not have permission to update this donation');
    }
    
    return this.donationsService.update(id, updateDonationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('donations/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDonationDto: UpdateDonationDto,
    @Req() req,
  ): Promise<Donation> {
    return this.updateDonation(id, updateDonationDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('api/donations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDonation(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    console.log('🗑️ Deleting donation:', id);
    
    const donation = await this.donationsService.findOne(id);
    
    // Administradores con permisos de eliminación pueden eliminar cualquier donación
    if (this.hasDeleteAccess(req)) {
      return this.donationsService.remove(id);
    }
    
    if (req.user.id !== donation.user_id) {
      throw new ForbiddenException('You do not have permission to delete this donation');
    }
    
    return this.donationsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('donations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    return this.deleteDonation(id, req);
  }
}