import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AsistenciaController],
  providers: [AsistenciaService, PrismaService],
=======
import { AsistenciaController } from './asistencia.controller';
import { AsistenciaService } from './asistencia.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
>>>>>>> f4c8f7a667d26b5932ed43786374cafb6b9aee78
  exports: [AsistenciaService],
})
export class AsistenciaModule {}
