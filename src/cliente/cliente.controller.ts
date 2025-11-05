
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('cliente')
export class ClienteController {
    constructor(private readonly clienteService: ClienteService){}

    @Post()
    create(@Body() dto: CreateClienteDto) {
      return this.clienteService.create(dto);
    }

    @Get()
    findAll() {
        return this.clienteService.findAll();
    }

    @Get('recientes')
    findRecientes(@Query('limit') limit = '10') {
        return this.clienteService.findRecientes(Number(limit) || 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.clienteService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateClienteDto){
        return this.clienteService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string){
        return this.clienteService.remove(+id);
    }


}
