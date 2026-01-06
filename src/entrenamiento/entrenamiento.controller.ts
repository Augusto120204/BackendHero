import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EntrenamientoService } from './entrenamiento.service';
import { CreateEntrenamientoDto } from './dto/create-entrenamiento.dto';
import { UpdateEntrenamientoDto } from './dto/update-entrenamiento.dto';

@Controller('entrenamiento')
export class EntrenamientoController {
  constructor(private readonly entrenamientoService: EntrenamientoService) {}

  @Post()
  create(@Body() createEntrenamientoDto: CreateEntrenamientoDto) {
    return this.entrenamientoService.create(createEntrenamientoDto);
  }

  @Get()
  findAll() {
    return this.entrenamientoService.findAll();
  }

  @Get('rutina/:rutinaId')
  findByRutina(@Param('rutinaId') rutinaId: string) {
    return this.entrenamientoService.findByRutina(+rutinaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entrenamientoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEntrenamientoDto: UpdateEntrenamientoDto,
  ) {
    return this.entrenamientoService.update(+id, updateEntrenamientoDto);
  }

  @Patch('finalizar/rutina/:rutinaId')
  finalizarPorRutina(@Param('rutinaId') rutinaId: string) {
    return this.entrenamientoService.finalizarPorRutina(+rutinaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entrenamientoService.remove(+id);
  }
}
