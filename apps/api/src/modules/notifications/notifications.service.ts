import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async broadcast(factoryId: string, event: string, data: unknown) {
    this.gateway.emitToFactory(factoryId, event, data);
  }

  findForUser(userId: string, factoryId: string) {
    return this.repo.find({
      where: { userId, factoryId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
