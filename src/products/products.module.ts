import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { Product } from "./entities/product.entity";
import { Category } from "src/categories/entities/category.entity";

@Module({
  // InjectRepository(category)
  imports: [TypeOrmModule.forFeature([Product, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // optional if used in other modules
})
export class ProductsModule {}
