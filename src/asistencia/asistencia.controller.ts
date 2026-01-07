import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  //Es un endpoint HTTP POST que recibe un ID de cliente desde la URL
  //y llama al servicio para registrar su asistencia.
  @Post('registrar/:clienteId')
  registrar(@Param('clienteId') clienteId: string) {
    return this.asistenciaService.registrarAsistencia(+clienteId);
  }

  @Get('historial/:clienteId')
  historial(@Param('clienteId') clienteId: string) {
    return this.asistenciaService.historial(+clienteId);
  }

  @Get()
  todas() {
    return this.asistenciaService.todas();
  }

  @Get('estadisticas/:clienteId')
  estadisticas(@Param('clienteId') clienteId: string) {
    return this.asistenciaService.getEstadisticasPorPlan(+clienteId);
  }
}
