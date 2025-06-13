import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Favorite } from '../../entities/favorite.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Repository<User>;
  let favoriteRepo: Repository<Favorite>;

  const mockUserRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockFavoriteRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Favorite), useValue: mockFavoriteRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should throw if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });

      await expect(
        service.create({ email: 'test@example.com', password: '123' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and return user', async () => {
      const user = { id: 'u1', email: 'test@example.com' };
      mockUserRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserRepo.create.mockReturnValue(user);
      mockUserRepo.save.mockResolvedValue(user);

      const result = await service.create({ email: 'test@example.com', password: '123' } as any);
      expect(result).toHaveProperty('id', 'u1');
    });
  });

  describe('findAll', () => {
    it('should return user response DTOs', async () => {
      mockUserRepo.find.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should throw if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });

    it('should return user DTO', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      const result = await service.findOne('u1');
      expect(result).toHaveProperty('id', 'u1');
    });
  });

  describe('findByEmail', () => {
    it('should return user', async () => {
      const user = { id: 'u1', email: 'a@b.com' };
      mockUserRepo.findOne.mockResolvedValue(user);
      const result = await service.findByEmail('a@b.com');
      expect(result).toBe(user);
    });

    it('should throw if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.findByEmail('missing@mail.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.update('u1', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw if new email already in use', async () => {
      mockUserRepo.findOne
        .mockResolvedValueOnce({ id: 'u1', email: 'old@mail.com' }) // current user
        .mockResolvedValueOnce({ id: 'u2', email: 'new@mail.com' }); // duplicate email
      await expect(service.update('u1', { email: 'new@mail.com' })).rejects.toThrow(ConflictException);
    });

    it('should hash password and update user', async () => {
      const user = { id: 'u1', email: 'a@b.com' };
      mockUserRepo.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ ...user, name: 'Updated' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
      mockUserRepo.update.mockResolvedValue(undefined);

      const result = await service.update('u1', { password: 'newpass', name: 'Updated' });
      expect(result).toHaveProperty('id', 'u1');
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      mockUserRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('u1')).resolves.toBeUndefined();
    });

    it('should throw if user not found', async () => {
      mockUserRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFavorites', () => {
    it('should return user favorites', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockFavoriteRepo.find.mockResolvedValue([{ id: 'f1' }]);

      const result = await service.getFavorites('u1');
      expect(result).toHaveLength(1);
    });

    it('should throw if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.getFavorites('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addFavorite', () => {
    it('should throw if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(
        service.addFavorite('u1', { item_id: 'i1', item_type: 'donation' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if favorite already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockFavoriteRepo.findOne.mockResolvedValue({ id: 'f1' });
      await expect(
        service.addFavorite('u1', { item_id: 'i1', item_type: 'donation' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should add and return favorite', async () => {
      const favorite = { id: 'f1' };
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockFavoriteRepo.findOne.mockResolvedValue(null);
      mockFavoriteRepo.create.mockReturnValue(favorite);
      mockFavoriteRepo.save.mockResolvedValue(favorite);

      const result = await service.addFavorite('u1', { item_id: 'i1', item_type: 'donation' } as any);
      expect(result).toHaveProperty('id', 'f1');
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite if found', async () => {
      const fav = { id: 'f1' };
      mockFavoriteRepo.findOne.mockResolvedValue(fav);
      mockFavoriteRepo.remove.mockResolvedValue(undefined);

      await expect(service.removeFavorite('u1', 'i1')).resolves.toBeUndefined();
    });

    it('should throw if favorite not found', async () => {
      mockFavoriteRepo.findOne.mockResolvedValue(null);
      await expect(service.removeFavorite('u1', 'i1')).rejects.toThrow(NotFoundException);
    });
  });
});
