import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
    constructor(private prisma: PrismaService){}

    create(dto: CreatePlanDto){
        return this.prisma.plan.create({ data: dto});
    }

    findAll(){
        return this.prisma.plan.findMany();
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
        return this.prisma.plan.delete({ where: { id}})
    }
}
