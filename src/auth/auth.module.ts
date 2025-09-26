import { Module } from '@nestjs/common';
  import { JwtModule } from '@nestjs/jwt';
  import { PassportModule } from '@nestjs/passport';
  import { AuthService } from './auth.service';
  import { AuthController } from './auth.controller';
  import { UsersModule } from '../users/users.module';
  import { JwtStrategy } from './strategies/jwt.strategy';
  import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
  @Module({
    imports: [
      UsersModule,
      PassportModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET || 'your-secret-key',
        signOptions: { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
        },
      }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, OptionalJwtAuthGuard],
    exports: [AuthService , OptionalJwtAuthGuard],
  })
  export class AuthModule {}