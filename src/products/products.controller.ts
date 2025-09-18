import { Controller, Body, Post, Get, Param, Delete, Put, Query, ParseIntPipe, Patch, HttpCode, HttpStatus } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Products } from "./entities/product.entity";

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1- create
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // 2- getAll
  @Get()
  async getAll() {
    return this.productsService.getAll();
  }

  // 3- getOne
  @Get(':id')
  async getOne(@Param('id' , ParseIntPipe) id: number): Promise<Products> {
    return this.productsService.getOne(id);
  }

  // 4- update
  @Patch(':id')
  async update(
    @Param('id' , ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) : Promise<Products | null>
  {
    return this.productsService.update(id, updateProductDto);
  }

  // 5- remove
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id' , ParseIntPipe) id: number): Promise<void> {
    await this.productsService.remove(id);
  }

}
