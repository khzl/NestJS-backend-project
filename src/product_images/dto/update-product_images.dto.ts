import { PartialType } from "@nestjs/mapped-types";
import { CreateProductImagesDto } from "./create-product_images.dto";

export class UpdateProductImagesDto extends PartialType(CreateProductImagesDto){}