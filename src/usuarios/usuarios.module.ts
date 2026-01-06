import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
  imports: [ClienteModule], // Importar para usar ClienteService
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
