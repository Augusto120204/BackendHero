import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  usuarioId: number;

  @IsString()
  tipo: string; // 'rutina_asignada', 'perfil_completado', 'perfil_actualizado', 'solicitud_rutina'

  @IsString()
  mensaje: string;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string con datos adicionales
}

