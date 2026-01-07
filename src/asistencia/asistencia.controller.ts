<<<<<<< HEAD
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
=======
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
>>>>>>> f4c8f7a667d26b5932ed43786374cafb6b9aee78

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

<<<<<<< HEAD
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
=======
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
>>>>>>> f4c8f7a667d26b5932ed43786374cafb6b9aee78
  }
}
