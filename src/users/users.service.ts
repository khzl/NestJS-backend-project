import { Injectable , NotFoundException , ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User , UserRole } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>){}

    // 1- create User
    async createUser(createUserDto: CreateUserDto): Promise<User>{
        const { email , name , password , role } = createUserDto;

        const existingUser = await this.userRepository.findOne({
            where: { email: email },
        });

        if (existingUser){
            throw new ConflictException('Email already existing');
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = this.userRepository.create({
            email : email,
            name: name,
            role: UserRole.CUSTOMER,
            password: hashedPassword,
        });

        return this.userRepository.save(user);
        // ! I think here it will return the password and this is a security issue 
        //*  the solution for the above security issue is to add @exclude  decorator that excludes the password field
        //*  from being returned whenever there is a user object in the api response even if the password is hashed
    }

    // 2- GetAll User
    async GetAllUsers(queryUserDto:QueryUserDto):Promise<User[]>{
        const {page = 1, limit = 10} = queryUserDto;
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const users = await queryBuilder.getMany();
        return users;
    }


    // 3- Get One User By Id 
    async GetOneUser(id: number): Promise<User | null>{
        const user = await this.userRepository.findOne({where: {id : id},});

        if (!user) {
            throw new NotFoundException(`user with id: ${id} not found`);
        }

        return user;
    }

    // 4- update User
    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User>{
        const {name, email, password, role} = updateUserDto;
        const userToUpdate = await this.userRepository.findOne({
            where: {id:id}
        });
        if (!userToUpdate){
            throw new NotFoundException(`User with id: ${id} Not Found`);
        }

        if (name !== undefined){
            userToUpdate.name = name.trim();
        }

        if (email !== undefined){
            userToUpdate.email = email.trim();
        }
        
        if (password !== undefined){
            const hashedPassword = await bcrypt.hash(userToUpdate.password,10);
            userToUpdate.password = hashedPassword;
        }

        return this.userRepository.save(userToUpdate);
    }

    // 5- remove user 
    async remove(id: number){
        const userToRemove = await this.userRepository.findOne({where:{id:id}});
        
        if (!userToRemove){
            throw new NotFoundException(`user with id ${id} Not Found`);
        }

        return this.userRepository.remove(userToRemove);

    }

    // Add these Method to your existing usersService
    async findById(id: number): Promise<User | null>{
        return await this.userRepository.findOne({where: {id}});
    }

    async findByEmail(email: string): Promise<User | null>{
        return await this.userRepository.findOne({where: {email}});
    }

    async updatePassword(id:number,password:string): Promise<User>{
        const user = await this.userRepository.findOne({where: {id}});

        if (!user){
            throw new Error("User Not Found!");
        }

        user.password = password;
        return this.userRepository.save(user);
    }

    
}

// To Do 
// 1- create user
// 2- get all user
// 3- get one user 
// 4- update user 
// 5- remove user 