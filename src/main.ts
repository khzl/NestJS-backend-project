import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { uploadDirectories } from './config/upload-paths';
import { SwaggerModule , DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './common/Interceptors/transform.interceptor';
async function bootstrap() {
  
  uploadDirectories.forEach((dir) =>{
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, {recursive:true});
      console.log(`Created Directory: ${dir}`);
    }
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Server static file 
  app.useStaticAssets(join(__dirname, '...' , 'uploads'),{
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('API documentation for the E-Commerce application')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable global Interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
  );

  await app.listen(process.env.PORT ?? 3000);

}

bootstrap();
