import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';

import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@Controller('cliente')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  create(@Body() dto: CreateClienteDto) {
    return this.clienteService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPCIONISTA, Role.ENTRENADOR)
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    try {
      const startTime = Date.now();
      const result = await this.clienteService.findAll(
        pageNumber,
        limitNumber,
        search,
      );
      const duration = Date.now() - startTime;
      console.log(
        `[Clientes] findAll completado en ${duration}ms - Página: ${pageNumber}, Límite: ${limitNumber}, Búsqueda: "${search}"`,
      );
      return result;
    } catch (error) {
      console.error('[Clientes] Error en findAll:', error);
      throw error;
    }
  }

  @Get('recientes')
  @Roles(Role.ADMIN, Role.RECEPCIONISTA, Role.ENTRENADOR)
  findRecientes(@Query('limit') limit = '10') {
    return this.clienteService.findRecientes(Number(limit) || 10);
  }

  // Endpoint para que los clientes accedan a su propia información
  @Get('mi-perfil')
  @Roles(Role.CLIENTE)
  async getMiPerfil(@Request() req) {
    // El usuarioId viene del JWT token
    const usuarioId = req.user.sub;
    return this.clienteService.findByUsuarioId(usuarioId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPCIONISTA, Role.ENTRENADOR)
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  update(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.clienteService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.clienteService.remove(+id);
  }
}
