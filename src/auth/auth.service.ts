import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(cedula: string, password: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { cedula }, // ✅ usamos campo único
    });

    if (!user) {
      throw new UnauthorizedException('Cédula no encontrada');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = {
      sub: user.id,
      userName: user.userName,
      cedula: user.cedula,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
