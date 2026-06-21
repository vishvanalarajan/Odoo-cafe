import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTableDto) {
    return this.prisma.table.create({
      data: dto,
      include: { floor: true },
    });
  }

  findAll(floorId?: string) {
    return this.prisma.table.findMany({
      where: floorId ? { floorId } : undefined,
      include: { floor: true },
      orderBy: { tableNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: { floor: true },
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async findByToken(token: string) {
    const table = await this.prisma.table.findUnique({
      where: { qrToken: token },
      include: { floor: true },
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async update(id: string, dto: UpdateTableDto) {
    await this.findOne(id);
    return this.prisma.table.update({
      where: { id },
      data: dto,
      include: { floor: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.table.delete({ where: { id } });
    return { message: 'Table deleted' };
  }
}
