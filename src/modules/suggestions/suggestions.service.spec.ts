import { Test, TestingModule } from '@nestjs/testing';
import { SuggestionsService } from './suggestions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suggestion } from '../../entities/suggestion.entity';
import { User } from '../../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

describe('SuggestionsService', () => {
  let service: SuggestionsService;
  let suggestionRepo: Repository<Suggestion>;
  let userRepo: Repository<User>;
  let notificationsService: NotificationsService;

  const mockSuggestionRepo = {
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

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionsService,
        { provide: getRepositoryToken(Suggestion), useValue: mockSuggestionRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<SuggestionsService>(SuggestionsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('debería lanzar error si el usuario no existe', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.create({ user_id: 'u1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('debería crear una sugerencia válida y notificar al usuario', async () => {
      const suggestion = { id: 's1' };
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockSuggestionRepo.create.mockReturnValue(suggestion);
      mockSuggestionRepo.save.mockResolvedValue(suggestion);

      const result = await service.create({ user_id: 'u1', content: 'Mi sugerencia' } as any);
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(result).toBe(suggestion);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las sugerencias', async () => {
      const suggestions = [{ id: 's1' }];
      mockSuggestionRepo.find.mockResolvedValue(suggestions);

      const result = await service.findAll();
      expect(result).toEqual(suggestions);
    });
  });

  describe('findOne', () => {
    it('debería lanzar error si no existe la sugerencia', async () => {
      mockSuggestionRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('s1')).rejects.toThrow(NotFoundException);
    });

    it('debería retornar una sugerencia', async () => {
      const suggestion = { id: 's1' };
      mockSuggestionRepo.findOne.mockResolvedValue(suggestion);

      const result = await service.findOne('s1');
      expect(result).toEqual(suggestion);
    });
  });

  describe('findByUser', () => {
    it('debería retornar sugerencias por usuario', async () => {
      const suggestions = [{ id: 's1' }];
      mockSuggestionRepo.find.mockResolvedValue(suggestions);

      const result = await service.findByUser('u1');
      expect(result).toEqual(suggestions);
    });
  });

  describe('findUnprocessed', () => {
    it('debería retornar sugerencias no procesadas', async () => {
      const suggestions = [{ id: 's1', processed: false }];
      mockSuggestionRepo.find.mockResolvedValue(suggestions);

      const result = await service.findUnprocessed();
      expect(result).toEqual(suggestions);
    });
  });

  describe('markAsProcessed', () => {
    it('debería marcar como procesada y notificar si no lo estaba', async () => {
      const suggestion = {
        id: 's1',
        processed: false,
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        user: { id: 'u1' },
      };
      const updated = { ...suggestion, processed: true };

      mockSuggestionRepo.findOne.mockResolvedValueOnce(suggestion);
      mockSuggestionRepo.update.mockResolvedValue(undefined);
      mockSuggestionRepo.findOne.mockResolvedValueOnce(updated);

      const result = await service.markAsProcessed('s1');
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(result.processed).toBe(true);
    });

    it('no debería notificar si ya estaba procesada', async () => {
      const suggestion = {
        id: 's1',
        processed: true,
        content: 'Texto largo',
        user: { id: 'u1' },
      };
      mockSuggestionRepo.findOne.mockResolvedValueOnce(suggestion);
      mockSuggestionRepo.update.mockResolvedValue(undefined);
      mockSuggestionRepo.findOne.mockResolvedValueOnce(suggestion);

      const result = await service.markAsProcessed('s1');
      expect(mockNotificationsService.create).not.toHaveBeenCalled();
      expect(result.processed).toBe(true);
    });
  });

  describe('update', () => {
    it('debería actualizar y notificar si se marca como procesada', async () => {
      const suggestion = {
        id: 's1',
        processed: false,
        content: 'Texto largo',
        user: { id: 'u1' },
      };
      const updated = { ...suggestion, processed: true };

      mockSuggestionRepo.findOne.mockResolvedValueOnce(suggestion);
      mockSuggestionRepo.update.mockResolvedValue(undefined);
      mockSuggestionRepo.findOne.mockResolvedValueOnce(updated);

      const result = await service.update('s1', { processed: true });
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(result.processed).toBe(true);
    });

    it('no debería notificar si no hay cambio en "processed"', async () => {
      const suggestion = {
        id: 's1',
        processed: true,
        content: 'Texto largo',
        user: { id: 'u1' },
      };
      mockSuggestionRepo.findOne.mockResolvedValueOnce(suggestion);
      mockSuggestionRepo.update.mockResolvedValue(undefined);
      mockSuggestionRepo.findOne.mockResolvedValueOnce(suggestion);

      const result = await service.update('s1', { processed: true });
      expect(mockNotificationsService.create).not.toHaveBeenCalled();
      expect(result.processed).toBe(true);
    });
  });

  describe('remove', () => {
    it('debería eliminar una sugerencia si existe', async () => {
      mockSuggestionRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('s1')).resolves.toBeUndefined();
    });

    it('debería lanzar error si no se elimina ninguna sugerencia', async () => {
      mockSuggestionRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('s1')).rejects.toThrow(NotFoundException);
    });
  });
});
