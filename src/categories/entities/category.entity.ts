import { Entity, Column , PrimaryGeneratedColumn , 
    CreateDateColumn ,UpdateDateColumn } from "typeorm";

@Entity('categories')
export class Category{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100})
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt : Date;
}