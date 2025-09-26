// dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {

    @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    format: 'email',
    })
    @IsEmail()
    email: string;
  
    @ApiProperty({
    description: 'Password of the user',
    example: 'myPassword123',
    minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
}