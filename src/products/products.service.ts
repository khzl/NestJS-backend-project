import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // 1- create()
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, desc, price, stock, categoryId } = createProductDto;


    // Check uniqueness of product name
    const existingProduct = await this.productRepository.findOne({
      where: { name },
    });
    if (existingProduct) {
      throw new ConflictException('Product name already exists');
    }

    let category: Category | null = null;
    
    if (categoryId !== undefined){
      category = await this.categoryRepository.findOne({
        where: {id: categoryId},
      });

      if(!category){
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }
    }

    // link product over category 
    const product = this.productRepository.create({
      name,
      desc,
      price,
      stock,
      category: category ?? undefined, // link here 
    });

    return this.productRepository.save(product);
  }

  // 2- findAll()
  async findAll(offset: number = 0, limit: number = 10): Promise<{
    data: Product[]; 
    count: number;
  }> {
    const [data, count] = await this.productRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['category'], // Fetch Relation as needed
    });

    return { data, count };
  }

  // 3- findOne()
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  // 4- update()
  async update(id: number, updateData: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Check uniqueness if name is updated
    if (updateData.name && updateData.name !== product.name) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: updateData.name },
      });

      if (existingProduct) {
        throw new ConflictException('Product name already exists');
      }

      product.name = updateData.name;
    }

    if (updateData.desc !== undefined) {
      product.desc = updateData.desc;
    }
    if (updateData.price !== undefined) {
      product.price = updateData.price;
    }
    if (updateData.stock !== undefined) {
      product.stock = updateData.stock;
    }

    // if user send new categoryId update category here 
    if (updateData.categoryId !== undefined){

      if (updateData.categoryId === null){

        product.category = undefined; 
      }
      else{
        const category = await this.categoryRepository.findOne({
          where: {id: updateData.categoryId},
        });

        if(!category){
          throw new NotFoundException(`Category With id ${updateData.categoryId} Not Found`);
        }

        product.category = category;

      }
    }
    
    return this.productRepository.save(product);
  }

  // 5- remove()
  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }
}
