import { 
    Entity,
    Column,
    PrimaryGeneratedColumn, 
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";
import { Products } from "src/products/entities/product.entity";

// Decorator class 
@Entity('categories')
export class Category{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar' , length: 100})
    name: string;

    @Column({type: 'text' , nullable: true})
    description: string;
    
    @Column({ nullable : true})
    image: string; // new field for image path

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt : Date;

    // Link One To Many => products
    @OneToMany(() => Products, product => product.category)
    products: Products[];
    
}