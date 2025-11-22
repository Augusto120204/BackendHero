import { Controller, Get } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';

@Controller('administradores')
export class AdministradorController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.findByRol('administrador');
  }

  @Get('count')
  conteo() {
    return this.usuariosService.counts().then(c => ({ total: c.administradores }));
  }
}

