import { Module } from '@nestjs/common';
import { AdministradorController } from './administrador.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AdministradorController],
  providers: [UsuariosService, PrismaService],
})
export class AdministradorModule {}

