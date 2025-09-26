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
    HttpStatus,
    ForbiddenException
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { QueryUserDto } from "./dto/query-user.dto";
import { User, UserRole } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { OptionalJwtAuthGuard } from "src/auth/guards/optional-jwt-auth.guard";
import 
{ 
    ApiOperation,
    ApiQuery,
    ApiBody,
    ApiResponse,
    ApiTags,
    ApiBearerAuth,
} 
from "@nestjs/swagger";
import { useContainer } from "class-validator";
@ApiTags('Users')
@Controller('users')
export class UsersController{
    constructor(private readonly usersService: UsersService){}

// 1- create user 
@Post()
@ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user account'
})
@ApiBody({ type: CreateUserDto })
@ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User
})
@ApiResponse({
    status: 409,
    description: 'Email already exists'
})
async create(@Body() createUserDto: CreateUserDto){
    return this.usersService.createUser(createUserDto);
}

// 2- get all user

@Get()
@ApiOperation({
    summary: 'Get All Users',
    description: 'Retrieves paginated list of users'
})
@ApiQuery({
    name:'offset',
    required: false,
    description: 'Pagination offset'
})
@ApiQuery({
    name: 'limit',
    required: false,
    description: 'Pagination limit'
})
@ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [User]
})
async getAll(@Query() queryUserDto:QueryUserDto): Promise<User[]>{
    return this.usersService.GetAllUsers(queryUserDto);
}

// routes for Customer Only 
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.CUSTOMER)
@Get('customer-only')
@ApiBearerAuth()
@ApiOperation({
    summary: 'Customer-only route',
    description: 'Accessible only by customers',
})
async customerOnly(@CurrentUser() user:User){
    return {message: 'Customer access granted' , user}
}

// routes for admin only 
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin-only')
@ApiBearerAuth()
@ApiOperation({
    summary: 'Admin-only route',
    description: 'Accessible only by admins',
})
async adminOnly(@CurrentUser() user:User){
    return { message: 'Admin access granted' , user}
}

// route for super admin only 
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Get('super-admin-only')
@ApiBearerAuth()
@ApiOperation({
    summary: 'Super Admin-only route',
    description: ' Accessible only by super admins',
})
async superAdminOnly(@CurrentUser() user:User){
    return { message: 'Super Admin access granted', user}
}

// Product a route with JWT 
@UseGuards(JwtAuthGuard)
@Get('protected')
@ApiBearerAuth()
@ApiOperation({
    summary: 'Protected Route',
    description: 'Requires valid JWT token'
})
@ApiResponse({
    status: 200,
    description: 'Access granted with valid token',
    type: User
})
@ApiResponse({
    status: 401,
    description: 'Unauthorized'
})
async protectedRoute(@CurrentUser() user: User){
    return { message: 'this is protected', user: user.email};
}

// route more role
// Protected with role-based access 
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Get('admin-or-super-admin')
@ApiBearerAuth()
@ApiOperation({
    summary: 'Admin or Super Admin route',
    description: 'Accessible by Admin or Super Admins'
})
@ApiResponse({
    status: 200,
    description: 'Admin access granted',
    type: User
})
@ApiResponse({
    status: 403,
    description: 'Forbidden - not enough privileges'
})
async adminOrSuperAdmin(@CurrentUser() user: User){
    return { message: 'Access granted (Admin or Super Admin)' , user};
}


// Specific Role For Customer 
// Get Profile For (Customer , Admin , SuperAdmin)
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.CUSTOMER,UserRole.ADMIN,UserRole.SUPER_ADMIN) // all Access
@Get('profile')
@ApiBearerAuth()
@ApiOperation({
    summary: 'Get User profile',
    description: 'Accessible for CUSTOMER, ADMIN, and SUPER_ADMIN roles. Requires JWT authentication.',   
})
@ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: User
})
@ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
})
@ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
})
async getProfile(@CurrentUser() user : User){
    if (user.role === UserRole.CUSTOMER){
        return {
            message: 'Customer Profile data',
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Only data 
        }
    }

    if (user.role === UserRole.ADMIN){
        return {
            message: 'Admin profile data',
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: ['manage_users', 'view_reports','moderate_content'],
        };
    }

    if (user.role === UserRole.SUPER_ADMIN){
        return {
            message: 'Super Admin profile data',
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: ['manage_admins','system_settings','access_logs','all_permissions']
        };
    }

    return {message: 'Unknown role' , user};
}

// Optional auth - user can be null 
@UseGuards(OptionalJwtAuthGuard) // you'd need to create this 
@Get('optional-auth')
@ApiOperation({
    summary: 'Optional Auth Route',
    description: 'Works with or without JWT token'
})
@ApiResponse({
    status: 200,
    description: 'Authenticated user or anonymous response'
})
async optionalAuth(@CurrentUser() user?: User){
    return {
        message: user ? 'Authenticated user' : 'Anonymous user',
        user: user?.email || null
    };
}

// 3- get one user 
@Get(':id')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.CUSTOMER,UserRole.ADMIN,UserRole.SUPER_ADMIN)
@ApiOperation({
    summary: 'Get User By ID',
    description: 'Retrieves a single user by their ID'
})
@ApiResponse({
    status: 200,
    description: 'User found',
    type: User
})
@ApiResponse({
    status: 404,
    description: 'User not found'
})
async getOne(@Param('id' , ParseIntPipe) id: number, @CurrentUser() user: User){
    if (user.role === UserRole.CUSTOMER && user.id !== id){
        throw new ForbiddenException('Customers can only view their own data');
    }
    return this.usersService.GetOneUser(id);
}
    
// 4- update user 
@Patch(':id')
@ApiOperation({
    summary: 'Update User',
    description: 'Updates User details by ID'
})
@ApiBody({
    type: UpdateUserDto
})
@ApiResponse({
    status: 200,
    description: 'User Updated successfully',
    type: User
})
@ApiResponse({
    status: 404,
    description: 'User not found'
})
async update(@Param('id' , ParseIntPipe) id: number,
@Body() updateUserDto: UpdateUserDto): Promise<User>{
    return this.usersService.updateUser(id, updateUserDto);
}

// 5- remove user
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT) // this is for best practice
@ApiOperation({
    summary: 'Delete User',
    description: 'Deleted a user by ID'
})
@ApiResponse({
    status: 204,
    description: 'User deleted successfully (no content)'
})
@ApiResponse({
    status: 404,
    description: 'User not found'
})
async remove(@Param('id' , ParseIntPipe) id: number): Promise<void>{
    await this.usersService.remove(id);
}

}