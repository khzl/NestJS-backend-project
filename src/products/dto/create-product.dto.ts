import { IsString, IsNumber, IsNotEmpty, IsOptional, MaxLength,} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateProductDto {

@ApiProperty({
        description: 'The name of the product',
        example: 'Electronic',
        maxLength: 100
})
@IsString()
@IsNotEmpty()
name: string;

@ApiProperty({
      description: 'Detailed description of the product',
      example: 'camera with 20MP resolution and 4k video recording',
      maxLength: 500,
      required: false
})
@IsString()
@IsOptional()
@MaxLength(500)
description?: string;

@ApiProperty({
  description: 'The price of the product in USD',
  example: 499.99,
  type: Number
})
@IsNumber()
price: number;

@ApiProperty({
  description: 'Available stock quantity of the product'
})
@IsNumber()
stock: number;

@ApiProperty({
  description: 'The ID of the category this product belongs to',
  example: 3,
  required: false,
  type: Number
})
@IsOptional()
@IsNumber()
categoryId?: number;

}
