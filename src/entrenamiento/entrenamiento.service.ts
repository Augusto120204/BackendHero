import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEntrenamientoDto } from './dto/create-entrenamiento.dto';
import { UpdateEntrenamientoDto } from './dto/update-entrenamiento.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntrenamientoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEntrenamientoDto) {
    // Verificar que el entrenamiento existe
    const entrenamiento = await this.prisma.entrenamiento.findUnique({
      where: { rutinaId: dto.rutinaId },
    });

    if (!entrenamiento) {
      throw new NotFoundException(
        'No existe un entrenamiento para esta rutina. Primero crea la rutina.',
      );
    }

    // Agregar las semanas al entrenamiento existente
    await Promise.all(
      dto.semanas.map(async (semanaDto) => {
        await this.prisma.semana.create({
          data: {
            numero: semanaDto.numero,
            entrenamientoId: entrenamiento.id,
            musculosSemana: {
              create: await Promise.all(
                semanaDto.musculos.map(async (musculoDto) => {
                  // UPSERT del músculo
                  const musculo = await this.prisma.musculo.upsert({
                    where: { nombre: musculoDto.musculo },
                    update: {},
                    create: { nombre: musculoDto.musculo },
                  });

                  return {
                    orden: musculoDto.orden,
                    musculoId: musculo.id,
                    ejerciciosMusculo: {
                      create: await Promise.all(
                        musculoDto.ejercicios.map(async (ejercicioDto) => {
                          // UPSERT del ejercicio
                          const ejercicio = await this.prisma.ejercicio.upsert({
                            where: {
                              nombre: ejercicioDto.ejercicio.nombre,
                            },
                            update: {},
                            create: {
                              nombre: ejercicioDto.ejercicio.nombre,
                            },
                          });

                          return {
                            orden: ejercicioDto.orden,
                            ejercicioId: ejercicio.id,
                            seriesReps: ejercicioDto.seriesReps
                              ? {
                                  create: ejercicioDto.seriesReps.map(
                                    (serie) => ({
                                      orden: serie.orden,
                                      peso: serie.peso,
                                      repeticiones: serie.repeticiones,
                                      unidadMedida: serie.unidadMedida,
                                    }),
                                  ),
                                }
                              : undefined,
                            seriesTiempos: ejercicioDto.seriesTiempos
                              ? {
                                  create: ejercicioDto.seriesTiempos.map(
                                    (serie) => ({
                                      orden: serie.orden,
                                      peso: serie.peso,
                                      tiempo: serie.tiempo,
                                      unidadMedida: serie.unidadMedida,
                                    }),
                                  ),
                                }
                              : undefined,
                          };
                        }),
                      ),
                    },
                  };
                }),
              ),
            },
          },
        });
      }),
    );

    // Retornar el entrenamiento actualizado con todas las semanas
    return this.findOne(entrenamiento.id);
  }

  async findAll() {
    return this.prisma.entrenamiento.findMany({
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
    });
  }

  async findOne(id: number) {
    const entrenamiento = await this.prisma.entrenamiento.findUnique({
      where: { id },
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
    });

    if (!entrenamiento) {
      throw new NotFoundException('Entrenamiento no encontrado');
    }

    return entrenamiento;
  }

  async findByRutina(rutinaId: number) {
    const entrenamiento = await this.prisma.entrenamiento.findUnique({
      where: { rutinaId },
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
    });

    if (!entrenamiento) {
      throw new NotFoundException(
        'Entrenamiento no encontrado para esta rutina',
      );
    }

    return entrenamiento;
  }

  async update(id: number, dto: UpdateEntrenamientoDto) {
    await this.findOne(id);

    return this.prisma.entrenamiento.update({
      where: { id },
      data: {
        finalizado: dto.finalizado,
      },
    });
  }

  async finalizarPorRutina(rutinaId: number) {
    // Buscar el entrenamiento sin finalizar de esta rutina
    const entrenamiento = await this.prisma.entrenamiento.findUnique({
      where: { rutinaId },
    });

    if (!entrenamiento) {
      throw new NotFoundException(
        'No existe un entrenamiento para esta rutina',
      );
    }

    if (entrenamiento.finalizado) {
      throw new NotFoundException(
        'El entrenamiento de esta rutina ya está finalizado',
      );
    }

    // Marcar como finalizado
    return this.prisma.entrenamiento.update({
      where: { id: entrenamiento.id },
      data: {
        finalizado: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.entrenamiento.delete({
      where: { id },
    });
  }
}
