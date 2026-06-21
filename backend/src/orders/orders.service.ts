import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PosGateway } from '../socket/socket.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private gateway: PosGateway,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const count = await this.prisma.order.count();
    return `ORD-${String(count + 1).padStart(6, '0')}`;
  }

  async create(dto: CreateOrderDto) {
    const orderNumber = await this.generateOrderNumber();

    // Calculate totals
    let subtotal = 0;
    let taxTotal = 0;

    const itemsWithPrices = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
        const linePrice = product.price * item.quantity;
        const lineTax = linePrice * (product.tax / 100);
        subtotal += linePrice;
        taxTotal += lineTax;
        return { ...item, price: product.price };
      }),
    );

    // Apply coupon
    let discount = 0;
    let couponId: string | undefined;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode, active: true },
      });
      if (!coupon) throw new BadRequestException('Invalid or inactive coupon');
      couponId = coupon.id;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = (subtotal * coupon.discountValue) / 100;
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
    }

    const total = subtotal + taxTotal - discount;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        tableId: dto.tableId,
        customerId: dto.customerId,
        couponId,
        subtotal,
        tax: taxTotal,
        discount,
        total,
        items: {
          create: itemsWithPrices.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: { items: { include: { product: true } }, table: true, customer: true },
    });

    this.gateway.emit('order.created', order);
    return order;
  }

  findAll(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        items: { include: { product: true } },
        table: { include: { floor: true } },
        customer: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        table: { include: { floor: true } },
        customer: true,
        payment: true,
        coupon: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderDto) {
    const order = await this.findOne(id);
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: { include: { product: true } },
        table: true,
        customer: true,
      },
    });

    // Update table status when order sent to kitchen
    if (dto.status === OrderStatus.TO_COOK && order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'OCCUPIED' },
      });
    }

    // Free table when paid
    if (dto.status === OrderStatus.PAID && order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    const eventMap: Record<string, string> = {
      TO_COOK: 'order.created',
      PREPARING: 'order.preparing',
      COMPLETED: 'order.completed',
      PAID: 'payment.completed',
    };

    if (eventMap[dto.status]) {
      this.gateway.emit(eventMap[dto.status], updated);
    }

    return updated;
  }

  async updateItemCompleted(orderId: string, itemId: string, completed: boolean) {
    await this.findOne(orderId);
    return this.prisma.orderItem.update({
      where: { id: itemId },
      data: { completed },
    });
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid order');
    }
    // Free table if it was occupied by this order
    if (order.tableId && order.status !== OrderStatus.DRAFT) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' },
      });
    }
    await this.prisma.order.delete({ where: { id } });
    return { message: 'Order deleted' };
  }
}
