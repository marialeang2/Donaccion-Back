import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suggestion } from '../../entities/suggestion.entity';
import { User } from '../../entities/user.entity';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectRepository(Suggestion)
    private suggestionsRepository: Repository<Suggestion>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createSuggestionDto: CreateSuggestionDto): Promise<Suggestion> {
    // Verificar si el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createSuggestionDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${createSuggestionDto.user_id}" not found`);
    }

    const newSuggestion = this.suggestionsRepository.create({
      ...createSuggestionDto,
      processed: createSuggestionDto.processed || false, // Valor por defecto
    });
    
    const savedSuggestion = await this.suggestionsRepository.save(newSuggestion);

    // Notificar al usuario sobre la recepción de su sugerencia
    await this.notificationsService.create({
      user_id: user.id,
      message: `Your suggestion has been received and will be reviewed soon.`,
    });

    return savedSuggestion;
  }

  async findAll(): Promise<Suggestion[]> {
    return this.suggestionsRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Suggestion> {
    const suggestion = await this.suggestionsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!suggestion) {
      throw new NotFoundException(`Suggestion with ID "${id}" not found`);
    }

    return suggestion;
  }

  async findByUser(userId: string): Promise<Suggestion[]> {
    return this.suggestionsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findUnprocessed(): Promise<Suggestion[]> {
    return this.suggestionsRepository.find({
      where: { processed: false },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async markAsProcessed(id: string): Promise<Suggestion> {
    const suggestion = await this.findOne(id);
    
    // Si la sugerencia no estaba procesada anteriormente, notificar al usuario
    if (!suggestion.processed) {
      await this.notificationsService.create({
        user_id: suggestion.user.id,
        message: `Your suggestion has been processed: "${suggestion.content.substring(0, 50)}${suggestion.content.length > 50 ? '...' : ''}"`,
      });
    }
    
    // Marcar como procesada
    await this.suggestionsRepository.update(id, { processed: true });
    
    // Devolver la sugerencia actualizada
    return this.findOne(id);
  }

  async update(id: string, updateSuggestionDto: UpdateSuggestionDto): Promise<Suggestion> {
    const suggestion = await this.findOne(id);
    
    // Si se está marcando como procesada, notificar al usuario
    if (updateSuggestionDto.processed === true && !suggestion.processed) {
      await this.notificationsService.create({
        user_id: suggestion.user.id,
        message: `Your suggestion has been processed: "${suggestion.content.substring(0, 50)}${suggestion.content.length > 50 ? '...' : ''}"`,
      });
    }
    
    // Actualizar la sugerencia
    await this.suggestionsRepository.update(id, updateSuggestionDto);
    
    // Devolver la sugerencia actualizada
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.suggestionsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Suggestion with ID "${id}" not found`);
    }
  }
}
