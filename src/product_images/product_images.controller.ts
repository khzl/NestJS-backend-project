import 
{ 
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    Body,
    Query,
    ParseIntPipe,
    UploadedFile,
    UseInterceptors,
    BadRequestException, 
    ParseFilePipe,
    MaxFileSizeValidator,
    Patch
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ProductImagesService } from "./product_images.service";
import { CreateProductImagesDto } from "./dto/create-product_images.dto";
import { UpdateProductImagesDto } from "./dto/update-product_images.dto";

@Controller('product-images')
export class ProductImagesController{
    constructor(private readonly productImagesService: ProductImagesService){}

    // Create With Upload Image
   @Post()
   @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (request, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          callback(new BadRequestException('Only JPG, JPEG, PNG files are allowed!'), false);
        } else {
          callback(null, true);
        }
      },
    }))
    // Create New 
   async create(@Body() createProductImagesDto: CreateProductImagesDto,
    @UploadedFile(
        new ParseFilePipe({
            validators: [new MaxFileSizeValidator({maxSize: 5 * 1024 * 1024})],
            fileIsRequired: true,
        }),
    ) images: Express.Multer.File[],
)
{
    return this.productImagesService.create(createProductImagesDto,images);
}

    // 2- get All product Image Get Endpoint
    @Get()
    async getAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('productId') productId?: number,
        @Query('isPrimary') isPrimary?: boolean,
    )
    {
        return this.productImagesService.getAll(page,limit,productId,isPrimary);
    }

    // get One By Id Get Endpoint
    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number)
    {
        return this.productImagesService.getOne(id);
    }

    // get product by product id 
    @Get('product/:productId')
    async getByProductId(@Param('productId') productId:number){
        return this.productImagesService.getByProductId(productId);
    }

    // 4- update (upload new Images)
    @Patch(':id')
    async update(
    @Body() updateProductImagesDto: UpdateProductImagesDto,
    @Param('id', ParseIntPipe) id: number,) 
    {
        return this.productImagesService.update(id,updateProductImagesDto);
    }

    
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe)id: number){
        return this.productImagesService.remove(id);
    }
    
}