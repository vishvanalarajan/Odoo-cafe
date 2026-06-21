import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { FloorsModule } from './floors/floors.module';
import { TablesModule } from './tables/tables.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CustomersModule } from './customers/customers.module';
import { CouponsModule } from './coupons/coupons.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SocketModule } from './socket/socket.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    FloorsModule,
    TablesModule,
    OrdersModule,
    PaymentsModule,
    CustomersModule,
    CouponsModule,
    DashboardModule,
    SocketModule,
    UploadsModule,
  ],
})
export class AppModule {}
