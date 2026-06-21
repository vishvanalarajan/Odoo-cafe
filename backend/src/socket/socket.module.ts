import { Module } from '@nestjs/common';
import { PosGateway } from './socket.gateway';

@Module({
  providers: [PosGateway],
  exports: [PosGateway],
})
export class SocketModule {}
