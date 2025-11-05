import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';

@Injectable()
export class GastoService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateGastoDto, usuarioId: number) {
    return this.prisma.gasto.create({
      data: {
        descripcion: dto.descripcion,
        monto: dto.monto,
        usuarioId,
      },
    });
  }

  findAll(){
    return this.prisma.gasto.findMany();
  }

  async findOne(id: number){
    const gasto = await this.prisma.gasto.findUnique({ where: { id}});
    if(!gasto) throw new NotFoundException('Gasto no encontrado');
  }

  async update(id: number, dto: UpdateGastoDto){
    await this.findOne(id);
    return this.prisma.gasto.update({ where: { id }, data: dto});
  }

  async remove(id: number){
    await this.findOne(id);
    return this.prisma.gasto.delete({ where: { id }});
  }
}
