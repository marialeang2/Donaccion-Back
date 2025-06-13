import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: Repository<Notification>;
  let userRepo: Repository<User>;

  const mockNotificationRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepo = module.get(getRepositoryToken(Notification));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería lanzar error si el usuario no existe', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ user_id: 'u1', content: 'Hello' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería crear y retornar una notificación', async () => {
      const notification = { id: 'n1' } as Notification;
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockNotificationRepo.create.mockReturnValue(notification);
      mockNotificationRepo.save.mockResolvedValue(notification);

      const result = await service.create({ user_id: 'u1', content: 'Hello' } as any);
      expect(result).toBe(notification);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las notificaciones', async () => {
      const notifications = [{ id: 'n1' }] as Notification[];
      mockNotificationRepo.find.mockResolvedValue(notifications);

      const result = await service.findAll();
      expect(result).toEqual(notifications);
    });
  });

  describe('findOne', () => {
    it('debería lanzar error si no se encuentra la notificación', async () => {
      mockNotificationRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('n1')).rejects.toThrow(NotFoundException);
    });

    it('debería retornar una notificación si existe', async () => {
      const notification = { id: 'n1' } as Notification;
      mockNotificationRepo.findOne.mockResolvedValue(notification);

      const result = await service.findOne('n1');
      expect(result).toBe(notification);
    });
  });

  describe('findByUser', () => {
    it('debería retornar las notificaciones de un usuario', async () => {
      const notifications = [{ id: 'n1' }] as Notification[];
      mockNotificationRepo.find.mockResolvedValue(notifications);

      const result = await service.findByUser('u1');
      expect(result).toEqual(notifications);
    });
  });

  describe('findUnreadByUser', () => {
    it('debería retornar notificaciones no leídas de un usuario', async () => {
      const notifications = [{ id: 'n1', read: false }] as Notification[];
      mockNotificationRepo.find.mockResolvedValue(notifications);

      const result = await service.findUnreadByUser('u1');
      expect(result).toEqual(notifications);
    });
  });

  describe('markAsRead', () => {
    it('debería marcar una notificación como leída y retornarla', async () => {
      const notification = { id: 'n1', read: false } as Notification;
      const updated = { id: 'n1', read: true } as Notification;

      mockNotificationRepo.findOne
        .mockResolvedValueOnce(notification) // first findOne
        .mockResolvedValueOnce(updated);   // after update
      mockNotificationRepo.update.mockResolvedValue(undefined);

      const result = await service.markAsRead('n1');
      expect(result).toEqual(updated);
    });
  });

  describe('markAllAsRead', () => {
    it('debería marcar todas las notificaciones de un usuario como leídas', async () => {
      mockNotificationRepo.update.mockResolvedValue(undefined);
      await expect(service.markAllAsRead('u1')).resolves.toBeUndefined();
    });
  });

  describe('remove', () => {
    it('debería eliminar una notificación si existe', async () => {
      mockNotificationRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('n1')).resolves.toBeUndefined();
    });

    it('debería lanzar error si no se elimina ninguna notificación', async () => {
      mockNotificationRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('n1')).rejects.toThrow(NotFoundException);
    });
  });
});
