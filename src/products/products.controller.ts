import { Controller, Body, Post, Get, Param, Delete, Put, Query, ParseIntPipe, Patch, HttpCode, HttpStatus } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Products } from "./entities/product.entity";
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam } from "@nestjs/swagger";

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1- create
  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Creates a new product item'
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    type: Products
  })
  @ApiResponse({
    status: 409,
    description: 'Product already exists'
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // 2- getAll
  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Returns a list of all products'
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [Products]
  })
  async getAll() {
    return this.productsService.getAll();
  }

  // 3- getOne
  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by ID',
    description: 'Returns a single product by its ID'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: Products
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found'
  })
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Products> {
    return this.productsService.getOne(id);
  }

  // 4- update
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a product',
    description: 'Updates an existing product by ID'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID'
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: Products
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Products | null> {
    return this.productsService.update(id, updateProductDto);
  }

  // 5- remove
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Deletes a product by ID'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID'
  })
  @ApiResponse({
    status: 204,
    description: 'Product deleted'
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found'
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productsService.remove(id);
  }
}
