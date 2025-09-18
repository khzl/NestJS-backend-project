import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { uploadDirectories } from './config/upload-paths';

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

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
