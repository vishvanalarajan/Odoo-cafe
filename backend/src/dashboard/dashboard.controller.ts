import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get()
  getStats() {
    return this.dashboard.getStats();
  }

  @Get('revenue-trend')
  getRevenueTrend(@Query('days') days = '7') {
    return this.dashboard.getRevenueTrend(parseInt(days));
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit = '10') {
    return this.dashboard.getTopProducts(parseInt(limit));
  }

  @Get('category-sales')
  getCategorySales() {
    return this.dashboard.getCategorySales();
  }

  @Get('payment-breakdown')
  getPaymentBreakdown() {
    return this.dashboard.getPaymentBreakdown();
  }
}
