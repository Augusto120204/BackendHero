import { Controller, Get } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';

@Controller('entrenadores')
export class EntrenadorController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.findByRol('entrenador');
  }

  @Get('count')
  conteo() {
    return this.usuariosService.counts().then(c => ({ total: c.entrenadores }));
  }
}

