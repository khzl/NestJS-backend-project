import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigTestService } from './config-test.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule , ConfigService } from '@nestjs/config'; // global can you use in any where
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ProductImagesModule } from './product_images/product_images.module';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Products } from './products/entities/product.entity';
import { ProductImages } from './product_images/entities/product_images.entity';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/Middleware/logger.middleware';
@Module({
  imports: [
    // Load File .env 
    ConfigModule.forRoot({
      isGlobal: true, // ConfigService public in all project 
    }),

    // database connection 
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PG_HOST'),
        port: configService.get<number>('PG_PORT'),
        username: configService.get<string>('PG_USERNAME'),
        password: configService.get<string>('PG_PASSWORD'),
        database: configService.get<string>('PG_DATABASENAME'),
        entities: [User,Category,Products,ProductImages],
        autoLoadEntities: true,
        synchronize: true,  // Disable in production 
      }),
    }),
    TypeOrmModule.forFeature([User,Category,Products,ProductImages]),
    UsersModule, // Register Users Module
    CategoriesModule, // Register Categories Module 
    ProductsModule, // Register Products Module
    ProductImagesModule, // Register Product Images Module 
    AuthModule, // Register Auth Module
  ],
  controllers: [AppController],
  providers: [AppService , ConfigTestService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes('*');
  }
  
}
