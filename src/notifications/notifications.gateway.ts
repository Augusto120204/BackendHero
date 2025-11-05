import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private lastEmittedSnapshot: string | null = null;

  constructor(private readonly notificationsService: NotificationsService) {}

  async afterInit() {
    console.log('WebSocket Notifications Gateway inicializado');
    this.emitNotificationsPeriodically();
  }

  async handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
    try {
      const notifications = await this.notificationsService.getCurrentNotifications();
      client.emit('notificationsUpdate', notifications);
    } catch (err) {
      console.error('Error enviando notificaciones iniciales:', err);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // Emitir notificaciones cada cierto intervalo
  private emitNotificationsPeriodically() {
    setInterval(async () => {
      try {
        const notifications = await this.notificationsService.getCurrentNotifications();
        const snapshot = JSON.stringify(notifications);

        if (this.lastEmittedSnapshot !== snapshot) {
          this.lastEmittedSnapshot = snapshot;
          console.log('📢 Enviando notificaciones actualizadas');
          this.server.emit('notificationsUpdate', notifications);
        } else {
          console.log('🔇 Sin cambios en notificaciones; no se emite');
        }
      } catch (err) {
        console.error('Error al obtener/enviar notificaciones:', err);
      }
    }, 10000); // cada 10 segundos
  }
}
