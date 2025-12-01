import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientePlanDto } from './dto/create-cliente-plan.dto';
import { UpdateClientePlanDto } from './dto/update-cliente-plan.dto';

@Injectable()
export class ClientePlanService {
    constructor(private prisma: PrismaService){}

    async create(dto: CreateClientePlanDto) {
    const hoy = new Date();
    const planVigente = await this.prisma.clientePlan.findFirst({
      where: {
        clienteId: dto.clienteId,
        activado: true,
        fechaFin: { gte: hoy },
      },
      orderBy: { fechaFin: 'desc' },
    });

    if (planVigente) {
      throw new BadRequestException('No se puede asignar un nuevo plan porque el plan actual aún no termina');
    }

    // 1. Marcar todas las deudas anteriores del cliente como solventadas
    // Esto asegura que cada plan empiece con "borrón y cuenta nueva"
    console.log(`[ClientePlan] Buscando deudas anteriores del cliente ${dto.clienteId}`);
    
    const deudasAnteriores = await this.prisma.deuda.findMany({
      where: {
        clientePlan: {
          clienteId: dto.clienteId,
        },
        solventada: false,
      },
    });

    if (deudasAnteriores.length > 0) {
      console.log(`[ClientePlan] Encontradas ${deudasAnteriores.length} deudas anteriores. Marcando como solventadas...`);
      
      await this.prisma.deuda.updateMany({
        where: {
          clientePlan: {
            clienteId: dto.clienteId,
          },
          solventada: false,
        },
        data: {
          solventada: true,
        },
      });
      
      console.log(`[ClientePlan] Deudas anteriores marcadas como solventadas`);
    } else {
      console.log(`[ClientePlan] No hay deudas anteriores para este cliente`);
    }

    // 2. Crear el nuevo plan
    return this.prisma.clientePlan.create({
      data: {
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        diaPago: dto.diaPago,
        activado: dto.activado,
        cliente: { connect: { id: dto.clienteId } },
        plan: { connect: { id: dto.planId } },
      },
    });
  }

    findAll(){
        return this.prisma.clientePlan.findMany({
          include: {
            cliente: {
              include: {
                usuario: { select: { nombres: true, apellidos: true } },
              },
            },
            plan: { select: { nombre: true } },
          },
        });
    }

    async findOne(id: number) {
      if (!id || isNaN(id)) {
        throw new Error('ID no válido');
      }
    
      return this.prisma.clientePlan.findUnique({
        where: {
          id: id,
        },
      });
    }
    
    

    async update(id: number, dto: UpdateClientePlanDto) {
        await this.findOne(id);
        return this.prisma.clientePlan.update({
          where: { id },
          data: {
            fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
            fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
            diaPago: dto.diaPago,
            activado: dto.activado,
            cliente: dto.clienteId ? { connect: { id: dto.clienteId } } : undefined,
            plan: dto.planId ? { connect: { id: dto.planId } } : undefined,
          },
        });
      }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.clientePlan.delete({ where: { id } });
      }

      async contarClientesActivos(): Promise<number> {
        const ahora = new Date();
    
        const clientes = await this.prisma.clientePlan.findMany({
          where: {
            activado: true,
            fechaFin: { gte: ahora }
          },
          select: {
            clienteId: true
          }
        });
    
        const idsUnicos = new Set(clientes.map(c => c.clienteId));
    
        return idsUnicos.size;
      }
      
  
      
}
