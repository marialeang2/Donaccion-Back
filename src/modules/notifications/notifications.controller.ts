// src/modules/notifications/notifications.controller.ts
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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from '../../entities/notification.entity';
import { UserType } from '../../entities/user.entity';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Endpoint principal para listar las notificaciones del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getMyNotifications(@Req() req): Promise<Notification[]> {
    return this.notificationsService.findByUser(req.user.id);
  }

  // Endpoint para notificaciones no leídas del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('notifications/unread')
  async getMyUnreadNotifications(@Req() req): Promise<Notification[]> {
    return this.notificationsService.findUnreadByUser(req.user.id);
  }

  // Endpoint para marcar todas las notificaciones como leídas
  @UseGuards(JwtAuthGuard)
  @Post('notifications/mark-all-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllMyNotificationsAsRead(@Req() req): Promise<void> {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // Endpoint para marcar una notificación específica como leída
  @UseGuards(JwtAuthGuard)
  @Patch('notifications/:id/read')
  async markNotificationAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Notification> {
    const notification = await this.notificationsService.findOne(id);
    
    // Verificar que la notificación pertenezca al usuario
    if (notification.user_id !== req.user.id) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }
    
    return this.notificationsService.markAsRead(id);
  }

  // Endpoints administrativos para crear notificaciones (protegidos)
  @UseGuards(JwtAuthGuard)
  @Post('notifications')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req,
  ): Promise<Notification> {
    // Solo fundaciones pueden crear notificaciones para otros usuarios
    if (req.user.user_type !== UserType.FOUNDATION && 
        createNotificationDto.user_id !== req.user.id) {
      throw new ForbiddenException('You can only create notifications for yourself');
    }
    
    return this.notificationsService.create(createNotificationDto);
  }

  // Endpoint administrativo para ver todas las notificaciones (solo fundaciones)
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async findAll(@Req() req): Promise<Notification[]> {
    // Solo fundaciones pueden ver todas las notificaciones
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundation administrators can view all notifications');
    }
    
    return this.notificationsService.findAll();
  }

  // Endpoint para ver notificaciones de un usuario específico
  @UseGuards(JwtAuthGuard)
  @Get('notifications/user/:userId')
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<Notification[]> {
    // Usuario solo puede ver sus propias notificaciones, fundaciones pueden ver todas
    if (req.user.id !== userId && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only view your own notifications');
    }
    
    return this.notificationsService.findByUser(userId);
  }

  // Endpoint para ver notificaciones no leídas de un usuario específico
  @UseGuards(JwtAuthGuard)
  @Get('notifications/user/:userId/unread')
  async findUnreadByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<Notification[]> {
    // Usuario solo puede ver sus propias notificaciones, fundaciones pueden ver todas
    if (req.user.id !== userId && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only view your own notifications');
    }
    
    return this.notificationsService.findUnreadByUser(userId);
  }

  // Endpoint para marcar todas las notificaciones de un usuario como leídas
  @UseGuards(JwtAuthGuard)
  @Post('notifications/user/:userId/mark-all-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<void> {
    // Usuario solo puede marcar sus propias notificaciones, fundaciones pueden marcar todas
    if (req.user.id !== userId && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }
    
    return this.notificationsService.markAllAsRead(userId);
  }

  // Endpoint para ver una notificación específica
  @UseGuards(JwtAuthGuard)
  @Get('notifications/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Notification> {
    const notification = await this.notificationsService.findOne(id);
    
    // Usuario solo puede ver sus propias notificaciones, fundaciones pueden ver todas
    if (notification.user_id !== req.user.id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only view your own notifications');
    }
    
    return notification;
  }

  // Endpoint para marcar una notificación como leída
  @UseGuards(JwtAuthGuard)
  @Patch('notifications/:id/read')
  async markAsReadAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Notification> {
    const notification = await this.notificationsService.findOne(id);
    
    // Usuario solo puede marcar sus propias notificaciones, fundaciones pueden marcar todas
    if (notification.user_id !== req.user.id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }
    
    return this.notificationsService.markAsRead(id);
  }

  // Endpoint para actualizar una notificación (solo fundaciones)
  @UseGuards(JwtAuthGuard)
  @Patch('notifications/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req,
  ): Promise<Notification> {
    const notification = await this.notificationsService.findOne(id);
    
    // Solo fundaciones pueden actualizar notificaciones
    if (req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('Only foundation administrators can update notifications');
    }
    
    return this.notificationsService.update(id, updateNotificationDto);
  }

  // Endpoint para eliminar una notificación
  @UseGuards(JwtAuthGuard)
  @Delete('notifications/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    const notification = await this.notificationsService.findOne(id);
    
    // Usuario solo puede eliminar sus propias notificaciones, fundaciones pueden eliminar todas
    if (notification.user_id !== req.user.id && req.user.user_type !== UserType.FOUNDATION) {
      throw new ForbiddenException('You can only delete your own notifications');
    }
    
    return this.notificationsService.remove(id);
  }
}