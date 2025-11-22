import { Module } from '@nestjs/common';
import { RecepcionistaController } from './recepcionista.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RecepcionistaController],
  providers: [UsuariosService, PrismaService],
})
export class RecepcionistaModule {}

