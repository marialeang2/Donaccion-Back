// src/modules/certificates/certificates.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../../entities/certificate.entity';
import { User } from '../../entities/user.entity';
import { SocialAction } from '../../entities/social_action.entity';
import { ParticipationRequest, RequestStatus } from '../../entities/participation_request.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificatesRepository: Repository<Certificate>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ParticipationRequest)
    private participationRequestsRepository: Repository<ParticipationRequest>,
    @InjectRepository(SocialAction)
    private socialActionsRepository: Repository<SocialAction>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createCertificateDto: CreateCertificateDto): Promise<Certificate> {
    // Verificar si el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createCertificateDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${createCertificateDto.user_id}" not found`);
    }

    // Crear y guardar el nuevo certificado
    const newCertificate = this.certificatesRepository.create({
      ...createCertificateDto,
      issue_date: new Date()
    });
    
    const savedCertificate = await this.certificatesRepository.save(newCertificate);

    // Notificar al usuario sobre el nuevo certificado
    await this.notificationsService.create({
      user_id: user.id,
      message: `You have received a new certificate: ${createCertificateDto.description}`,
    });

    return savedCertificate;
  }

  async findAll(): Promise<Certificate[]> {
    return this.certificatesRepository.find({
      relations: ['user'],
      order: { issue_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Certificate> {
    const certificate = await this.certificatesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID "${id}" not found`);
    }

    return certificate;
  }

  async findByUser(userId: string): Promise<Certificate[]> {
    return this.certificatesRepository.find({
      where: { user_id: userId },
      order: { issue_date: 'DESC' },
    });
  }

  async update(id: string, updateCertificateDto: UpdateCertificateDto): Promise<Certificate> {
    const certificate = await this.findOne(id);
    
    // Actualizar el certificado
    await this.certificatesRepository.update(id, updateCertificateDto);
    
    // Devolver el certificado actualizado
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.certificatesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Certificate with ID "${id}" not found`);
    }
  }

  // Método para verificar si un usuario ha participado en una acción social
  async verifyUserParticipation(userId: string, socialActionId: string): Promise<boolean> {
    const participationRequest = await this.participationRequestsRepository.findOne({
      where: {
        user_id: userId,
        social_action_id: socialActionId,
        status: RequestStatus.ACCEPTED
      }
    });
    
    return !!participationRequest;
  }

  // Método para generar un certificado de participación para una acción social
  async generateParticipationCertificate(userId: string, socialActionId: string): Promise<Certificate> {
    // Verificar que el usuario ha participado en la acción social
    const hasParticipated = await this.verifyUserParticipation(userId, socialActionId);
    
    if (!hasParticipated) {
      throw new ForbiddenException('User has not participated in this social action');
    }
    
    // Obtener detalles de la acción social
    const socialAction = await this.socialActionsRepository.findOne({
      where: { id: socialActionId }
    });
    
    if (!socialAction) {
      throw new NotFoundException(`Social Action with ID "${socialActionId}" not found`);
    }
    
    // Crear el certificado
    const description = `Certificate of participation in social action: ${socialAction.description}`;
    
    return this.create({
      user_id: userId,
      description
    });
  }
}