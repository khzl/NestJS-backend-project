import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigTestService } from './config-test.service';

@Controller()
export class AppController {
  constructor(
    private readonly configTestService: ConfigTestService,
    private readonly appService: AppService
  ) {}
  
   getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-config')
  GetDatabaseConfig() {
    return this.configTestService.GetDatabaseConfig();
  }
}
