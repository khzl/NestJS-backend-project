import { 
    Entity,
    Column,
    PrimaryGeneratedColumn, 
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";
import { Product } from "src/products/entities/product.entity";

// Decorator class 
@Entity('categories')
export class Category{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100})
    name: string;

    // Link One To Many => products
    @OneToMany(() => Product, (product) => product.category)
    products?: Product[];
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt : Date;
}