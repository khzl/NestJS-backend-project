import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Patch,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import { ChangePasswordDto } from './dto/change-password.dto';
  import { JwtAuthGuard } from './guards/jwt-auth.guard';
  import { CurrentUser } from './decorators/current-user.decorator';
  import { User } from '../users/entities/user.entity';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // 1- register()
      @Post('register')
    async register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
    }
  
    // 2- login()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
      return this.authService.login(loginDto);
    }

    // 3- changePassword()
    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    async changePassword(
      @CurrentUser() user: User,
      @Body() changePasswordDto: ChangePasswordDto,
    ) {
      return this.authService.changePassword(user.id, changePasswordDto);
    }

}