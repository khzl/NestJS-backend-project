import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ConfigTestService{
    constructor(private configService: ConfigService) {}

    GetDatabaseConfig(){
        return{
            database: this.configService.get<string>('PG_DATABASENAME', ''),
        };
    }
}