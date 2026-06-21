import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFloorDto } from './dto/create-floor.dto';

@Injectable()
export class FloorsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateFloorDto) {
    return this.prisma.floor.create({ data: dto });
  }

  findAll() {
    return this.prisma.floor.findMany({
      include: { tables: { orderBy: { tableNumber: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const floor = await this.prisma.floor.findUnique({
      where: { id },
      include: { tables: true },
    });
    if (!floor) throw new NotFoundException('Floor not found');
    return floor;
  }

  async update(id: string, dto: Partial<CreateFloorDto>) {
    await this.findOne(id);
    return this.prisma.floor.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.floor.delete({ where: { id } });
    return { message: 'Floor deleted' };
  }
}
