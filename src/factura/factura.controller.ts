import { FacturaService } from './factura.service';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

@Controller('facturas')
export class FacturaController {
    constructor(
        private facturaService: FacturaService
    ){}

    @Get()
findAll(
  @Query('estado') estado?: string,
  @Query('clienteId') clienteId?: string,
  @Query('cedula') cedula?: string,
  @Query('desde') desde?: string,
  @Query('hasta') hasta?: string,
) {
  return this.facturaService.findAll({
    estado,
    clienteId: clienteId ? Number(clienteId) : undefined,
    cedula,
    desde,
    hasta,
  });
}

    @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturaService.findOne(id);
  }

}
