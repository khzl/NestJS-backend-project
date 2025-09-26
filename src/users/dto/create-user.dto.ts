import { IsString , IsEmail , IsEnum , IsOptional , MinLength } from "class-validator";
import { UserRole } from "../entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto{
    
    @ApiProperty({
        description: 'The full name of the user',
        example: 'john doe',
        maxLength: 100
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'khazaal.doe@gmail.com',
        format: 'email',
        uniqueItems: true
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'the role of the user (defaults to CUSTOMER if not provided',
        enum: UserRole,
        example: UserRole.CUSTOMER,
        required: false,
        default: UserRole.CUSTOMER
    })
    @IsEnum(UserRole)
    @IsOptional() // Optional because default is Customer 
    role?: UserRole;

    @ApiProperty({
        description: 'The password for the user account (minimum 6 characters)',
        example: 'strongPass123',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    password: string;
}