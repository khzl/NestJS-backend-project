import { Injectable,NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { ProductImages } from "./entities/product_images.entity";
import { CreateProductImagesDto } from "./dto/create-product_images.dto";
import { UpdateProductImagesDto } from "./dto/update-product_images.dto";
import { ProductsService } from "src/products/products.service";

@Injectable()
export class ProductImagesService{

    constructor(
        @InjectRepository(ProductImages)
        private readonly productImagesRepository: Repository<ProductImages>,

        private readonly productsService: ProductsService, 
        // Injection 
    ){}

    // 1- Create Product Image 
    async create(createProductImageDto: CreateProductImagesDto,
                 images: Express.Multer.File[]): Promise<ProductImages[]>{
        const {productId,isPrimary,altText} = createProductImageDto;

        const product = await this.productsService.getOne(productId);

        if(isPrimary){
            await this.productImagesRepository.update(
                {productId},
                {isPrimary: false}
            )
        }

        const productImages : ProductImages[] = [];

        for (let index = 0 ; index < images.length; index++){
            const image = images[index];
            const productImage = this.productImagesRepository.create({
                productId: productId,
                imageUrl: `uploads/productImages/${image.filename}`,
                isPrimary: isPrimary && index === 0,
                altText: altText || `${product.name} image ${index + 1}`,
            });

            const savedImage = await this.productImagesRepository.save(productImage);
            productImages.push(savedImage);
        }

        return productImages
    }

    // 2- getAll Images
    async getAll(page?: number,
                 limit?: number,
                 productId?: number,
                 isPrimary?: boolean,): Promise<ProductImages[]>
    {
        const currentPage = page || 1;
        const currentLimit = limit || 10;
        const skip = (currentPage - 1) * currentLimit;

        return this.productImagesRepository.find({
            where: {productId: productId, isPrimary: isPrimary},
            take: currentLimit,
            skip: skip,
            relations: ['product'],
            order: {createdAt: 'ASC'},
        });
    }

    // 3- getOne Image 
    async getOne(id:number): Promise<ProductImages>{
        const productImage = await this.productImagesRepository.findOne(
        {where: {id:id}});

        if (!productImage)
            throw new NotFoundException(`Image with id ${id} Not Found`);

        return productImage;
    }

    // 4- get by product Id 
    async getByProductId(productId:number): Promise<ProductImages[]>{

        const product = await this.productsService.getOne(productId);

        return this.productImagesRepository.find({
            where: {productId:productId},
            order: {createdAt: 'ASC', isPrimary: 'desc'}
        });
    }

    // 5- update product images
    async update(id:number, imageToUpdate: UpdateProductImagesDto): Promise<ProductImages>{
        const {productId,isPrimary,altText} = imageToUpdate;

        const existingImage = await this.getOne(id);

        if (!existingImage){
            throw new NotFoundException(`Image With Id ${id} Not Found`);
        }

         //! if want to update the isPrimary which is a unique property 
         // that exist for one image only, so you should set all isPrimary
         //  for the rest product images to false
         if (isPrimary !== undefined && isPrimary === true){
            await this.productImagesRepository.update(
                {productId:existingImage.productId, id: Not(id)},
                {isPrimary:false}
            );
         }

          //* using Object.assign() method is better 
          //  that the above if statements,
          //  because it shorter, more readable, and synchronized with the DTO
          Object.assign(existingImage,imageToUpdate);

          return await this.productImagesRepository.save(existingImage);
    }

    // 6- remove images
    async remove(id: number){
       const imageToRemove = await this.getOne(id);
       const deletedImage = await this.productImagesRepository.remove(imageToRemove);
       return {
        message: `the image with th id ${id} has been deleted successfully`,
        deletedImage,
       }
    }

    // 6- Remove Images by product Id (use when delete or update product)
    async removeByProductId(productId: number): Promise<void>{
        const images = await this.productImagesRepository.find({
            where: {productId},
        });

        if (images.length){
            await this.productImagesRepository.remove(images);
        }
    }
}