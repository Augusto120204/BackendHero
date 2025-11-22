import { Controller, Get } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';

@Controller('recepcionistas')
export class RecepcionistaController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.findByRol('recepcionista');
  }

  @Get('count')
  conteo() {
    return this.usuariosService.counts().then(c => ({ total: c.recepcionistas }));
  }
}

