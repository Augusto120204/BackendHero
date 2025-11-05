import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
