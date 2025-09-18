import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from 'src/categories/categories.service';
@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,

    private readonly categoryService: CategoriesService,
    // Inject CategoryService
  ) {}

  // 1- create Product
  async create(createProductDto: CreateProductDto): Promise<Products>{
    const {
      name,
      description,
      price,
      stock,
      categoryId,
    } = createProductDto;

    // check category
    if (categoryId){
      // use CategoryService to validate 
      const category = await this.categoryService.GetOne(categoryId);
      if (!category){
        throw new BadRequestException(`category With Id ${categoryId} not found`);
      }
    }

    // check name product
    const existingProduct = await this.productRepository.findOne({
      where: {name}
    });

    if (existingProduct){
      throw new ConflictException(`the Product: ${name} already exists`) 
    }

    // create product 
    const product = this.productRepository.create({
      name,
      description,
      price,
      stock,
      categoryId,
    });

    return this.productRepository.save(product);
  }

  // 2- getAll Product
  async getAll(): Promise<Products[]> {
    const products = await this.productRepository.find({relations: ['category','productImages']});

    return products.map(product => ({
      ...product,
      category: product.category || {id: 0, name: 'unCategorized'}
    }));
  }

  // 3- getOne Product
  async getOne(id: number): Promise<Products> {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: ['category', 'productImages'], // Fetch Images with product
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  // 4- update Product
  async update(id: number, updateProductDto: UpdateProductDto){
  
    const {name,description,price,stock,categoryId} = updateProductDto;

    const productToUpdate = await this.productRepository.findOne({where:{id:id}});

    if (!productToUpdate) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    if (name !== undefined){
      productToUpdate.name = name.trim();
    }

    if (description !== undefined){
      productToUpdate.description = description.trim();
    }

    if (price !== undefined){
      productToUpdate.price = price;
    }

    if (stock !== undefined){
      productToUpdate.stock = stock;
    }

    if (categoryId !== undefined){
      productToUpdate.categoryId = categoryId;
    }

    await this.productRepository.update(id,productToUpdate);
    return this.productRepository.findOne({
      where: {id},
      relations: ['category']
    });

}

  // 5- remove product
  async remove(id: number): Promise<Products> {
    const productToRemove = await this.productRepository.findOne({
      where:{id:id}});

    if (!productToRemove){
      throw new NotFoundException(`product with id: ${id} Not Found`);
    }

    return this.productRepository.remove(productToRemove);
  }
  
}