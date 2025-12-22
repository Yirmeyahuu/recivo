import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getCurrentUser(@Request() req) {
    return this.authService.getUserById(req.user.uid);
  }

  @Get('verify')
  @UseGuards(FirebaseAuthGuard)
  async verifyToken(@Request() req) {
    return {
      valid: true,
      user: req.user,
    };
  }
}