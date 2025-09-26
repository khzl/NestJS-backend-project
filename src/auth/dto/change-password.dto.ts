// dto/change-password.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ChangePasswordDto {

    @ApiProperty({
    description: 'Current password of the user',
    example: 'oldPassword123',
    minLength: 6,
    })
    @IsString()
    @MinLength(6)
    currentPassword: string;
  
    @ApiProperty({
    description: 'New password to be set',
    example: 'newPassword456',
    minLength: 6,
    })
    @IsString()
    @MinLength(6)
    newPassword: string;
    
  }