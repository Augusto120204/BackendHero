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
            select: {
              id: true,
              fechaInicio: true,
              fechaFin: true,
              plan: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      }),
    ]);

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
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Borrado en cascada manual de entidades asociadas más comunes
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

      // Nota: Si existen rutinas y su árbol asociado, se deberían eliminar en orden.
      // Por simplicidad y porque aún no se usan en la UI de clientes/pagos, omitimos aquí.

      await tx.cliente.delete({ where: { id } });
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
