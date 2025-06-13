import { Test, TestingModule } from '@nestjs/testing';
import { FoundationsService } from './foundations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Foundation } from '../../entities/foundation.entity';
import { User, UserType } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('FoundationsService', () => {
  let service: FoundationsService;
  let foundationRepo: Repository<Foundation>;
  let userRepo: Repository<User>;

  const mockFoundationRepo = {
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

  const mockUsersService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoundationsService,
        { provide: getRepositoryToken(Foundation), useValue: mockFoundationRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<FoundationsService>(FoundationsService);
    foundationRepo = module.get(getRepositoryToken(Foundation));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería lanzar error si el usuario no existe', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.create({ user_id: '1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si el usuario no es de tipo FOUNDATION', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: '1', user_type: UserType.USER});

      await expect(service.create({ user_id: '1' } as any)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar error si ya existe una fundación para el usuario', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: '1', user_type: UserType.FOUNDATION });
      mockFoundationRepo.findOne.mockResolvedValue({ id: 'f1' });

      await expect(service.create({ user_id: '1' } as any)).rejects.toThrow(ConflictException);
    });

    it('debería crear una fundación correctamente', async () => {
      const foundationData = { user_id: '1' };
      const newFoundation = { id: 'f1', ...foundationData };

      mockUserRepo.findOne.mockResolvedValue({ id: '1', user_type: UserType.FOUNDATION });
      mockFoundationRepo.findOne.mockResolvedValue(null);
      mockFoundationRepo.create.mockReturnValue(newFoundation);
      mockFoundationRepo.save.mockResolvedValue(newFoundation);

      const result = await service.create(foundationData as any);
      expect(result).toEqual(newFoundation);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las fundaciones', async () => {
      const foundations = [{ id: 'f1' }];
      mockFoundationRepo.find.mockResolvedValue(foundations);

      const result = await service.findAll();
      expect(result).toEqual(foundations);
    });
  });

  describe('findOne', () => {
    it('debería retornar una fundación si existe', async () => {
      const foundation = { id: 'f1' };
      mockFoundationRepo.findOne.mockResolvedValue(foundation);

      const result = await service.findOne('f1');
      expect(result).toEqual(foundation);
    });

    it('debería lanzar error si no existe la fundación', async () => {
      mockFoundationRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('f1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('debería retornar una fundación por ID de usuario', async () => {
      const foundation = { id: 'f1' };
      mockFoundationRepo.findOne.mockResolvedValue(foundation);

      const result = await service.findByUserId('u1');
      expect(result).toEqual(foundation);
    });

    it('debería lanzar error si no se encuentra la fundación para ese usuario', async () => {
      mockFoundationRepo.findOne.mockResolvedValue(null);

      await expect(service.findByUserId('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar y retornar la fundación actualizada', async () => {
      const updatedFoundation = { id: 'f1', name: 'Updated' };
      mockFoundationRepo.findOne.mockResolvedValueOnce({ id: 'f1' });
      mockFoundationRepo.update.mockResolvedValue(undefined);
      mockFoundationRepo.findOne.mockResolvedValueOnce(updatedFoundation);

      const result = await service.update('f1', { legal_name: 'Updated' });
      expect(result).toEqual(updatedFoundation);
    });
  });

  describe('remove', () => {
    it('debería eliminar una fundación si existe', async () => {
      mockFoundationRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove('f1')).resolves.toBeUndefined();
    });

    it('debería lanzar error si la fundación no existe', async () => {
      mockFoundationRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('f1')).rejects.toThrow(NotFoundException);
    });
  });
});
