import { Test, TestingModule } from '@nestjs/testing';
import { CertificatesService } from './certificates.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Certificate } from '../../entities/certificate.entity';
import { User } from '../../entities/user.entity';
import { ParticipationRequest, RequestStatus } from '../../entities/participation_request.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let certificatesRepo: Repository<Certificate>;
  let usersRepo: Repository<User>;
  let participationRepo: Repository<ParticipationRequest>;
  let socialActionsRepo: Repository<SocialAction>;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        {
          provide: getRepositoryToken(Certificate),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ParticipationRequest),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SocialAction),
          useClass: Repository,
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(), // Mock del servicio de notificaciones
          },
        },
      ],
    }).compile();

    service = module.get<CertificatesService>(CertificatesService);
    certificatesRepo = module.get<Repository<Certificate>>(getRepositoryToken(Certificate));
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    participationRepo = module.get<Repository<ParticipationRequest>>(getRepositoryToken(ParticipationRequest));
    socialActionsRepo = module.get<Repository<SocialAction>>(getRepositoryToken(SocialAction));
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it('el servicio debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      jest.spyOn(usersRepo, 'findOne').mockResolvedValue(null);

      await expect(service.create({ user_id: '1', description: 'certificado de prueba' }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('debe crear un certificado y enviar una notificación', async () => {
      const usuario = { id: '1' } as User;
      const certificado = { id: 'c1', user_id: '1', description: 'Certificado de Prueba' } as Certificate;

      jest.spyOn(usersRepo, 'findOne').mockResolvedValue(usuario);
      jest.spyOn(certificatesRepo, 'create').mockReturnValue(certificado);
      jest.spyOn(certificatesRepo, 'save').mockResolvedValue(certificado);
      const notificar = jest.spyOn(notificationsService, 'create').mockResolvedValue(undefined);

      const resultado = await service.create({ user_id: '1', description: 'Certificado de Prueba' });

      expect(resultado).toEqual(certificado);
      expect(notificar).toHaveBeenCalled();
    });
  });

  describe('generateParticipationCertificate', () => {
    it('debe lanzar ForbiddenException si el usuario no participó', async () => {
      jest.spyOn(service, 'verifyUserParticipation').mockResolvedValue(false);

      await expect(service.generateParticipationCertificate('u1', 's1'))
        .rejects
        .toThrow(ForbiddenException);
    });

    it('debe lanzar NotFoundException si la acción social no existe', async () => {
      jest.spyOn(service, 'verifyUserParticipation').mockResolvedValue(true);
      jest.spyOn(socialActionsRepo, 'findOne').mockResolvedValue(null);

      await expect(service.generateParticipationCertificate('u1', 's1'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('debe crear y retornar el certificado si todo está correcto', async () => {
      const accion = { id: 's1', description: 'Siembra de árboles' } as SocialAction;
      const cert = { id: 'c1', description: 'Certificado de participación' } as Certificate;

      jest.spyOn(service, 'verifyUserParticipation').mockResolvedValue(true);
      jest.spyOn(socialActionsRepo, 'findOne').mockResolvedValue(accion);
      jest.spyOn(service, 'create').mockResolvedValue(cert);

      const resultado = await service.generateParticipationCertificate('u1', 's1');
      expect(resultado).toEqual(cert);
    });
  });
});
