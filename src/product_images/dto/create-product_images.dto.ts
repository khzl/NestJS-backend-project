import { IsString, IsNumber , IsOptional , IsBoolean , MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductImagesDto{

    @Type(() => Number)
    @IsNumber()
    productId: number;

    @Type(() => Boolean)
    @IsBoolean()
    isPrimary: boolean;

    @IsString()
    @MaxLength(255)
    altText: string;
}