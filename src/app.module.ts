import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'ecommerce-nestjs',
      autoLoadEntities: true,
      synchronize: true , // Disable in production 
    }),
    UsersModule,
    CategoriesModule, // Register Category Module 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
