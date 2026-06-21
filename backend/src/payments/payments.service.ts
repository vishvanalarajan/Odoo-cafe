import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PosGateway } from '../socket/socket.gateway';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private gateway: PosGateway,
  ) {}

  async create(dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { table: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.PAID) throw new BadRequestException('Order already paid');

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        method: dto.method,
        amount: dto.amount,
        status: 'COMPLETED',
        transactionReference: dto.transactionReference,
      },
    });

    // Mark order as paid and free the table
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: OrderStatus.PAID },
    });

    if (order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    const fullOrder = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: { include: { product: true } }, table: true, customer: true, payment: true },
    });

    this.gateway.emit('payment.completed', fullOrder);
    return { payment, order: fullOrder };
  }

  findOne(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } });
  }
}
