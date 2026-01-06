import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: {
        id: dto.usuarioId, // El ID del cliente será el mismo que el del usuario
        usuarioId: dto.usuarioId,
        horario: dto.horario,
        sexo: dto.sexo,
        observaciones: dto.observaciones,
        objetivos: dto.objetivos,
        tiempoEntrenar: dto.tiempoEntrenar,
      },
    });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const take = Math.max(1, Math.min(limit, 50));
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * take;

    const trimmedSearch = search?.trim();
    const where: Prisma.ClienteWhereInput = trimmedSearch
      ? {
          OR: [
            {
              usuario: {
                nombres: { contains: trimmedSearch, mode: 'insensitive' },
              },
            },
            {
              usuario: {
                apellidos: { contains: trimmedSearch, mode: 'insensitive' },
              },
            },
            {
              usuario: {
                cedula: { contains: trimmedSearch, mode: 'insensitive' },
              },
            },
          ],
        }
      : {};

    // Ejecutamos count y fetch en paralelo para mejor rendimiento
    const [totalItems, clientes] = await Promise.all([
      this.prisma.cliente.count({ where }),
      this.prisma.cliente.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          horario: true,
          sexo: true,
          objetivos: true,
          tiempoEntrenar: true,
          observaciones: true,
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              cedula: true,
              fechaNacimiento: true,
            },
          },
          planes: {
            orderBy: { fechaFin: 'desc' },
            take: 1,
            select: {
              id: true,
              fechaInicio: true,
              fechaFin: true,
              plan: {
                select: {
                  nombre: true,
                },
              },
              deudas: {
                where: { solventada: false },
                select: {
                  id: true,
                  monto: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Debug: ver qué deudas se están devolviendo
    clientes.forEach(c => {
      if (c.planes?.[0]?.deudas?.length > 0) {
        console.log(`[ClienteService] Cliente ${c.usuario?.nombres} tiene deudas:`, 
          c.planes[0].deudas.map(d => ({ id: d.id, monto: d.monto }))
        );
      }
    });

    return {
      data: clientes,
      meta: {
        totalItems,
        itemCount: clientes.length,
        perPage: take,
        totalPages: Math.ceil(totalItems / take),
        currentPage,
      },
    };
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            cedula: true,
          },
        },
        planes: {
          orderBy: { fechaFin: 'desc' },
          take: 1,
          include: {
            plan: {
              select: {
                nombre: true,
                precio: true,
              },
            },
            deudas: {
              where: { solventada: false },
              select: {
                id: true,
                monto: true,
                solventada: true,
              },
            },
          },
        },
      },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async findByUsuarioId(usuarioId: number) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            cedula: true,
          },
        },
        planes: {
          orderBy: { fechaFin: 'desc' },
          take: 1,
          include: {
            plan: {
              select: {
                nombre: true,
                precio: true,
              },
            },
            deudas: {
              where: { solventada: false },
              select: {
                id: true,
                monto: true,
                solventada: true,
              },
            },
          },
        },
      },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado para este usuario');
    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
    console.log('Actualizar cliente', id, dto);
    await this.findOne(id);
    console.log('Cliente encontrado, procediendo a actualizar');
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      select: { usuarioId: true },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    await this.prisma.$transaction(async (tx) => {
      // ClientePlan dependencias: pagos y deudas
      const cps = await tx.clientePlan.findMany({
        where: { clienteId: id },
        select: { id: true },
      });
      const cpIds = cps.map((x) => x.id);
      if (cpIds.length) {
        await tx.pago.deleteMany({ where: { clientePlanId: { in: cpIds } } });
        await tx.deuda.deleteMany({ where: { clientePlanId: { in: cpIds } } });
      }
      await tx.clientePlan.deleteMany({ where: { clienteId: id } });

      // Otras dependencias directas
      await tx.compra.deleteMany({ where: { clienteId: id } });
      await tx.novedad.deleteMany({ where: { clienteId: id } });
      await tx.clienteMedida.deleteMany({ where: { clienteId: id } });

      // Rutinas y árbol asociado (entrenamiento -> semanas -> semanaEjercicio -> series)
      const rutinas = await tx.rutina.findMany({
        where: { clienteId: id },
        select: { id: true },
      });
      for (const rutina of rutinas) {
        const entrenamiento = await tx.entrenamiento.findUnique({
          where: { rutinaId: rutina.id },
        });
        if (entrenamiento) {
          const semanas = await tx.semana.findMany({
            where: { entrenamientoId: entrenamiento.id },
            select: { id: true },
          });
          for (const semana of semanas) {
            const semanaEjercicios = await tx.semanaEjercicio.findMany({
              where: { semanaId: semana.id },
              select: { id: true },
            });
            for (const se of semanaEjercicios) {
              await tx.serieRep.deleteMany({
                where: { semanaEjercicioId: se.id },
              });
              await tx.serieTiempo.deleteMany({
                where: { semanaEjercicioId: se.id },
              });
            }
            await tx.semanaEjercicio.deleteMany({ where: { semanaId: semana.id } });
          }
          await tx.semana.deleteMany({ where: { entrenamientoId: entrenamiento.id } });
          await tx.entrenamiento.delete({ where: { id: entrenamiento.id } });
        }
      }
      await tx.rutina.deleteMany({ where: { clienteId: id } });

      await tx.cliente.delete({ where: { id } });

      // Limpia gastos (si existieran) y finalmente elimina el usuario
      await tx.gasto.deleteMany({ where: { usuarioId: cliente.usuarioId } });
      await tx.usuario.delete({ where: { id: cliente.usuarioId } });
    });

    return { ok: true };
  }

  async findRecientes(limit = 10) {
    // Trae clientes más recientes por id (si no hay createdAt)
    const clientes = await this.prisma.cliente.findMany({
      orderBy: { id: 'desc' },
      take: limit,
      include: {
        usuario: {
          select: { nombres: true, apellidos: true, userName: true },
        },
        // Último plan del cliente
        planes: {
          orderBy: { fechaFin: 'desc' },
          take: 1,
          include: { plan: { select: { nombre: true } } },
        },
      },
    });
    // Mapea a la forma que necesita el frontend
    return clientes.map((c: any) => {
      const cp = c.planes?.[0];
      const planNombre = cp?.plan?.nombre ?? '—';
      // Estado calculado por fechaFin: activo si hoy <= fechaFin
      let estadoPlan = '—';
      if (cp?.fechaFin) {
        const ahora = new Date();
        const fin = new Date(cp.fechaFin);
        estadoPlan = fin >= ahora ? 'Activo' : 'Vencido';
      }
      // Usar fechaFin en el mapeo
      const fechaRegistro = cp?.fechaFin ?? null;
      return {
        usuario: c.usuario,
        planNombre,
        estadoPlan,
        fechaRegistro,
      };
    });
  }
}
