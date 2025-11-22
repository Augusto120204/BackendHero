import { Module } from '@nestjs/common';
import { EntrenadorController } from './entrenador.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EntrenadorController],
  providers: [UsuariosService, PrismaService],
})
export class EntrenadorModule {}

