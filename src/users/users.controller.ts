import { 
    Controller,
    Body,
    Post,
    Get,
    Param,
    Delete,
    Put,
    Query,
    ParseIntPipe, 
    Patch,
    HttpCode,
    HttpStatus
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { QueryUserDto } from "./dto/query-user.dto";
import { User } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";


@Controller('users')
export class UsersController{
    constructor(private readonly usersService: UsersService){}

    // 1- create user 
    @Post()
    async create(@Body() createUserDto: CreateUserDto){
        return this.usersService.createUser(createUserDto);
    }

    // 2- get all user
    @Get()
    async getAll(@Query() queryUserDto:QueryUserDto): Promise<User[]>{
        return this.usersService.GetAllUsers(queryUserDto);
    }

    // 3- get one user 
    @Get(':id')
    async getOne(@Param('id' , ParseIntPipe) id: number):Promise<User | null>{
        return this.usersService.GetOneUser(id);
    }
    
    // 4- update user 
    @Patch(':id')
    async update(@Param('id' , ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto): Promise<User>{
        return this.usersService.updateUser(id, updateUserDto);
    }

    // 5- remove user
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT) // this is for best practice
    async remove(@Param('id' , ParseIntPipe) id: number): Promise<void>{
        await this.usersService.remove(id);
    }
    
}