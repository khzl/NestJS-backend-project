import { IsNotEmpty, IsOptional, IsString , MaxLength, MinLength } from "class-validator";


export class CreateCategoryDto{
    
    @IsString()
    @IsNotEmpty() 
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    // image is handled by multer not in dto
    // there is no need to add the image to dto
}