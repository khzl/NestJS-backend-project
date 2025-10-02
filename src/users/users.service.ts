// ============================================================
// File: users.service.ts
// Purpose: All business logic lives here: role checks, permission
// decisions, hashing, data shaping (profile fields), and repository
// interactions.
// ============================================================

import { Injectable , NotFoundException , ConflictException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User , UserRole } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { QueryUserDto } from "./dto/query-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { emitWarning, permission } from "process";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>){}

    // helper small role check utility (centralizes ForbiddenException Throwing)
    private ensureHasOneOfRole(actor: User | undefined, ...allowedRoles: UserRole[]){
        if (!actor){
            throw new ForbiddenException('No authenticated user provided');
        }

        if (!allowedRoles.includes(actor.role)){
            throw new ForbiddenException('Insufficient Role privileges');
        }
    }



    // 1- create User
    async createUser(createUserDto: CreateUserDto, creator?: User): Promise<User>{
        const { email , name , password , role } = createUserDto;


        const existingUser = await this.userRepository.findOne({
            where: { email: email },
        });

        if (existingUser){
            throw new ConflictException('Email already existing');
        }

        let assignedRole = UserRole.CUSTOMER;
        if (role && role != UserRole.CUSTOMER){
            // if there is no creator or creator is not admin/super admin => deny
            if(!creator || (creator.role !== UserRole.ADMIN && 
                creator.role !== UserRole.SUPER_ADMIN)){
                    throw new ForbiddenException('Only admin or super admin can assign elevated roles');
                }
                assignedRole = role; // safe because creator is authorized 
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = this.userRepository.create({
            email : email.trim(),
            name: name.trim(),
            role: assignedRole,
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
    async GetOneUser(id: number, CurrentUser: User): Promise<User>{
        
        const user = await this.userRepository.findOne(
            {where: {id:id}});

        if (!user) {
            throw new NotFoundException(`user with id: ${id} not found`);
        }

        if (CurrentUser.role === UserRole.CUSTOMER && CurrentUser.id !== id){
            throw new ForbiddenException('Customer can only view their own data');
        }

        return user;
    }

    // 4- update User
    async updateUser(id: number, updateUserDto: UpdateUserDto,
        CurrentUser?: User): Promise<User>{

        const {name, email, password, role} = updateUserDto;

        const userToUpdate = await this.userRepository.findOne({
            where: {id:id}
        });

        if (!userToUpdate){
            throw new NotFoundException(`User with id: ${id} Not Found`);
        }

        // if caller is provided , apply permission rules
        if (CurrentUser){
            if(CurrentUser.role === UserRole.CUSTOMER && CurrentUser.id !== id){
                throw new ForbiddenException('Customers can only update their own profile');
            }

            // role changes are sensitive - only admin/super-admin allowed
            if (role && role !== userToUpdate.role && !(CurrentUser.role === UserRole.ADMIN || CurrentUser.role === UserRole.SUPER_ADMIN)){
                throw new ForbiddenException('only admin or super admin can change user roles');
            }
        } else {
            // if there's no authenticated caller (should not happen for this route ) deny changes to role 
            if (role && role !== userToUpdate.role){
                throw new ForbiddenException('Role change requires authentication and admin privileges');
            }
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
    async remove(id: number,CurrentUser: User): Promise<void>{
        const userToRemove = await this.userRepository.findOne(
            {where:{id:id}});
        
        if (!userToRemove){
            throw new NotFoundException(`user with id ${id} Not Found`);
        }

        // if target is super admin , only a super admin can remove them 
        if (userToRemove.role === UserRole.SUPER_ADMIN && CurrentUser.role !== UserRole.SUPER_ADMIN){
            throw new ForbiddenException('only super-admin can delete a super-admin');
        }

        // if caller is a customer and not deleting themselves -> forbidden
        if (CurrentUser.role === UserRole.CUSTOMER && CurrentUser.id !== id){
            throw new ForbiddenException('Customers can only delete their own account');
        }
        await this.userRepository.remove(userToRemove);
        return;
    }

    // -----------------------------
    // Convenience read-only endpoints that encapsulate role-based messages
    // These are small helpers that show how to centralize role logic in service
    // -----------------------------

    async customerOnly(user : User){
        this.ensureHasOneOfRole(user, UserRole.CUSTOMER);
        return {
            message: 'Customer access granted',
            user: {
                id: user.id,
                email: user.email,
            }
        };
    }
    
    async adminOnly(user : User){
        this.ensureHasOneOfRole(user, UserRole.ADMIN);
        return {
            message: 'Admin access granted',
            user: {
                id: user.id,
                email: user.email,
            }
        };
    }

    async superAdminOnly(user : User){
        this.ensureHasOneOfRole(user, UserRole.SUPER_ADMIN);
        return {
            message: 'Super Admin access granted',
            user: {
                id: user.id,
                email: user.email,
            }
        };
    }

    async protectedRoute(user: User){
        // simple example : ensure authenticated 
        if (!user)
            throw new ForbiddenException('Authentication required');

        return {
            message: 'this is protected',
            user : user.email
        };
    }

    async adminOrSuperAdmin(user: User) {

      this.ensureHasOneOfRole(user, UserRole.ADMIN, UserRole.SUPER_ADMIN);

      return { 
        message: 'Access granted (Admin or Super Admin)',
        user: { 
            id: user.id,
            role: user.role
        }
    };

    }

    // -----------------------------
    // Profile builder — central place that decides which fields to expose
    // -----------------------------
    async getProfile(user: User){
        if (!user)
            throw new ForbiddenException('Authentication required to fetch profile');

        if (user.role === UserRole.CUSTOMER){
            return {
                message: 'Customer Profile Data',
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
        }

        if (user.role === UserRole.ADMIN){
            return {
                message: 'Admin Profile Data',
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permission:['manage-users', 'view_reports','moderate_content'],
            };
        }

        if (user.role === UserRole.SUPER_ADMIN){
            return {
                message: 'Super Admin Profile Data',
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permission: ['manage_admins','system_settings','access_logs','all_permissions'],
            };
        }

        return {
            message: 'Unknown role',
            user
        };
    }

    // -----------------------------
    // Optional auth route helper
    // -----------------------------

    async optionalAuth(user?: User){
        return{
            message: user ? 'Authenticated user' : 'Anonymous user',
            user: user?.email || null,
        };
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