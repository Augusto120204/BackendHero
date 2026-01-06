import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRutinaDto } from './dto/create-rutina.dto';
import { UpdateRutinaDto } from './dto/update-rutina.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RutinaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRutinaDto) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 1. Extraer el base64 puro. Asumimos que el prefijo siempre está.
    // Busca la coma (,) y toma la parte siguiente.
    let base64Content = dto.rutina;

    // Si la cadena contiene una coma (es decir, viene con el prefijo Data URL: data:image/jpeg;base64,...), la eliminamos.
    if (base64Content.includes(',')) {
      base64Content = base64Content.split(',')[1];
    }

    // 2. Convertir el string base64 puro a Buffer para almacenar como Bytes
    // Si base64Content es undefined o nulo, esto podría fallar, se debe validar.
    if (!base64Content) {
      throw new Error('Formato de imagen base64 incorrecto.');
    }
    const rutinaBuffer = Buffer.from(base64Content, 'base64');

    const response = await this.prisma.rutina.create({
      data: {
        clienteId: dto.clienteId,
        rutina: rutinaBuffer,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        observacion: dto.observacion || '',
      },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
    });

    await this.prisma.entrenamiento.create({
      data: {
        rutinaId: response.id,
        finalizado: false,
      },
    });

    return response;
  }

  async findAll() {
    return this.prisma.rutina.findMany({
      select: {
        id: true,
        clienteId: true,
        fechaInicio: true,
        fechaFin: true,
        observacion: true,
      },
      orderBy: {
        fechaInicio: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const rutina = await this.prisma.rutina.findUnique({
      where: { id },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
        entrenamiento: {
          include: {
            semanas: {
              orderBy: { numero: 'asc' },
              include: {
                musculosSemana: {
                  orderBy: { orden: 'asc' },
                  include: {
                    musculo: true,
                    ejerciciosMusculo: {
                      orderBy: { orden: 'asc' },
                      include: {
                        ejercicio: true,
                        seriesReps: {
                          orderBy: { orden: 'asc' },
                        },
                        seriesTiempos: {
                          orderBy: { orden: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!rutina) {
      throw new NotFoundException('Rutina no encontrada');
    }

    // Convertir el Buffer a base64 (contenido puro)
    const base64Pure = Buffer.from(rutina.rutina).toString('base64');

    // **Re-ensamblar la cadena Data URL con el prefijo correcto**
    // Asumiendo que sabes el tipo de archivo (e.g., image/jpeg)
    const dataURL = `data:image/jpeg;base64,${base64Pure}`;

    return {
      ...rutina,
      rutina: dataURL, // Esto es lo que envías al cliente
    };
  }

  async findByCliente(clienteId: number) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.prisma.rutina.findMany({
      where: { clienteId },
      select: {
        id: true,
        clienteId: true,
        fechaInicio: true,
        fechaFin: true,
        observacion: true,
        entrenamiento: true,
      },
      orderBy: {
        fechaInicio: 'desc',
      },
    });
  }

  async update(id: number, dto: UpdateRutinaDto) {
    await this.findOne(id);

    const updateData: {
      rutina?: Buffer;
      fechaInicio?: Date;
      fechaFin?: Date;
      observacion?: string;
    } = {};

    if (dto.rutina) {
      updateData.rutina = Buffer.from(dto.rutina, 'base64');
    }
    if (dto.fechaInicio) {
      updateData.fechaInicio = new Date(dto.fechaInicio);
    }
    if (dto.fechaFin) {
      updateData.fechaFin = new Date(dto.fechaFin);
    }
    if (dto.observacion !== undefined) {
      updateData.observacion = dto.observacion;
    }

    return this.prisma.rutina.update({
      where: { id },
      data: updateData,
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.rutina.delete({
      where: { id },
    });
  }
}
