import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Floors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('floors')
export class FloorsController {
  constructor(private floors: FloorsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateFloorDto) {
    return this.floors.create(dto);
  }

  @Get()
  findAll() {
    return this.floors.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.floors.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateFloorDto>) {
    return this.floors.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.floors.remove(id);
  }
}
