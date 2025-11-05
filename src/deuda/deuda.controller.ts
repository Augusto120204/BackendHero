import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DeudaService } from './deuda.service';
import { CreateDeudaDto } from './dto/create-deuda.dto';
import { UpdateDeudaDto } from './dto/update-deuda.dto';

@Controller('deuda')
export class DeudaController {
  constructor(private readonly deudaService: DeudaService) {}

  @Post()
  create(@Body() dto: CreateDeudaDto) {
    return this.deudaService.create(dto);
  }

  @Get()
  findAll() {
    return this.deudaService.findAll();
  }

  @Get('deudores')
  deudoresList(){
    return this.deudaService.getDeudoresUnicos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deudaService.findOne(+id);
  }


  @Get('deudores/count')
  deudoresCount(){
    return this.deudaService.countDeudoresUnicos();
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeudaDto) {
    return this.deudaService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deudaService.remove(+id);
  }
}