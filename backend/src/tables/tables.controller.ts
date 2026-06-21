import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Tables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tables')
export class TablesController {
  constructor(private tables: TablesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateTableDto) {
    return this.tables.create(dto);
  }

  @Get()
  findAll(@Query('floorId') floorId?: string) {
    return this.tables.findAll(floorId);
  }

  @Get('by-token/:token')
  findByToken(@Param('token') token: string) {
    return this.tables.findByToken(token);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tables.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.CASHIER)
  update(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return this.tables.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.tables.remove(id);
  }
}
