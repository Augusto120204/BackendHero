import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';

@Injectable()
export class CompraService {
  constructor(private prisma: PrismaService) {}

  async create(createCompraDto: CreateCompraDto) {
    const { clienteId, detalles } = createCompraDto;

    // Validate stock first
    for (const detalle of detalles) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: detalle.productoId },
      });

      if (!producto) {
        throw new BadRequestException(`Producto con ID ${detalle.productoId} no encontrado`);
      }

      if (producto.stock < detalle.cantidad) {
        throw new BadRequestException(`Stock insuficiente para el producto ${producto.nombre}`);
      }
    }

    // Execute transaction
    return this.prisma.$transaction(async (prisma) => {
      const compras: any[] = [];

      for (const detalle of detalles) {
        const producto = await prisma.producto.findUnique({
          where: { id: detalle.productoId },
        });

        if (!producto) {
            throw new BadRequestException(`Producto con ID ${detalle.productoId} no encontrado`);
        }

        // Decrement stock
        await prisma.producto.update({
          where: { id: detalle.productoId },
          data: { stock: producto.stock - detalle.cantidad },
        });

        // Create Compra record
        const compra = await prisma.compra.create({
          data: {
            clienteId,
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            total: producto.precio * detalle.cantidad,
            fecha: new Date(),
          },
        });
        compras.push(compra);
      }

      return compras;
    });
  }
}
