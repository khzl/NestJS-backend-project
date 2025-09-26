import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';  
import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto {

    @ApiProperty({
    description: 'Email address of the new user',
    example: 'newuser@example.com',
    format: 'email',
    })
    @IsEmail()
    email: string;
  
    @ApiProperty({
    description: 'Full name of the new user',
    example: 'John Doe',
    minLength: 2,
    })
    @IsString()
    @MinLength(2)
    name: string;
  
    @ApiProperty({
    description: 'Password for the new user',
    example: 'securePass123',
    minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
  
    @ApiProperty({
    description: 'Role of the new user (defaults to CUSTOMER)',
    enum: UserRole,
    example: UserRole.CUSTOMER,
    required: false,
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.CUSTOMER;

}