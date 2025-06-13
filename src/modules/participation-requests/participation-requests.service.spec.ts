import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationRequestsService } from './participation-requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipationRequest, RequestStatus } from '../../entities/participation_request.entity';
import { User } from '../../entities/user.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('ParticipationRequestsService', () => {
  let service: ParticipationRequestsService;
  let requestRepo: Repository<ParticipationRequest>;
  let userRepo: Repository<User>;
  let socialActionRepo: Repository<SocialAction>;
  let foundationRepo: Repository<Foundation>;
  let notificationsService: NotificationsService;

  const mockRequestRepo = {
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

  const mockSocialActionRepo = {
    findOne: jest.fn(),
  };

  const mockFoundationRepo = {};

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationRequestsService,
        { provide: getRepositoryToken(ParticipationRequest), useValue: mockRequestRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(SocialAction), useValue: mockSocialActionRepo },
        { provide: getRepositoryToken(Foundation), useValue: mockFoundationRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ParticipationRequestsService>(ParticipationRequestsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('debería lanzar error si el usuario no existe', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ user_id: 'u1', social_action_id: 's1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si la acción social no existe', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1', name: 'User' });
      mockSocialActionRepo.findOne.mockResolvedValue(null);

      await expect(service.create({ user_id: 'u1', social_action_id: 's1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si ya existe una solicitud', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1', name: 'User' });
      mockSocialActionRepo.findOne.mockResolvedValue({ id: 's1', foundation: {}, description: 'Action' });
      mockRequestRepo.findOne.mockResolvedValue({ id: 'r1' });

      await expect(service.create({ user_id: 'u1', social_action_id: 's1' } as any)).rejects.toThrow(ConflictException);
    });

    it('debería crear y retornar la solicitud con notificación', async () => {
      const user = { id: 'u1', name: 'User' };
      const socialAction = {
        id: 's1',
        description: 'Clean Park',
        foundation: { user: { id: 'f1' } },
      };

      const request = { id: 'r1' };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockSocialActionRepo.findOne.mockResolvedValue(socialAction);
      mockRequestRepo.findOne.mockResolvedValue(null);
      mockRequestRepo.create.mockReturnValue(request);
      mockRequestRepo.save.mockResolvedValue(request);

      const result = await service.create({ user_id: 'u1', social_action_id: 's1' } as any);
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(result).toBe(request);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las solicitudes', async () => {
      const requests = [{ id: 'r1' }];
      mockRequestRepo.find.mockResolvedValue(requests);
      const result = await service.findAll();
      expect(result).toEqual(requests);
    });
  });

  describe('findOne', () => {
    it('debería retornar una solicitud', async () => {
      const request = { id: 'r1' };
      mockRequestRepo.findOne.mockResolvedValue(request);
      const result = await service.findOne('r1');
      expect(result).toEqual(request);
    });

    it('debería lanzar error si no existe', async () => {
      mockRequestRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('r1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('debería retornar solicitudes por usuario', async () => {
      const requests = [{ id: 'r1' }];
      mockRequestRepo.find.mockResolvedValue(requests);
      const result = await service.findByUser('u1');
      expect(result).toEqual(requests);
    });
  });

  describe('findBySocialAction', () => {
    it('debería retornar solicitudes por acción social', async () => {
      const requests = [{ id: 'r1' }];
      mockRequestRepo.find.mockResolvedValue(requests);
      const result = await service.findBySocialAction('s1');
      expect(result).toEqual(requests);
    });
  });

  describe('findPendingBySocialAction', () => {
    it('debería retornar solicitudes pendientes', async () => {
      const requests = [{ id: 'r1', status: RequestStatus.PENDING }];
      mockRequestRepo.find.mockResolvedValue(requests);
      const result = await service.findPendingBySocialAction('s1');
      expect(result).toEqual(requests);
    });
  });

  describe('update', () => {
    it('debería actualizar y enviar notificación si cambia estado', async () => {
      const request = { id: 'r1', status: RequestStatus.PENDING, user_id: 'u1', social_action_id: 's1' };
      const user = { id: 'u1' };
      const socialAction = { id: 's1', description: 'Action' };

      mockRequestRepo.findOne
        .mockResolvedValueOnce(request) // first findOne
        .mockResolvedValueOnce({ ...request, status: RequestStatus.ACCEPTED }); // after update
      mockUserRepo.findOne.mockResolvedValue(user);
      mockSocialActionRepo.findOne.mockResolvedValue(socialAction);
      mockRequestRepo.update.mockResolvedValue(undefined);

      const result = await service.update('r1', { status: RequestStatus.ACCEPTED });
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(result.status).toBe(RequestStatus.ACCEPTED);
    });
  });

  describe('remove', () => {
    it('debería eliminar una solicitud', async () => {
      mockRequestRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('r1')).resolves.toBeUndefined();
    });

    it('debería lanzar error si no existe', async () => {
      mockRequestRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('r1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSocialAction', () => {
    it('debería retornar la acción social', async () => {
      const action = { id: 's1' };
      mockSocialActionRepo.findOne.mockResolvedValue(action);
      const result = await service.getSocialAction('s1');
      expect(result).toBe(action);
    });

    it('debería lanzar error si no existe', async () => {
      mockSocialActionRepo.findOne.mockResolvedValue(null);
      await expect(service.getSocialAction('s1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkFoundationOwnership', () => {
    it('debería lanzar error si no hay fundación asociada', async () => {
      mockSocialActionRepo.findOne.mockResolvedValue({ id: 's1', foundation: null });
      await expect(service.checkFoundationOwnership('s1', 'u1')).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar error si el usuario no es el dueño', async () => {
      const action = { foundation: { user: { id: 'otro' } } };
      mockSocialActionRepo.findOne.mockResolvedValue(action);
      await expect(service.checkFoundationOwnership('s1', 'u1')).rejects.toThrow(ForbiddenException);
    });

    it('no debería lanzar error si el usuario es dueño', async () => {
      const action = { foundation: { user: { id: 'u1' } } };
      mockSocialActionRepo.findOne.mockResolvedValue(action);
      await expect(service.checkFoundationOwnership('s1', 'u1')).resolves.toBeUndefined();
    });
  });
});
