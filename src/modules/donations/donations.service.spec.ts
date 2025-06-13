import { Test, TestingModule } from '@nestjs/testing';
import { DonationsService } from './donations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Donation } from '../../entities/donation.entity';
import { User } from '../../entities/user.entity';
import { Foundation } from '../../entities/foundation.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('DonationsService', () => {
  let service: DonationsService;
  let donationRepo: Repository<Donation>;
  let userRepo: Repository<User>;
  let foundationRepo: Repository<Foundation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(Donation), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(Foundation), useClass: Repository },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
    donationRepo = module.get(getRepositoryToken(Donation));
    userRepo = module.get(getRepositoryToken(User));
    foundationRepo = module.get(getRepositoryToken(Foundation));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería lanzar error si el usuario no existe', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.create({ user_id: 'u1', foundation_id: 'f1', amount: 100}),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si la fundación no existe', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: 'u1' } as User);
      jest.spyOn(foundationRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.create({ user_id: 'u1', foundation_id: 'f1', amount: 100}),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería crear una donación válida', async () => {
      const donation = { id: 'd1' } as Donation;

      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: 'u1' } as User);
      jest.spyOn(foundationRepo, 'findOne').mockResolvedValue({ id: 'f1' } as Foundation);
      jest.spyOn(donationRepo, 'create').mockReturnValue(donation);
      jest.spyOn(donationRepo, 'save').mockResolvedValue(donation);

      const result = await service.create({ user_id: 'u1', foundation_id: 'f1', amount: 100});
      expect(result).toBe(donation);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las donaciones', async () => {
      const mockDonations = [{ id: 'd1' }] as Donation[];
      jest.spyOn(donationRepo, 'find').mockResolvedValue(mockDonations);

      const result = await service.findAll();
      expect(result).toEqual(mockDonations);
    });
  });

  describe('findOne', () => {
    it('debería lanzar error si no se encuentra la donación', async () => {
      jest.spyOn(donationRepo, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('d1')).rejects.toThrow(NotFoundException);
    });

    it('debería retornar la donación si existe', async () => {
      const donation = { id: 'd1' } as Donation;
      jest.spyOn(donationRepo, 'findOne').mockResolvedValue(donation);

      const result = await service.findOne('d1');
      expect(result).toBe(donation);
    });
  });

  describe('findByUser', () => {
    it('debería retornar las donaciones de un usuario', async () => {
      const donations = [{ id: 'd1' }] as Donation[];
      jest.spyOn(donationRepo, 'find').mockResolvedValue(donations);

      const result = await service.findByUser('u1');
      expect(result).toEqual(donations);
    });
  });

  describe('findByFoundation', () => {
    it('debería retornar las donaciones de una fundación', async () => {
      const donations = [{ id: 'd1' }] as Donation[];
      jest.spyOn(donationRepo, 'find').mockResolvedValue(donations);

      const result = await service.findByFoundation('f1');
      expect(result).toEqual(donations);
    });
  });

  describe('findByUserAndFoundation', () => {
    it('debería retornar las donaciones de un usuario a una fundación específica', async () => {
      const donations = [{ id: 'd1' }] as Donation[];
      jest.spyOn(donationRepo, 'find').mockResolvedValue(donations);

      const result = await service.findByUserAndFoundation('u1', 'f1');
      expect(result).toEqual(donations);
    });
  });

  describe('remove', () => {
    it('debería eliminar una donación si existe', async () => {
      jest.spyOn(donationRepo, 'delete').mockResolvedValue({ affected: 1 } as any);
      await expect(service.remove('d1')).resolves.toBeUndefined();
    });

    it('debería lanzar error si no se elimina ninguna donación', async () => {
      jest.spyOn(donationRepo, 'delete').mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('d1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFoundation', () => {
    it('debería retornar la fundación si existe', async () => {
      const foundation = { id: 'f1' } as Foundation;
      jest.spyOn(foundationRepo, 'findOne').mockResolvedValue(foundation);

      const result = await service.getFoundation('f1');
      expect(result).toBe(foundation);
    });

    it('debería lanzar error si la fundación no existe', async () => {
      jest.spyOn(foundationRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getFoundation('f1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFoundationByUserId', () => {
    it('debería retornar la fundación asociada al usuario', async () => {
      const foundation = { id: 'f1' } as Foundation;
      jest.spyOn(foundationRepo, 'findOne').mockResolvedValue(foundation);

      const result = await service.getFoundationByUserId('u1');
      expect(result).toBe(foundation);
    });

    it('debería lanzar error si no se encuentra una fundación para el usuario', async () => {
      jest.spyOn(foundationRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getFoundationByUserId('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('isFoundationUserForDonation', () => {
    it('debería retornar true si el usuario es dueño de la fundación de la donación', async () => {
      jest.spyOn(donationRepo, 'findOne').mockResolvedValue({ foundation: { id: 'f1', user_id: 'u1' }, foundation_id: 'f1' } as Donation);
      jest.spyOn(foundationRepo, 'findOne').mockResolvedValue({ id: 'f1', user_id: 'u1' } as Foundation);

      const result = await service.isFoundationUserForDonation('d1', 'u1');
      expect(result).toBe(true);
    });

    it('debería retornar false si no hay fundación asociada', async () => {
      jest.spyOn(donationRepo, 'findOne').mockResolvedValue({ foundation: null } as Donation);
      const result = await service.isFoundationUserForDonation('d1', 'u1');
      expect(result).toBe(false);
    });

    it('debería retornar false si la fundación no coincide con el usuario', async () => {
      jest.spyOn(donationRepo, 'findOne').mockResolvedValue({ foundation: { id: 'f1' }, foundation_id: 'f1' } as Donation);
      jest.spyOn(foundationRepo, 'findOne').mockResolvedValue({ id: 'f1', user_id: 'otro' } as Foundation);

      const result = await service.isFoundationUserForDonation('d1', 'u1');
      expect(result).toBe(false);
    });
  });
});
