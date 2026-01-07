import { Body, Controller, Post } from '@nestjs/common';
import { CompraService } from './compra.service';
import { CreateCompraDto } from './dto/create-compra.dto';

@Controller('compra')
export class CompraController {
  constructor(private readonly compraService: CompraService) {}

  @Post()
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.compraService.create(createCompraDto);
  }
}
