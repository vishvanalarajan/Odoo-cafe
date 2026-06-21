import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private coupons: CouponsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCouponDto) {
    return this.coupons.create(dto);
  }

  @Get()
  findAll() {
    return this.coupons.findAll();
  }

  @Get('validate/:code')
  validate(@Param('code') code: string) {
    return this.coupons.validate(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coupons.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateCouponDto>) {
    return this.coupons.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.coupons.remove(id);
  }
}
