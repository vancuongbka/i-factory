import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto } from '@i-factory/api-types';
import { UserEntity } from './entities/user.entity';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async validateCredentials(username: string, password: string): Promise<UserEntity | null> {
    const user = await this.repo.findOne({
      where: { username, isActive: true },
      select: ['id', 'username', 'email', 'fullName', 'role', 'allowedFactories', 'isActive', 'passwordHash'],
    });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const exists = await this.repo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (exists) throw new ConflictException('Username or email already in use');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const entity = this.repo.create({
      username: dto.username,
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role,
      allowedFactories: dto.allowedFactories ?? [],
      passwordHash,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.repo.softDelete(user.id);
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.repo.findOne({
      where: { id },
      select: ['id', 'passwordHash'],
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.repo.save(user);
  }
}
