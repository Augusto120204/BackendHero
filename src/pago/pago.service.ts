import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Injectable()
export class PagoService {
    constructor(private prisma: PrismaService){}

    create(dto: CreatePagoDto) {
        return this.prisma.pago.create({
          data: {
            monto: dto.monto,
            fecha: new Date(dto.fecha),
            clientePlan: { connect: { id: dto.clientePlanId } },
          },
        });
      }

      async findAll() {
        return this.prisma.pago.findMany({
          orderBy: { id: 'asc' },
          include: {
            clientePlan: {
              include: {
                cliente: {
                  include: {
                    usuario: { select: { nombres: true, apellidos: true } },
                  },
                },
                plan: { select: { nombre: true } },
              },
            },
          },
        });
      }

      async findOne(id: number) {
        const pago = await this.prisma.pago.findUnique({ where: { id } });
        if (!pago) throw new NotFoundException('Pago no encontrado');
        return pago;
      }

      async update(id: number, dto: UpdatePagoDto) {
        await this.findOne(id);
        return this.prisma.pago.update({
          where: { id },
          data: {
            ...(dto.monto !== undefined && { monto: dto.monto }),
            ...(dto.fecha && { fecha: new Date(dto.fecha) }),
            ...(dto.clientePlanId !== undefined && {
              clientePlan: { connect: { id: dto.clientePlanId } },
            }),
          },
        });
      }

      async remove(id: number) {
        await this.findOne(id);
        return this.prisma.pago.delete({ where: { id } });
      }

      async obtenerIngresoDelMes(): Promise<number>{
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes  = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

        const resultado = await this.prisma.pago.aggregate({
          _sum: {
            monto: true,
          },
          where: {
            fecha: {
              gte: inicioMes,
              lte: finMes,
            }
          }
        });

        return resultado._sum.monto ?? 0;
      }

}
