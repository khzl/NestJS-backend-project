import { Injectable, NotFoundException , ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService{
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ){}

    // 1- create()
    async create(createCategoryDto: CreateCategoryDto) : Promise<Category>{
        const { name } = createCategoryDto;

        // check uniqueness of name 
        const existingCategory = await this.categoryRepository.findOne({
            where: {name},
        });

        if (existingCategory){
            throw new ConflictException('Category name already exists');
        }

        const category = this.categoryRepository.create({name});
        return this.categoryRepository.save(category);
    }

    // 2- findAll()
    async findAll(offset: number = 0, limit: number = 10): Promise<{}>{
        const [data, count] = await this.categoryRepository.findAndCount({
            skip: offset,
            take: limit,
            order: {createdAt: 'DESC'},
        });

        return {data,count};
    }

    // 3- findOne()
    async findOne(id:number): Promise<Category>{
        const category = await this.categoryRepository.findOne({
            where: {id},
        });

        if (!category){
            throw new NotFoundException(`Category with id ${id} Not Found`);
        }

        return category;
    }

    // 4- update()
    async update(id:number, updateData:UpdateCategoryDto): Promise<Category>{
        const category = await this.findOne(id);

        if (!category){
            throw new NotFoundException(`Category With id ${id} Not Found`);
        }

        // check uniqueness if name is updated 
        if (updateData.name && updateData.name !== category.name){
            const existingCategory = await this.categoryRepository.findOne({
                where: {name: updateData.name},
            });

            if (existingCategory){
                throw new ConflictException('Category name already exists');
            }

            category.name = updateData.name;
        }

        return this.categoryRepository.save(category);
    }

    // 5- remove()
    async remove(id:number): Promise<{message: string}>{
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);
        return {message: 'Category deleted successfully'};
    }
}