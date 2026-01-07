import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AsistenciaModule } from 'src/asistencia/asistencia.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' }, // Token expiration time
    }),
    AsistenciaModule,
  ],

  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
