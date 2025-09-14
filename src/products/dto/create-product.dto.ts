import { IsString, MinLength, IsNumber, IsInt, Min , IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(5)
  @IsOptional()
  desc?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @IsOptional()
  categoryId?: number; 
}
