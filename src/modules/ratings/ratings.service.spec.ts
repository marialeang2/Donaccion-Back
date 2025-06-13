import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../../entities/rating.entity';
import { User } from '../../entities/user.entity';
import { Donation } from '../../entities/donation.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('RatingsService', () => {
  let service: RatingsService;
  let ratingRepo: Repository<Rating>;
  let userRepo: Repository<User>;
  let donationRepo: Repository<Donation>;
  let socialActionRepo: Repository<SocialAction>;

  const mockRatingRepo = {
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

  const mockDonationRepo = {
    findOne: jest.fn(),
  };

  const mockSocialActionRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        { provide: getRepositoryToken(Rating), useValue: mockRatingRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Donation), useValue: mockDonationRepo },
        { provide: getRepositoryToken(SocialAction), useValue: mockSocialActionRepo },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should throw if user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ user_id: 'u1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if neither donation_id nor social_action_id is provided', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      await expect(service.create({ user_id: 'u1' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw if both donation_id and social_action_id are provided', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      await expect(
        service.create({ user_id: 'u1', donation_id: 'd1', social_action_id: 's1' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a donation rating if valid', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockDonationRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      mockRatingRepo.findOne.mockResolvedValue(null);
      mockRatingRepo.create.mockReturnValue({ id: 'r1' });
      mockRatingRepo.save.mockResolvedValue({ id: 'r1' });

      const result = await service.create({ user_id: 'u1', donation_id: 'd1', rating: 5 });
      expect(result.id).toBe('r1');
    });

    it('should throw if donation not found', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockDonationRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ user_id: 'u1', donation_id: 'd1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user did not make the donation', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockDonationRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'other' });
      await expect(service.create({ user_id: 'u1', donation_id: 'd1' } as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw if user already rated the donation', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockDonationRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      mockRatingRepo.findOne.mockResolvedValue({ id: 'r1' });
      await expect(service.create({ user_id: 'u1', donation_id: 'd1' } as any)).rejects.toThrow(ConflictException);
    });

    it('should create a social action rating if valid', async () => {
      const socialAction = {
        id: 's1',
        participation_requests: [{ user_id: 'u1', status: 'accepted' }],
      };
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockSocialActionRepo.findOne.mockResolvedValue(socialAction);
      mockRatingRepo.findOne.mockResolvedValue(null);
      mockRatingRepo.create.mockReturnValue({ id: 'r1' });
      mockRatingRepo.save.mockResolvedValue({ id: 'r1' });

      const result = await service.create({ user_id: 'u1', social_action_id: 's1', rating: 4 });
      expect(result.id).toBe('r1');
    });

    it('should throw if user did not participate in social action', async () => {
      const action = { participation_requests: [{ user_id: 'u1', status: 'pending' }] };
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
      mockSocialActionRepo.findOne.mockResolvedValue(action);
      mockRatingRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ user_id: 'u1', social_action_id: 's1' } as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all ratings', async () => {
      mockRatingRepo.find.mockResolvedValue([{ id: 'r1' }]);
      const result = await service.findAll();
      expect(result.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a rating', async () => {
      mockRatingRepo.findOne.mockResolvedValue({ id: 'r1' });
      const result = await service.findOne('r1');
      expect(result.id).toBe('r1');
    });

    it('should throw if rating not found', async () => {
      mockRatingRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('r1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return ratings by user', async () => {
      mockRatingRepo.find.mockResolvedValue([{ id: 'r1' }]);
      const result = await service.findByUser('u1');
      expect(result.length).toBe(1);
    });
  });

  describe('findByDonation', () => {
    it('should return ratings by donation', async () => {
      mockRatingRepo.find.mockResolvedValue([{ id: 'r1' }]);
      const result = await service.findByDonation('d1');
      expect(result.length).toBe(1);
    });
  });

  describe('findBySocialAction', () => {
    it('should return ratings by social action', async () => {
      mockRatingRepo.find.mockResolvedValue([{ id: 'r1' }]);
      const result = await service.findBySocialAction('s1');
      expect(result.length).toBe(1);
    });
  });

  describe('getAverageForDonation', () => {
    it('should return 0 if no ratings', async () => {
      mockDonationRepo.findOne.mockResolvedValue({ id: 'd1' });
      mockRatingRepo.find.mockResolvedValue([]);
      const result = await service.getAverageForDonation('d1');
      expect(result).toBe(0);
    });

    it('should return average rating', async () => {
      mockDonationRepo.findOne.mockResolvedValue({ id: 'd1' });
      mockRatingRepo.find.mockResolvedValue([{ rating: 4 }, { rating: 2 }]);
      const result = await service.getAverageForDonation('d1');
      expect(result).toBe(3);
    });

    it('should throw if donation not found', async () => {
      mockDonationRepo.findOne.mockResolvedValue(null);
      await expect(service.getAverageForDonation('d1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAverageForSocialAction', () => {
    it('should return 0 if no ratings', async () => {
      mockSocialActionRepo.findOne.mockResolvedValue({ id: 's1' });
      mockRatingRepo.find.mockResolvedValue([]);
      const result = await service.getAverageForSocialAction('s1');
      expect(result).toBe(0);
    });

    it('should return average rating', async () => {
      mockSocialActionRepo.findOne.mockResolvedValue({ id: 's1' });
      mockRatingRepo.find.mockResolvedValue([{ rating: 5 }, { rating: 3 }]);
      const result = await service.getAverageForSocialAction('s1');
      expect(result).toBe(4);
    });

    it('should throw if social action not found', async () => {
      mockSocialActionRepo.findOne.mockResolvedValue(null);
      await expect(service.getAverageForSocialAction('s1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated rating', async () => {
      const rating = { id: 'r1' };
      mockRatingRepo.findOne
        .mockResolvedValueOnce(rating)
        .mockResolvedValueOnce({ ...rating, rating: 5 });
      mockRatingRepo.update.mockResolvedValue(undefined);

      const result = await service.update('r1', { rating: 5 });
      expect(result.rating).toBe(5);
    });
  });

  describe('remove', () => {
    it('should remove the rating', async () => {
      mockRatingRepo.findOne.mockResolvedValue({ id: 'r1' });
      mockRatingRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('r1')).resolves.toBeUndefined();
    });

    it('should throw if rating not found before deletion', async () => {
      mockRatingRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('r1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if rating not deleted', async () => {
      mockRatingRepo.findOne.mockResolvedValue({ id: 'r1' });
      mockRatingRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('r1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkRatingOwnership', () => {
    it('should return true if user is owner', async () => {
      mockRatingRepo.findOne.mockResolvedValue({ id: 'r1', user_id: 'u1' });
      const result = await service.checkRatingOwnership('r1', 'u1');
      expect(result).toBe(true);
    });

    it('should return false if user is not owner', async () => {
      mockRatingRepo.findOne.mockResolvedValue({ id: 'r1', user_id: 'u2' });
      const result = await service.checkRatingOwnership('r1', 'u1');
      expect(result).toBe(false);
    });
  });
});
