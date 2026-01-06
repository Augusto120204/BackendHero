import { Module } from '@nestjs/common';
import { EntrenadorController } from './entrenador.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
  imports: [ClienteModule],
  controllers: [EntrenadorController],
  providers: [UsuariosService, PrismaService],
})
export class EntrenadorModule {}

