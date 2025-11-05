import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body('cedula') cedula: string, @Body('password') password: string) {
    return this.authService.login(cedula, password);
  }
}
