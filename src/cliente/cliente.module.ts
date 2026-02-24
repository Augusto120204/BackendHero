import { Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [ClienteService], // Exportar para usar en otros módulos
})
export class ClienteModule {}
