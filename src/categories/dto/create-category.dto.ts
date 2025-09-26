import { IsNotEmpty, IsOptional, IsString , MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoryDto{
    
    @ApiProperty({
    description: 'The name of the category',
    example: 'Electronics',
    maxLength: 100,
    })
    @IsString()
    @IsNotEmpty() 
    name: string;

    @ApiPropertyOptional({
    description: 'Optional description for the category',
    example: 'Devices and gadgets such as phones, laptops, and cameras.',
    maxLength: 500,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    // image is handled by multer not in dto
    // there is no need to add the image to dto
}