import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // 1- create()
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, desc, price, stock } = createProductDto;

    // Check uniqueness of product name
    const existingProduct = await this.productRepository.findOne({
      where: { name },
    });

    if (existingProduct) {
      throw new ConflictException('Product name already exists');
    }

    const product = this.productRepository.create({
      name,
      desc,
      price,
      stock,
    });

    return this.productRepository.save(product);
  }

  // 2- findAll()
  async findAll(offset: number = 0, limit: number = 10): Promise<{}> {
    const [data, count] = await this.productRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, count };
  }

  // 3- findOne()
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
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

    return this.productRepository.save(product);
  }

  // 5- remove()
  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }
}
