import { Module } from '@nestjs/common';
import { ClientePlanController } from './cliente-plan.controller';
import { ClientePlanService } from './cliente-plan.service';

@Module({
  controllers: [ClientePlanController],
  providers: [ClientePlanService]
})
export class ClientePlanModule {}
