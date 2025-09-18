import { Injectable, NotFoundException , ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class CategoriesService{
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ){}

    // 1- create category
    async createCategory(createCategoryDto: CreateCategoryDto,
        image?: Express.Multer.File,
    ) : Promise<Category>{
        const { name , description } = createCategoryDto;
        console.log('CreateCategoryDto: ' , createCategoryDto); // Debug Log
        console.log('Image: ' , image); // Debug Log

        // check uniqueness of name 
        const existingCategory = await this.categoryRepository.findOne({
            where: {name:name},
        });

        if (existingCategory){
            throw new ConflictException(`The Category ${name} already exists`);
        }

        const category = this.categoryRepository.create({
            name,
            description : description,
            image: `/uploads/categories/${image ? image.filename : null}`, 
        });

        return this.categoryRepository.save(category);
    }

    // 2- GetAll categories
    async GetAll(): Promise<Category[]>{
        const queryBuilder = this.categoryRepository.createQueryBuilder('category');
        const categories = await queryBuilder.getMany();
        return categories;
    }

    // 3- GetOne category
    async GetOne(id:number): Promise<Category>{
        const category = await this.categoryRepository.findOne({
            where: {id:id},
            relations: ['products'],
        });

        if (!category){
            throw new NotFoundException(`Category with id ${id} Not Found`);
        }

        return category;
    }

    // 4- update category
    async update(id:number,
        updateCategoryDto:UpdateCategoryDto,
        image?: Express.Multer.File,): Promise<Category>{
        const {name , description} = updateCategoryDto;

        const categoryToUpdate = await this.categoryRepository.findOne({
            where: {id:id}
        });

        if (!categoryToUpdate){
            // Delete uploaded image if category not found 
            if (image){
                this.deleteImageFile(image.path);
            }
            throw new NotFoundException(`Category With id ${id} Not Found`);
        }

        // check uniqueness if name is updated 
        if (name && name !== categoryToUpdate.name){
            const existingCategory = await this.categoryRepository.findOne({
                where: {name:name},
            });

            if (existingCategory){
                // Delete uploaded image if name conflict
                if (image){
                    this.deleteImageFile(image.path);
                }
                throw new ConflictException('Category name already exists');
            }
        }

        // delete old image if new image is uploaded 
        if (image && categoryToUpdate.image){
            this.deleteImageFile(`./uploads/categories/${categoryToUpdate.image}`);
        }

        categoryToUpdate.name = name || categoryToUpdate.name;
        categoryToUpdate.description = description || categoryToUpdate.description;
        categoryToUpdate.image = image ? image.filename : categoryToUpdate.image;

        return this.categoryRepository.save(categoryToUpdate);

    }

    // 5- remove category
    async remove(id:number): Promise<Category>{
        const categoryToRemove = await this.categoryRepository.findOne({
            where: {id:id}
        });

        if (!categoryToRemove){
            throw new NotFoundException(`category with id: ${id} Not found`);
        }

        // Delete Associated image file 
        if (categoryToRemove.image){
            this.deleteImageFile(`./uploads/categories/${categoryToRemove.image}`);
        }
        
        return this.categoryRepository.remove(categoryToRemove);
    }

    private deleteImageFile(filePath: string): void{
        try{
            if (fs.existsSync(filePath)){
                fs.unlinkSync(filePath);
            }
        }catch(error){
            console.error('Error Deleting image file:',error);
        }
    }

}