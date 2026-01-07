import { Module } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AsistenciaController],
  providers: [AsistenciaService, PrismaService],
  exports: [AsistenciaService],
})
export class AsistenciaModule {}
