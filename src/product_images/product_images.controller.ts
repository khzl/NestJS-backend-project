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
import { 
  ApiTags, ApiOperation,ApiConsumes,ApiBody, ApiResponse,ApiQuery,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags('Product Images')
@Controller('product-images')
export class ProductImagesController{
    constructor(private readonly productImagesService: ProductImagesService){}

    // Create With Upload Image
   @Post()
   @ApiOperation({ summary: 'Upload and create a product image' })
   @ApiConsumes('multipart/form-data')
   @ApiBody({
      schema: {
        type: 'object',
        properties: {
          productId: { type: 'number', example: 12 },
          isPrimary: { type: 'boolean', example: false },
          altText: { type: 'string', example: 'Front view of the product' },
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
   @ApiResponse({ status: 201, description: 'Product image successfully uploaded' })
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

    // 2- get All product Image
    @Get()
    @ApiOperation({ summary: 'Get all product images with pagination and filters' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'productId', required: false, example: 12 })
    @ApiQuery({ name: 'isPrimary', required: false, example: true })
    @ApiResponse({ status: 200, description: 'List of product images retrieved successfully' })
    async getAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('productId') productId?: number,
        @Query('isPrimary') isPrimary?: boolean,
    )
    {
        return this.productImagesService.getAll(page,limit,productId,isPrimary);
    }

    // get One By Id
    @Get(':id')
    @ApiOperation({ summary: 'Get a single product image by ID' })
    @ApiParam({ name: 'id', example: 5 })
    @ApiResponse({ status: 200, description: 'Product image retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Image not found' })
    async getOne(@Param('id', ParseIntPipe) id: number)
    {
        return this.productImagesService.getOne(id);
    }

    // get product by product id 
    @Get('product/:productId')
    @ApiOperation({ summary: 'Get all images for a specific product' })
    @ApiParam({ name: 'productId', example: 12 })
    @ApiResponse({ status: 200, description: 'Product images retrieved successfully' })
    async getByProductId(@Param('productId') productId:number){
        return this.productImagesService.getByProductId(productId);
    }

    // 4- update (upload new Images)(only metadata on file )
    @Patch(':id')
    @ApiOperation({ summary: 'Update product image details' })
    @ApiParam({ name: 'id', example: 5 })
    @ApiBody({ type: UpdateProductImagesDto })
    @ApiResponse({ status: 200, description: 'Product image updated successfully' })
    async update(
    @Body() updateProductImagesDto: UpdateProductImagesDto,
    @Param('id', ParseIntPipe) id: number,) 
    {
        return this.productImagesService.update(id,updateProductImagesDto);
    }

    
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product image by ID' })
    @ApiParam({ name: 'id', example: 5 })
    @ApiResponse({ status: 200, description: 'Product image deleted successfully' })
    @ApiResponse({ status: 404, description: 'Image not found' })
    async remove(@Param('id', ParseIntPipe)id: number){
        return this.productImagesService.remove(id);
    }
    
}