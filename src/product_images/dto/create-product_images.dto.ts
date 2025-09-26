import { IsString, IsNumber , IsOptional , IsBoolean , MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductImagesDto{

    @ApiProperty({
    description: 'The ID of the product this image belongs to',
    example: 12,
    type: Number
    })
    @Type(() => Number)
    @IsNumber()
    productId: number;

    @ApiProperty({
    description: 'Whether this image is the primary image of the product',
    example: true,
    type: Boolean,
    default: false
    })
    @Type(() => Boolean)
    @IsBoolean()
    isPrimary: boolean;

    @ApiProperty({
    description: 'Alternative text for the product image (for SEO & accessibility)',
    example: 'Front view of the electronic camera',
    maxLength: 255
    })
    @IsString()
    @MaxLength(255)
    altText: string;
}