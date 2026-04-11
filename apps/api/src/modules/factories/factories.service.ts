import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FactoryEntity } from './entities/factory.entity';

@Injectable()
export class FactoriesService {
  constructor(
    @InjectRepository(FactoryEntity)
    private readonly repo: Repository<FactoryEntity>,
  ) {}

  findAll() {
    return this.repo.find({ where: { isActive: true } });
  }

  findById(id: string) {
    return this.repo.findOneOrFail({ where: { id } });
  }
}
