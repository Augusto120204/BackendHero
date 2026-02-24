import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Crear una notificación
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  // Obtener todas las notificaciones del usuario autenticado
  @Get()
  findAll(@Request() req) {
    const userId = req.user.sub;
    console.log('[NotificationsController] Obteniendo notificaciones para userId:', userId);
    return this.notificationsService.findAllByUser(userId);
  }

  // Obtener notificaciones no leídas del usuario autenticado
  @Get('no-leidas')
  findUnread(@Request() req) {
    const userId = req.user.sub;
    console.log('[NotificationsController] Obteniendo notificaciones no leídas para userId:', userId);
    return this.notificationsService.findUnreadByUser(userId);
  }

  // Marcar una notificación como leída
  @Patch(':id/leer')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  // Marcar todas las notificaciones del usuario como leídas
  @Patch('leer-todas')
  markAllAsRead(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.markAllAsRead(userId);
  }

  // Solicitar rutina nueva (endpoint específico para clientes)
  @Post('solicitar-rutina')
  async solicitarRutina(@Request() req) {
    const clienteId = req.user.sub;
    return this.notificationsService.crearSolicitudRutina(clienteId);
  }
}
