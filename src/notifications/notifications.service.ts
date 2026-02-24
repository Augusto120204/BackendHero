import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addDays } from 'date-fns';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Métodos existentes para WebSocket (notificaciones de dashboard)
  async getCurrentNotifications() {
    const hoy = new Date();

    const pagosVencidos = await this.prisma.deuda.count({
      where: { solventada: false },
    });

    const proximasMembresias = await this.prisma.clientePlan.count({
      where: {
        activado: true,
        fechaFin: {
          gte: hoy,
          lte: addDays(hoy, 7),
        },
      },
    });

    const productosBajos = await this.prisma.producto.count({
      where: { stock: { lt: 5 }, estado: true },
    });

    return [
      {
        icon: 'alert-triangle',
        title: `${pagosVencidos} pagos vencidos`,
        message: 'Requieren seguimiento inmediato',
        color: 'bg-red-50 border-red-200 text-red-700',
      },
      {
        icon: 'clock',
        title: `${proximasMembresias} membresías expiran pronto`,
        message: 'En los próximos 7 días',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      },
      {
        icon: 'info',
        title: `${productosBajos} productos con stock bajo`,
        message: 'Verificar inventario',
        color: 'bg-blue-50 border-blue-200 text-blue-700',
      },
    ];
  }

  // Nuevos métodos para notificaciones persistentes
  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notificacion.create({
      data: createNotificationDto,
    });
  }

  async findAllByUser(usuarioId: number) {
    console.log('[NotificationsService] Buscando notificaciones para usuarioId:', usuarioId);
    const notificaciones = await this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`[NotificationsService] Encontradas ${notificaciones.length} notificaciones para usuarioId ${usuarioId}`);
    return notificaciones;
  }

  async findUnreadByUser(usuarioId: number) {
    console.log('[NotificationsService] Buscando notificaciones no leídas para usuarioId:', usuarioId);
    const notificaciones = await this.prisma.notificacion.findMany({
      where: {
        usuarioId,
        leida: false,
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`[NotificationsService] Encontradas ${notificaciones.length} notificaciones no leídas para usuarioId ${usuarioId}`);
    return notificaciones;
  }

  async markAsRead(id: number) {
    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
  }

  async markAllAsRead(usuarioId: number) {
    return this.prisma.notificacion.updateMany({
      where: {
        usuarioId,
        leida: false,
      },
      data: { leida: true },
    });
  }

  // Método para crear notificación cuando se asigna una rutina
  async notificarRutinaAsignada(clienteId: number, rutinaId: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        usuario: true,
      },
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    console.log(`[NotificationsService] Creando notificación de rutina asignada para clienteId: ${clienteId}, usuarioId: ${cliente.usuarioId}`);

    return this.create({
      usuarioId: cliente.usuarioId,
      tipo: 'rutina_asignada',
      mensaje: '¡Te han asignado una nueva rutina de entrenamiento!',
      metadata: JSON.stringify({ rutinaId, clienteId }),
    });
  }

  // Método para notificar a entrenadores cuando un cliente completa/actualiza su perfil
  async notificarPerfilCliente(clienteId: number, accion: 'completado' | 'actualizado') {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        usuario: true,
      },
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Obtener todos los entrenadores
    const entrenadores = await this.prisma.entrenador.findMany({
      include: {
        usuario: true,
      },
    });

    console.log(`[NotificationsService] Notificando perfil ${accion} a ${entrenadores.length} entrenadores`);

    const mensaje =
      accion === 'completado'
        ? `${cliente.usuario.nombres} ${cliente.usuario.apellidos} ha completado su perfil`
        : `${cliente.usuario.nombres} ${cliente.usuario.apellidos} ha actualizado su perfil`;

    const tipo = accion === 'completado' ? 'perfil_completado' : 'perfil_actualizado';

    // Crear notificación para cada entrenador
    const notificaciones = entrenadores.map((entrenador) => {
      console.log(`[NotificationsService] Creando notificación para entrenadorId: ${entrenador.id}, usuarioId: ${entrenador.usuarioId}`);
      return this.create({
        usuarioId: entrenador.usuarioId,
        tipo,
        mensaje,
        metadata: JSON.stringify({ clienteId }),
      });
    });

    return Promise.all(notificaciones);
  }

  // Método para que un cliente solicite una nueva rutina
  async crearSolicitudRutina(clienteId: number) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { usuarioId: clienteId },
      include: {
        usuario: true,
      },
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Obtener todos los entrenadores
    const entrenadores = await this.prisma.entrenador.findMany({
      include: {
        usuario: true,
      },
    });

    console.log(`[NotificationsService] Creando solicitud de rutina para ${entrenadores.length} entrenadores`);

    const mensaje = `${cliente.usuario.nombres} ${cliente.usuario.apellidos} ha solicitado una nueva rutina`;

    // Crear notificación para cada entrenador
    const notificaciones = entrenadores.map((entrenador) => {
      console.log(`[NotificationsService] Creando notificación para entrenadorId: ${entrenador.id}, usuarioId: ${entrenador.usuarioId}`);
      return this.create({
        usuarioId: entrenador.usuarioId,
        tipo: 'solicitud_rutina',
        mensaje,
        metadata: JSON.stringify({ clienteId: cliente.id }),
      });
    });

    return Promise.all(notificaciones);
  }
}
