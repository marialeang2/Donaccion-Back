// src/modules/certificates/certificates.controller.ts
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
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { Certificate } from '../../entities/certificate.entity';
import { UserType } from '../../entities/user.entity';

@Controller()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

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

  // Endpoint principal para listar los certificados del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('api/certificates')
  async getMyCertificates(@Req() req): Promise<Certificate[]> {
    // Administradores con permisos de lectura pueden ver todos los certificados
    if (this.hasReadAccess(req)) {
      return this.certificatesService.findAll();
    }
    
    return this.certificatesService.findByUser(req.user.id);
  }

  // Endpoint para solicitar un nuevo certificado
  @UseGuards(JwtAuthGuard)
  @Post('api/certificates')
  @HttpCode(HttpStatus.CREATED)
  async requestCertificate(
    @Body() createCertificateDto: CreateCertificateDto,
    @Req() req,
  ): Promise<Certificate> {
    // Administradores con permisos de escritura pueden crear certificados para cualquier usuario
    if (this.hasWriteAccess(req)) {
      return this.certificatesService.create(createCertificateDto);
    }
    
    // Para usuarios normales, solo pueden solicitar certificados para sí mismos
    if (req.user.user_type !== UserType.FOUNDATION && 
        req.user.id !== createCertificateDto.user_id) {
      throw new ForbiddenException('You can only request certificates for yourself');
    }
    
    return this.certificatesService.create(createCertificateDto);
  }

  // Endpoints de compatibilidad con rutas originales
  
  // Crear certificado (solo administradores)
  @UseGuards(JwtAuthGuard)
  @Post('certificates')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCertificateDto: CreateCertificateDto,
    @Req() req,
  ): Promise<Certificate> {
    // Administradores con permisos de escritura pueden crear certificados para cualquier usuario
    if (this.hasWriteAccess(req)) {
      return this.certificatesService.create(createCertificateDto);
    }
    
    // Solo fundaciones pueden crear certificados para otros usuarios
    if (req.user.user_type !== UserType.FOUNDATION && 
        req.user.id !== createCertificateDto.user_id) {
      throw new ForbiddenException('You can only create certificates for yourself');
    }
    
    return this.certificatesService.create(createCertificateDto);
  }

  // Listar todos los certificados (solo administradores)
  @UseGuards(JwtAuthGuard)
  @Get('certificates')
  async findAll(@Req() req): Promise<Certificate[]> {
    // Administradores con permisos de lectura pueden ver todos los certificados
    if (this.hasReadAccess(req)) {
      return this.certificatesService.findAll();
    }
    
    // Solo fundaciones pueden ver todos los certificados
    if (req.user.user_type !== UserType.FOUNDATION) {
      // Si es un usuario normal, solo puede ver sus propios certificados
      return this.certificatesService.findByUser(req.user.id);
    }
    
    return this.certificatesService.findAll();
  }

  // Listar certificados de un usuario específico
  @UseGuards(JwtAuthGuard)
  @Get('certificates/user/:userId')
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<Certificate[]> {
    // Administradores con permisos de lectura pueden ver certificados de cualquier usuario
    if (this.hasReadAccess(req)) {
      return this.certificatesService.findByUser(userId);
    }
    
    // Verificar que el usuario solo pueda ver sus propios certificados (excepto fundaciones)
    if (req.user.id !== userId && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only view your own certificates');
    }
    
    return this.certificatesService.findByUser(userId);
  }

  // Ver un certificado específico
  @UseGuards(JwtAuthGuard)
  @Get('certificates/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Certificate> {
    const certificate = await this.certificatesService.findOne(id);
    
    // Administradores con permisos de lectura pueden ver cualquier certificado
    if (this.hasReadAccess(req)) {
      return certificate;
    }
    
    // Verificar que el usuario solo pueda ver sus propios certificados (excepto fundaciones)
    if (certificate.user_id !== req.user.id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only view your own certificates');
    }
    
    return certificate;
  }

  // Actualizar un certificado (solo administradores)
  @UseGuards(JwtAuthGuard)
  @Patch('certificates/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
    @Req() req,
  ): Promise<Certificate> {
    // Administradores con permisos de escritura pueden actualizar cualquier certificado
    if (this.hasWriteAccess(req)) {
      return this.certificatesService.update(id, updateCertificateDto);
    }
    
    // Solo fundaciones pueden actualizar certificados
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundation administrators can update certificates');
    }
    
    return this.certificatesService.update(id, updateCertificateDto);
  }

  // Eliminar un certificado (solo administradores)
  @UseGuards(JwtAuthGuard)
  @Delete('certificates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    // Administradores con permisos de eliminación pueden eliminar cualquier certificado
    if (this.hasDeleteAccess(req)) {
      return this.certificatesService.remove(id);
    }
    
    // Solo fundaciones pueden eliminar certificados
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundation administrators can delete certificates');
    }
    
    return this.certificatesService.remove(id);
  }

  // Endpoint para descargar un certificado (como PDF o similar)
  @UseGuards(JwtAuthGuard)
  @Get('api/certificates/:id/download')
  async downloadCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<any> {
    const certificate = await this.certificatesService.findOne(id);
    
    // Administradores con permisos de lectura pueden descargar cualquier certificado
    if (this.hasReadAccess(req)) {
      // Aquí implementaríamos la lógica para generar un PDF o archivo descargable
      return {
        ...certificate,
        downloadUrl: `/api/certificates/${certificate.id}/pdf`, // URL ficticia
        message: "Certificate ready for download"
      };
    }
    
    // Verificar que el usuario solo pueda descargar sus propios certificados
    if (certificate.user_id !== req.user.id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only download your own certificates');
    }
    
    // Aquí implementaríamos la lógica para generar un PDF o archivo descargable
    return {
      ...certificate,
      downloadUrl: `/api/certificates/${certificate.id}/pdf`, // URL ficticia
      message: "Certificate ready for download"
    };
  }
}