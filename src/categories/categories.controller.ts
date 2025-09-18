import { Controller , Body , Post , Get , Param , Delete , Put , Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, ParseIntPipe, Patch, FileTypeValidator, HttpCode, HttpStatus } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { Category } from "./entities/category.entity";
@Controller('categories')
export class CategoriesController{
    constructor(private readonly categoriesService: CategoriesService){}

    
    // 1- create category
@Post()
@UseInterceptors(FileInterceptor('image' , {
        storage: diskStorage ({
        destination: './uploads/categories',
        filename: (request, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null , `${uniqueName}${ext}`);},
        }),
}))
async create(@Body() createCategoryDto: CreateCategoryDto,
             @UploadedFile(
                new ParseFilePipe({
                    validators: [
                        new MaxFileSizeValidator({maxSize: 5 * 1024 * 1024}), // 5MB
                        ],
                    fileIsRequired: false, // mke image optional
                    }), 
                 )
                image?: Express.Multer.File,
)
{
    return this.categoriesService.createCategory(createCategoryDto,image);
}


    // 2- get all 
    @Get()
    async getAll(){
        return this.categoriesService.GetAll();
    }

    // 3- get One Category
    @Get(':id')
    async getOne(@Param('id' , ParseIntPipe) id: number): Promise<Category>{
        return this.categoriesService.GetOne(id);
    }


    // 4- update category
    @Patch(':id')
    @UseInterceptors(FileInterceptor('image',{
        storage: diskStorage({
            destination: './uploads/categories',
            filename: (request,file,callback) => {
                const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null,`${uniqueName}${ext}`);
            },
        }),
    }))
    async update(
     @Param('id' , ParseIntPipe) id: number,
     @Body() updateCategoryDto: UpdateCategoryDto,
     @UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({maxSize: 5 * 1024 * 1024}),
                new FileTypeValidator({fileType: /.(jpg|jpeg|png|gif)$/}),
            ],
            fileIsRequired:false,
        }),
     )
     image?: Express.Multer.File,
    ): Promise<Category>
    {
        return this.categoriesService.update(id,updateCategoryDto,image);
    }

    // 5- delete category
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id' , ParseIntPipe) id: number): Promise<void>{
        await this.categoriesService.remove(id);
    }

}