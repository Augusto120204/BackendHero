import { Module } from '@nestjs/common';
import { AdministradorController } from './administrador.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
  imports: [ClienteModule],
  controllers: [AdministradorController],
  providers: [UsuariosService, PrismaService],
})
export class AdministradorModule {}

