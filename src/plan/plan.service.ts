import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
    constructor(private prisma: PrismaService){}

    create(dto: CreatePlanDto){
        return this.prisma.plan.create({ data: dto});
    }

    async findAll(page: number = 1, limit: number = 10){
        const skip = (page - 1) * limit;
        
        const [data, total] = await Promise.all([
            this.prisma.plan.findMany({
                skip,
                take: limit,
                orderBy: { id: 'desc' }
            }),
            this.prisma.plan.count()
        ]);

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: number){
        const plan = await this.prisma.plan.findUnique({ where: { id }});
        if(!plan) throw new NotFoundException('Plan no encontrado')
            return plan;
    }

    async update(id: number, dto: UpdatePlanDto ){
        await this.findOne(id);
        return this.prisma.plan.update({ where: {id}, data: dto})
    }

    async delete(id: number){
        await this.findOne(id);
        
        // Verificar si hay clientes con este plan
        const clientesConPlan = await this.prisma.clientePlan.count({
            where: { planId: id }
        });

        if (clientesConPlan > 0) {
            // Retornar información para que el frontend muestre la advertencia
            throw new BadRequestException({
                message: `Este plan tiene ${clientesConPlan} cliente(s) asignado(s)`,
                clientesAfectados: clientesConPlan,
                requiresConfirmation: true
            });
        }

        // Si no hay clientes, eliminar directamente
        return this.prisma.plan.delete({ where: { id}})
    }

    async deleteWithCascade(id: number){
        await this.findOne(id);
        
        // Eliminar todas las relaciones ClientePlan primero
        await this.prisma.clientePlan.deleteMany({
            where: { planId: id }
        });

        // Luego eliminar el plan
        return this.prisma.plan.delete({ where: { id}})
    }
}
