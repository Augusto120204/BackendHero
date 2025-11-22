import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
    constructor(private prisma: PrismaService){}

    create(dto: CreateProductoDto){
        return this.prisma.producto.create({ data: dto});
    }

    findAll(search?: string){
        return this.prisma.producto.findMany({
            where: search
                ? {
                    nombre: {
                        contains: search,
                        mode: 'insensitive',
                    },
                }
                : undefined,
            orderBy: { nombre: 'asc' },
        });
    }

    async findOne(id: number){
        const producto = await this.prisma.producto.findUnique({ where: { id}})
        if(!producto) throw new NotFoundException('Producto no encontrado');
        return producto;
    }

    async update(id: number, dto: UpdateProductoDto){
        await this.findOne(id);
        return this.prisma.producto.update({ where: { id}, data: dto});
    }

    async remove(id: number){
        await this.findOne(id);
        return this.prisma.producto.delete({ where: { id}})
    }
}
