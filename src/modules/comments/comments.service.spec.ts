import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { User } from '../../entities/user.entity';
import { Donation } from '../../entities/donation.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { Foundation } from '../../entities/foundation.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: Repository<Comment>;
  let userRepo: Repository<User>;
  let donationRepo: Repository<Donation>;
  let socialActionRepo: Repository<SocialAction>;
  let foundationRepo: Repository<Foundation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(Donation), useClass: Repository },
        { provide: getRepositoryToken(SocialAction), useClass: Repository },
        { provide: getRepositoryToken(Foundation), useClass: Repository },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepo = module.get(getRepositoryToken(Comment));
    userRepo = module.get(getRepositoryToken(User));
    donationRepo = module.get(getRepositoryToken(Donation));
    socialActionRepo = module.get(getRepositoryToken(SocialAction));
    foundationRepo = module.get(getRepositoryToken(Foundation));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería lanzar error si el usuario no existe', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
      await expect(
        service.create({
          user_id: '1',
          text: 'Comentario prueba',
          donation_id: 'd1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si no se proporciona ningún ID relacionado', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: '1' } as User);
      await expect(
        service.create({
          user_id: '1',
          text: 'Sin IDs relacionados',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar error si se proporciona más de un ID relacionado', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: '1' } as User);
      await expect(
        service.create({
          user_id: '1',
          text: 'IDs conflictivos',
          donation_id: 'd1',
          foundation_id: 'f1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar error si la donación no existe', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: '1' } as User);
      jest.spyOn(donationRepo, 'findOne').mockResolvedValue(null);
      await expect(
        service.create({
          user_id: '1',
          text: 'Sobre donación',
          donation_id: 'd1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería crear comentario si todo es válido', async () => {
      const comentario = { id: 'c1', text: 'Todo correcto' } as Comment;

      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: '1' } as User);
      jest.spyOn(donationRepo, 'findOne').mockResolvedValue({ id: 'd1' } as Donation);
      jest.spyOn(commentRepo, 'create').mockReturnValue(comentario);
      jest.spyOn(commentRepo, 'save').mockResolvedValue(comentario);

      const resultado = await service.create({
        user_id: '1',
        text: 'Todo correcto',
        donation_id: 'd1',
      });

      expect(resultado).toEqual(comentario);
    });
  });
});
