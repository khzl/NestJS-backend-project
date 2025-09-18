import {
Entity,
Column,
PrimaryGeneratedColumn,
CreateDateColumn,
UpdateDateColumn,
ManyToOne,
JoinColumn
} from 'typeorm';
import { Products } from 'src/products/entities/product.entity'; // link Products Table

@Entity('product_images')
export class ProductImages{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'product_id'})
    productId: number; // foreign key 

    @Column({name: 'image_url', type: 'text'})
    imageUrl: string;

    @Column({name: 'is_primary',type:'boolean',default:false})
    isPrimary: boolean;

    @Column({name: 'alt_text',type: 'varchar',length: 255 , nullable: true})
    altText: string;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;

    // Relation Products And Product_images
    @ManyToOne(() => Products, product => 
    product.productImages,{onDelete: 'CASCADE'})
    @JoinColumn({name: 'product_id'})
    product: Products;

}