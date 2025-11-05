import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeudaDto } from './dto/create-deuda.dto';
import { UpdateDeudaDto } from './dto/update-deuda.dto';

@Injectable()
export class DeudaService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDeudaDto) {
    return this.prisma.deuda.create({ data: dto });
  }

  findAll() {
    return this.prisma.deuda.findMany();
  }

  async findOne(id: number) {
    const deuda = await this.prisma.deuda.findUnique({ where: { id } });
    if (!deuda) throw new NotFoundException('Deuda no encontrada');
    return deuda;
  }

  async update(id: number, dto: UpdateDeudaDto) {
    await this.findOne(id);
    return this.prisma.deuda.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.deuda.delete({ where: { id } });
  }

  async countDeudoresUnicos(){
    const total = await this.prisma.cliente.count({
      where: {
        planes: {
          some: {
            deudas: {
              some: { solventada: false }
            }
          }
        }
      }
    });
    return { total};
  }

  async getDeudoresUnicos(){
    return this.prisma.cliente.findMany({
      where: {
        planes: {
          some: {
            //activos: true, // opcional 
            deudas: { some: { solventada: false}},
          },
        },
      },
      select: {
        id: true,
        usuario: {
          select: {
            nombres: true,
            apellidos: true,
            cedula: true,
          },
        },
      },
    });
  }
}