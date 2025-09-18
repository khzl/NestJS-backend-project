import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { ProductImages } from 'src/product_images/entities/product_images.entity';
@Entity('products')
export class Products {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar',length: 100})
  name: string;

  @Column({type: 'text'})
  description: string;

  @Column()
  price: number;


  @Column()
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Explicit foreign key column
  @Column({nullable:true})
  categoryId: number;

  // Many products belong to one category
  @ManyToOne(() => Category, category => 
    category.products, {eager: true , onDelete: 'SET NULL'})
  @JoinColumn({ name: 'categoryId'})
  category: Category;


  // one product have many product_images
  @OneToMany(() => ProductImages , productImage => 
  productImage.product, {cascade: true})
  productImages: ProductImages[];

}
