import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ClienteService } from '../cliente/cliente.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    private clienteService: ClienteService,
  ) {}

  async crear(dto: CreateUsuarioDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { cedula: dto.cedula },
    });

    if (existente) {
      throw new BadRequestException('Ya existe un usuario con esa cédula');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        userName: dto.userName,
        password: hashedPassword,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        cedula: dto.cedula,
        fechaNacimiento: dto.fechaNacimiento,
      },
    });

    switch (dto.rol) {
      case 'administrador':
        await this.prisma.administrador.create({
          data: { usuarioId: usuario.id },
        });
        break;
      case 'entrenador':
        if (!dto.horario || dto.sueldo === undefined) {
          throw new BadRequestException(
            'Horario y sueldo requeridos para entrenador',
          );
        }
        await this.prisma.entrenador.create({
          data: {
            usuarioId: usuario.id,
            horario: dto.horario,
            sueldo: dto.sueldo,
          },
        });
        break;
      case 'recepcionista':
        if (!dto.horario || dto.sueldo === undefined) {
          throw new BadRequestException(
            'Horario y sueldo requeridos para recepcionista',
          );
        }
        await this.prisma.recepcionista.create({
          data: {
            usuarioId: usuario.id,
            horario: dto.horario,
            sueldo: dto.sueldo,
          },
        });
        break;
      case 'cliente':
        if (
          !dto.horario ||
          !dto.sexo ||
          !dto.observaciones ||
          !dto.objetivos ||
          dto.tiempoEntrenar === undefined
        ) {
          const { password, ...result } = usuario;
          return result;
        }
        await this.prisma.cliente.create({
          data: {
            id: usuario.id,
            usuarioId: usuario.id,
            horario: dto.horario,
            sexo: dto.sexo,
            observaciones: dto.observaciones,
            objetivos: dto.objetivos,
            tiempoEntrenar: dto.tiempoEntrenar,
          },
        });
        break;
      default:
        throw new BadRequestException('Rol no válido');
    }

    const { password, ...result } = usuario;
    return result;
  }

  async obtenerPorId(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        administrador: true,
        entrenador: true,
        recepcionista: true,
        cliente: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...result } = usuario;
    return result;
  }

  async findByRol(rol?: string) {
    switch ((rol || '').toLowerCase()) {
      case 'administrador': {
        const rows = await this.prisma.administrador.findMany({
          include: { usuario: true },
        });
        return rows.map((r) => ({
          id: r.usuario.id,
          userName: r.usuario.userName,
          nombres: r.usuario.nombres,
          apellidos: r.usuario.apellidos,
          cedula: r.usuario.cedula,
          rol: 'administrador',
        }));
      }
      case 'entrenador': {
        const rows = await this.prisma.entrenador.findMany({
          include: { usuario: true },
        });
        return rows.map((r) => ({
          id: r.usuario.id,
          userName: r.usuario.userName,
          nombres: r.usuario.nombres,
          apellidos: r.usuario.apellidos,
          cedula: r.usuario.cedula,
          rol: 'entrenador',
        }));
      }
      case 'recepcionista': {
        const rows = await this.prisma.recepcionista.findMany({
          include: { usuario: true },
        });
        return rows.map((r) => ({
          id: r.usuario.id,
          userName: r.usuario.userName,
          nombres: r.usuario.nombres,
          apellidos: r.usuario.apellidos,
          cedula: r.usuario.cedula,
          rol: 'recepcionista',
        }));
      }
      case 'cliente': {
        const rows = await this.prisma.cliente.findMany({
          include: { usuario: true },
        });
        return rows.map((r) => ({
          id: r.usuario.id,
          userName: r.usuario.userName,
          nombres: r.usuario.nombres,
          apellidos: r.usuario.apellidos,
          cedula: r.usuario.cedula,
          rol: 'cliente',
        }));
      }
      default:
        // Si no se pasa rol, devolver vacío para evitar respuestas grandes no usadas
        return [];
    }
  }

  async counts() {
    const [administradores, entrenadores, recepcionistas] = await Promise.all([
      this.prisma.administrador.count(),
      this.prisma.entrenador.count(),
      this.prisma.recepcionista.count(),
    ]);
    return { administradores, entrenadores, recepcionistas };
  }

  async eliminar(usuarioId: number) {
    // Verificar si el usuario es un cliente
    const cliente = await this.prisma.cliente.findFirst({ where: { usuarioId } });
    
    if (cliente) {
      // Si es cliente, delegar la eliminación completa a ClienteService
      // que ya maneja todas las dependencias (planes, pagos, rutinas, etc.)
      return this.clienteService.remove(cliente.id);
    }

    // Si no es cliente, eliminar rol asociado y luego el usuario
    await this.prisma.$transaction(async (tx) => {
      const admin = await tx.administrador.findFirst({ where: { usuarioId } });
      if (admin) await tx.administrador.delete({ where: { id: admin.id } });

      const ent = await tx.entrenador.findFirst({ where: { usuarioId } });
      if (ent) await tx.entrenador.delete({ where: { id: ent.id } });

      const rec = await tx.recepcionista.findFirst({ where: { usuarioId } });
      if (rec) await tx.recepcionista.delete({ where: { id: rec.id } });

      // Eliminar gastos asociados
      await tx.gasto.deleteMany({ where: { usuarioId } });

      await tx.usuario.delete({ where: { id: usuarioId } });
    });

    return { ok: true };
  }
}
