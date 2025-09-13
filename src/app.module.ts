import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigTestService } from './config-test.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule , ConfigService } from '@nestjs/config'; // global can you use in any where
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
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
        autoLoadEntities: true,
        synchronize: true,  // Disable in production 
      }),
    }),

    UsersModule, // Register Users Module
    CategoriesModule, // Register Categories Module 
    ProductsModule, // Register Products Module

  ],
  controllers: [AppController],
  providers: [AppService , ConfigTestService],
})
export class AppModule {}
