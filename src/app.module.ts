import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProductoModule } from './producto/producto.module';
import { PlanModule } from './plan/plan.module';
import { ClientePlanModule } from './cliente-plan/cliente-plan.module';
import { PagoModule } from './pago/pago.module';
import { DeudaModule } from './deuda/deuda.module';
import { GastoModule } from './gasto/gasto.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { AdministradorModule } from './administrador/administrador.module';
import { EntrenadorModule } from './entrenador/entrenador.module';
import { RecepcionistaModule } from './recepcionista/recepcionista.module';
import { RutinaModule } from './rutina/rutina.module';
<<<<<<< HEAD
import { CompraModule } from './compra/compra.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { FacturaModule } from './factura/factura.module';
=======
import { EntrenamientoModule } from './entrenamiento/entrenamiento.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
>>>>>>> f4c8f7a667d26b5932ed43786374cafb6b9aee78

@Module({
  imports: [
    UsuariosModule,
    PrismaModule,
    AuthModule,
    ClienteModule,
    ProductoModule,
    PlanModule,
    ClientePlanModule,
    PagoModule,
    DeudaModule,
    GastoModule,
    NotificationsModule,
    EstadisticasModule,
    AdministradorModule,
    EntrenadorModule,
    RecepcionistaModule,
    RutinaModule,
<<<<<<< HEAD
    CompraModule,
    AsistenciaModule,
    FacturaModule,
=======
    EntrenamientoModule,
    AsistenciaModule,
>>>>>>> f4c8f7a667d26b5932ed43786374cafb6b9aee78
  ],
})
export class AppModule {}
