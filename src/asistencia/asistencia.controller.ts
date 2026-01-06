import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Post()
  marcarAsistencia(@Body() marcarAsistenciaDto: MarcarAsistenciaDto) {
    return this.asistenciaService.marcarAsistencia(
      marcarAsistenciaDto.usuarioId,
    );
  }

  @Get()
  findAll() {
    return this.asistenciaService.findAll();
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.asistenciaService.findByCliente(clienteId);
  }
}
