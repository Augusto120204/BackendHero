import { Module } from '@nestjs/common';
import { RecepcionistaController } from './recepcionista.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
  imports: [ClienteModule],
  controllers: [RecepcionistaController],
  providers: [UsuariosService, PrismaService],
})
export class RecepcionistaModule {}

