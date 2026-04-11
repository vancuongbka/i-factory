import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
  CreateMachineDto,
  UpdateMachineDto,
  CreateSkillDto,
  UpdateSkillDto,
} from '@i-factory/api-types';
import { WorkCenterEntity } from './entities/work-center.entity';
import { MachineEntity } from './entities/machine.entity';
import { SkillEntity } from './entities/skill.entity';

@Injectable()
export class WorkCentersService {
  constructor(
    @InjectRepository(WorkCenterEntity)
    private readonly workCenterRepo: Repository<WorkCenterEntity>,
    @InjectRepository(MachineEntity)
    private readonly machineRepo: Repository<MachineEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillRepo: Repository<SkillEntity>,
  ) {}

  // ── Work Centers ────────────────────────────────────────────────────────────

  findAllWorkCenters(factoryId: string) {
    return this.workCenterRepo.find({
      where: { factoryId, isActive: true },
      relations: ['machines'],
      order: { code: 'ASC' },
    });
  }

  async findWorkCenterById(id: string, factoryId: string) {
    const entity = await this.workCenterRepo.findOne({
      where: { id, factoryId },
      relations: ['machines'],
    });
    if (!entity) throw new NotFoundException(`Work center ${id} not found`);
    return entity;
  }

  createWorkCenter(dto: CreateWorkCenterDto) {
    return this.workCenterRepo.save(this.workCenterRepo.create(dto));
  }

  async updateWorkCenter(id: string, factoryId: string, dto: UpdateWorkCenterDto) {
    const entity = await this.findWorkCenterById(id, factoryId);
    return this.workCenterRepo.save({ ...entity, ...dto });
  }

  async removeWorkCenter(id: string, factoryId: string) {
    await this.findWorkCenterById(id, factoryId);
    await this.workCenterRepo.softDelete({ id, factoryId });
  }

  // ── Machines ────────────────────────────────────────────────────────────────

  findAllMachines(workCenterId: string, factoryId: string) {
    return this.machineRepo.find({ where: { workCenterId, factoryId }, order: { code: 'ASC' } });
  }

  async findMachineById(id: string, factoryId: string) {
    const entity = await this.machineRepo.findOne({ where: { id, factoryId } });
    if (!entity) throw new NotFoundException(`Machine ${id} not found`);
    return entity;
  }

  createMachine(dto: CreateMachineDto) {
    return this.machineRepo.save(this.machineRepo.create(dto));
  }

  async updateMachine(id: string, factoryId: string, dto: UpdateMachineDto) {
    const entity = await this.findMachineById(id, factoryId);
    return this.machineRepo.save({ ...entity, ...dto });
  }

  async removeMachine(id: string, factoryId: string) {
    await this.findMachineById(id, factoryId);
    await this.machineRepo.softDelete({ id, factoryId });
  }

  // ── Skills ──────────────────────────────────────────────────────────────────

  findAllSkills(factoryId: string) {
    return this.skillRepo.find({ where: { factoryId, isActive: true }, order: { code: 'ASC' } });
  }

  async findSkillById(id: string, factoryId: string) {
    const entity = await this.skillRepo.findOne({ where: { id, factoryId } });
    if (!entity) throw new NotFoundException(`Skill ${id} not found`);
    return entity;
  }

  createSkill(dto: CreateSkillDto) {
    return this.skillRepo.save(this.skillRepo.create(dto));
  }

  async updateSkill(id: string, factoryId: string, dto: UpdateSkillDto) {
    const entity = await this.findSkillById(id, factoryId);
    return this.skillRepo.save({ ...entity, ...dto });
  }

  async removeSkill(id: string, factoryId: string) {
    await this.findSkillById(id, factoryId);
    await this.skillRepo.softDelete({ id, factoryId });
  }
}
