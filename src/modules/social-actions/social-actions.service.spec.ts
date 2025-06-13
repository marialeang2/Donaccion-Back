import { Test, TestingModule } from '@nestjs/testing';
import { SocialActionsService } from './social-actions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { ParticipationRequest, RequestStatus } from '../../entities/participation_request.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('SocialActionsService', () => {
  let service: SocialActionsService;
  let socialActionRepo: Repository<SocialAction>;
  let foundationRepo: Repository<Foundation>;
  let participationRequestRepo: Repository<ParticipationRequest>;

  const mockSocialActionRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFoundationRepo = {
    findOne: jest.fn(),
  };

  const mockParticipationRequestRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialActionsService,
        { provide: getRepositoryToken(SocialAction), useValue: mockSocialActionRepo },
        { provide: getRepositoryToken(Foundation), useValue: mockFoundationRepo },
        { provide: getRepositoryToken(ParticipationRequest), useValue: mockParticipationRequestRepo },
      ],
    }).compile();

    service = module.get<SocialActionsService>(SocialActionsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('checkFoundationUser', () => {
    it('debería lanzar error si la fundación no existe', async () => {
      mockFoundationRepo.findOne.mockResolvedValue(null);
      await expect(service.checkFoundationUser('f1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si el usuario no pertenece a la fundación', async () => {
      mockFoundationRepo.findOne.mockResolvedValue({ id: 'f1', user_id: 'otro' });
      await expect(service.checkFoundationUser('f1', 'u1')).rejects.toThrow(ForbiddenException);
    });

    it('no debería lanzar error si el usuario pertenece a la fundación', async () => {
      mockFoundationRepo.findOne.mockResolvedValue({ id: 'f1', user_id: 'u1' });
      await expect(service.checkFoundationUser('f1', 'u1')).resolves.toBeUndefined();
    });
  });

  describe('create', () => {
    it('debería lanzar error si la fundación no existe', async () => {
      mockFoundationRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ foundation_id: 'f1' } as any, 'u1')).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si el usuario no pertenece a la fundación', async () => {
      mockFoundationRepo.findOne.mockResolvedValue({ id: 'f1', user_id: 'otro' });
      await expect(service.create({ foundation_id: 'f1' } as any, 'u1')).rejects.toThrow(ForbiddenException);
    });

    it('debería crear una acción social si es válida', async () => {
      const action = { id: 's1' };
      mockFoundationRepo.findOne.mockResolvedValue({ id: 'f1', user_id: 'u1' });
      mockSocialActionRepo.create.mockReturnValue(action);
      mockSocialActionRepo.save.mockResolvedValue(action);

      const result = await service.create({ foundation_id: 'f1' } as any, 'u1');
      expect(result).toBe(action);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las acciones sociales', async () => {
      const actions = [{ id: 's1' }];
      mockSocialActionRepo.find.mockResolvedValue(actions);
      const result = await service.findAll();
      expect(result).toEqual(actions);
    });
  });

  describe('findOne', () => {
    it('debería lanzar error si no existe', async () => {
      mockSocialActionRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('s1')).rejects.toThrow(NotFoundException);
    });

    it('debería retornar una acción social', async () => {
      const action = { id: 's1' };
      mockSocialActionRepo.findOne.mockResolvedValue(action);
      const result = await service.findOne('s1');
      expect(result).toBe(action);
    });
  });

  describe('findByFoundation', () => {
    it('debería retornar acciones por fundación', async () => {
      const actions = [{ id: 's1' }];
      mockSocialActionRepo.find.mockResolvedValue(actions);
      const result = await service.findByFoundation('f1');
      expect(result).toEqual(actions);
    });
  });

  describe('findUpcoming', () => {
    it('debería retornar acciones futuras', async () => {
      const actions = [{ id: 's1' }];
      mockSocialActionRepo.find.mockResolvedValue(actions);
      const result = await service.findUpcoming();
      expect(result).toEqual(actions);
      expect(mockSocialActionRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { start_date: expect.any(Object) },
      }));
    });
  });

  describe('findActive', () => {
    it('debería retornar acciones activas', async () => {
      const actions = [{ id: 's1' }];
      mockSocialActionRepo.find.mockResolvedValue(actions);
      const result = await service.findActive();
      expect(result).toEqual(actions);
      expect(mockSocialActionRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          start_date: expect.any(Object),
          end_date: expect.any(Object),
        }),
      }));
    });
  });


  describe('remove', () => {
    it('debería eliminar la acción', async () => {
      mockSocialActionRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('s1')).resolves.toBeUndefined();
    });

    it('debería lanzar error si no se encuentra', async () => {
      mockSocialActionRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('s1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('applyToSocialAction', () => {
    it('debería lanzar error si ya hay una solicitud', async () => {
      mockSocialActionRepo.findOne.mockResolvedValue({ id: 's1' });
      mockParticipationRequestRepo.findOne.mockResolvedValue({ id: 'r1' });

      await expect(service.applyToSocialAction('s1', 'u1', {})).rejects.toThrow(ForbiddenException);
    });

    it('debería crear una solicitud válida', async () => {
      const action = { id: 's1' };
      const newRequest = { id: 'r2' };

      mockSocialActionRepo.findOne.mockResolvedValue(action);
      mockParticipationRequestRepo.findOne.mockResolvedValue(null);
      mockParticipationRequestRepo.create.mockReturnValue(newRequest);
      mockParticipationRequestRepo.save.mockResolvedValue(newRequest);

      const result = await service.applyToSocialAction('s1', 'u1', { message: 'help' });
      expect(result).toBe(newRequest);
    });
  });
});
