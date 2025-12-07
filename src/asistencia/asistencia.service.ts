import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AsistenciaService {
  constructor(private prisma: PrismaService) {}

  async marcarAsistencia(usuarioId: number) {
    // Buscar el cliente relacionado con este usuario
    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId },
      include: {
        planes: {
          where: { activado: true },
          include: { plan: true },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(
        'No existe un cliente con este ID de usuario',
      );
    }

    // Verificar que el cliente tenga al menos un plan activo
    if (!cliente.planes || cliente.planes.length === 0) {
      throw new BadRequestException(
        'El cliente no tiene ningún plan activo. No se puede marcar asistencia',
      );
    }

    // Verificar que al menos un plan esté dentro de las fechas válidas
    const fechaActual = new Date();
    const tieneplanVigente = cliente.planes.some(
      (clientePlan) =>
        clientePlan.activado &&
        new Date(clientePlan.fechaInicio) <= fechaActual &&
        new Date(clientePlan.fechaFin) >= fechaActual,
    );

    if (!tieneplanVigente) {
      throw new BadRequestException(
        'El cliente no tiene ningún plan vigente. No se puede marcar asistencia',
      );
    }

    // Crear la asistencia
    return this.prisma.asistencia.create({
      data: {
        clienteId: cliente.id,
        fecha: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.asistencia.findMany({
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
                cedula: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findByCliente(clienteId: number) {
    return this.prisma.asistencia.findMany({
      where: { clienteId },
      orderBy: { fecha: 'desc' },
    });
  }
}
