import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientePlanDto } from './dto/create-cliente-plan.dto';
import { UpdateClientePlanDto } from './dto/update-cliente-plan.dto';

@Injectable()
export class ClientePlanService {
    constructor(private prisma: PrismaService){}

    create(dto: CreateClientePlanDto) {
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
        return this.prisma.clientePlan.findMany();
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
