import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async validateCredentials(username: string, _password: string): Promise<UserEntity | null> {
    // TODO: implement bcrypt password check
    const user = await this.repo.findOne({ where: { username, isActive: true } });
    return user;
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  findAll() {
    return this.repo.find({ where: { isActive: true } });
  }
}
