import { Controller , Body , Post , Get , Param , Delete , Put , Query } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller('categories')
export class CategoriesController{
    constructor(private readonly categoriesService: CategoriesService){}

    // 1- create()
    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto){
        return this.categoriesService.create(createCategoryDto);
    }

    // 2- findAll()
    @Get()
    async findAll(@Query('offset') offset: number = 0, @Query('limit') limit: number = 10){
        return this.categoriesService.findAll(offset,limit);
    }

    // 3- findOne()
    @Get(':id')
    async findOne(@Param('id') id: number){
        return this.categoriesService.findOne(id);
    }

    // 4- update()
    @Put(':id')
    async update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto)
    {
        return this.categoriesService.update(id,updateCategoryDto);
    }

    // 5- update()
    @Delete(':id')
    async remove(@Param('id') id: number){
        return this.categoriesService.remove(id);
    }
    
}