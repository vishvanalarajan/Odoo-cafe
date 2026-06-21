import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subDays, startOfDay, format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalOrders, paidOrders, products, customers] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.findMany({
        where: { status: 'PAID' },
        select: { total: true },
      }),
      this.prisma.product.count(),
      this.prisma.customer.count(),
    ]);

    const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
    const avgOrderValue = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

    return { totalOrders, revenue, avgOrderValue, totalProducts: products, totalCustomers: customers };
  }

  async getRevenueTrend(days = 7) {
    const start = startOfDay(subDays(new Date(), days - 1));
    const orders = await this.prisma.order.findMany({
      where: { status: 'PAID', createdAt: { gte: start } },
      select: { total: true, createdAt: true },
    });

    const map: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = format(subDays(new Date(), days - 1 - i), 'MMM dd');
      map[d] = 0;
    }
    for (const o of orders) {
      const d = format(o.createdAt, 'MMM dd');
      if (map[d] !== undefined) map[d] += o.total;
    }

    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  }

  async getTopProducts(limit = 10) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    return Promise.all(
      items.map(async (i) => {
        const product = await this.prisma.product.findUnique({
          where: { id: i.productId },
          select: { name: true, price: true },
        });
        return { ...product, quantity: i._sum.quantity };
      }),
    );
  }

  async getCategorySales() {
    const items = await this.prisma.orderItem.findMany({
      include: { product: { include: { category: true } } },
    });

    const map: Record<string, { name: string; color: string; sales: number }> = {};
    for (const item of items) {
      const catId = item.product.categoryId;
      if (!map[catId]) {
        map[catId] = {
          name: item.product.category.name,
          color: item.product.category.color,
          sales: 0,
        };
      }
      map[catId].sales += item.price * item.quantity;
    }

    return Object.values(map);
  }

  async getPaymentBreakdown() {
    const payments = await this.prisma.payment.groupBy({
      by: ['method'],
      _sum: { amount: true },
      _count: true,
    });

    return payments.map((p) => ({
      method: p.method,
      total: p._sum.amount,
      count: p._count,
    }));
  }
}
