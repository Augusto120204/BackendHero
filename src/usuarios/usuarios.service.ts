import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

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
            id: usuario.id, // El ID del cliente será el mismo que el del usuario
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
}
