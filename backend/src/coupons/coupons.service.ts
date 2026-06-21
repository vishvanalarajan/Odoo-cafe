import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({ data: dto });
  }

  findAll() {
    return this.prisma.coupon.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Coupon not found');
    return c;
  }

  async validate(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code, active: true } });
    if (!coupon) throw new NotFoundException('Invalid or inactive coupon');
    return coupon;
  }

  async update(id: string, dto: Partial<CreateCouponDto>) {
    await this.findOne(id);
    return this.prisma.coupon.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted' };
  }
}
