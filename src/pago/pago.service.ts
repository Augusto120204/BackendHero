import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Injectable()
export class PagoService {
    constructor(private prisma: PrismaService){}

    async create(dto: CreatePagoDto) {
        // 1. Obtener ClientePlan con el plan asociado para conocer el precio
        const clientePlan = await this.prisma.clientePlan.findUnique({
          where: { id: dto.clientePlanId },
          include: { 
            plan: true,
            pago: true, // Obtener todos los pagos previos
          },
        });
    
        if (!clientePlan) {
          throw new NotFoundException('ClientePlan no encontrado');
        }
    
        const precioPlan = Number(clientePlan.plan.precio);
        const montoPagado = Number(dto.monto);
    
        // 2. Calcular el total pagado hasta ahora (incluyendo este pago)
        const totalPagadoAntes = clientePlan.pago.reduce((sum, pago) => sum + Number(pago.monto), 0);
        const totalPagadoDespues = totalPagadoAntes + montoPagado;
    
        console.log(`[Pago] Precio del plan: $${precioPlan}`);
        console.log(`[Pago] Total pagado antes: $${totalPagadoAntes}`);
        console.log(`[Pago] Monto de este pago: $${montoPagado}`);
        console.log(`[Pago] Total pagado después: $${totalPagadoDespues}`);
    
        // 3. Crear el pago
        const pago = await this.prisma.pago.create({
          data: {
            monto: montoPagado,
            fecha: new Date(dto.fecha),
            clientePlan: { connect: { id: dto.clientePlanId } },
          },
        });
    
        // 4. Eliminar todas las deudas anteriores no solventadas de este plan
        console.log(`[Pago] Buscando deudas para clientePlanId: ${dto.clientePlanId}`);
        
        const deudasAEliminar = await this.prisma.deuda.findMany({
          where: {
            clientePlanId: dto.clientePlanId,
            solventada: false,
          },
        });
        
        console.log(`[Pago] Deudas encontradas para eliminar:`, deudasAEliminar.map(d => ({ id: d.id, monto: d.monto })));
        
        const deleteResult = await this.prisma.deuda.deleteMany({
          where: {
            clientePlanId: dto.clientePlanId,
            solventada: false,
          },
        });
        console.log(`[Pago] Deudas eliminadas: ${deleteResult.count}`);
    
        // 5. Si el total pagado es menor al precio del plan, crear nueva deuda con el saldo restante
        if (totalPagadoDespues < precioPlan) {
          const montoDeuda = precioPlan - totalPagadoDespues;
          
          console.log(`[Pago] Creando nueva deuda: $${montoDeuda}`);
          
          await this.prisma.deuda.create({
            data: {
              clientePlanId: dto.clientePlanId,
              monto: montoDeuda,
              solventada: false,
            },
          });
        } else {
          console.log(`[Pago] Plan completamente pagado. Total: $${totalPagadoDespues}`);
        }
    
        return pago;
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
