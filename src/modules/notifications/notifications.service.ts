import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Verificar si el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createNotificationDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${createNotificationDto.user_id}" not found`);
    }

    // Crear y guardar la nueva notificación
    const newNotification = this.notificationsRepository.create(createNotificationDto);
    return this.notificationsRepository.save(newNotification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      relations: ['user'],
      order: { notification_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }

    return notification;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId },
      order: { notification_date: 'DESC' },
    });
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { 
        user_id: userId,
        read: false
      },
      order: { notification_date: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    
    // Marcar como leída
    await this.notificationsRepository.update(id, { read: true });
    
    // Devolver la notificación actualizada
    return this.findOne(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { user_id: userId, read: false },
      { read: true }
    );
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    
    // Actualizar la notificación
    await this.notificationsRepository.update(id, updateNotificationDto);
    
    // Devolver la notificación actualizada
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
  }
}
