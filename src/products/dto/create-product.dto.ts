import { IsString, IsNumber, IsNotEmpty, IsOptional, MaxLength, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductImagesDto } from 'src/product_images/dto/create-product_images.dto';
export class CreateProductDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
  
}
