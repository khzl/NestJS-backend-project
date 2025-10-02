import {
  Controller,
  Body,
  Post,
  Get,
  Param,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // -----------------------------
  // 1) Create user (public signup -> forced to CUSTOMER role)
  // -----------------------------
  @Post()
  @ApiOperation({ 
      summary: 'Create a new user',
      description: 'Public signup — creates CUSTOMER by default' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201,
    description:'User successfully created',
    type: User 
    })
  @ApiResponse({ 
    status: 409,
    description:'Email already exists'
    })
  async create(@Body() createUserDto: CreateUserDto) {

    return this.usersService.createUser(createUserDto);
  }

  // -----------------------------
  // 2) Get all users (public/paginated)
  // -----------------------------
  @Get()
  @ApiOperation({ 
    summary: 'Get All Users',
    description: 'Retrieves paginated list of users' })
  @ApiQuery({ 
    name: 'page',
    required: false,
    description: 'Page number (default: 1)' })
  @ApiQuery({ 
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)' })
  @ApiResponse({ 
    status: 200,
    description: 'List of users retrieved successfully',
    type: [User] })
  async getAll(@Query() queryUserDto: QueryUserDto): Promise<User[]> {

    return this.usersService.GetAllUsers(queryUserDto);
  }

  // -----------------------------
  // Authenticated routes that *delegate authorization to the service*
  // Each route here uses JwtAuthGuard to ensure the request is authenticated.
  // The UsersService methods will throw ForbiddenException when appropriate.
  // -----------------------------

  @UseGuards(JwtAuthGuard)
  @Get('customer-only')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Customer-only route',
    description: 'Accessible only by customers' })
  async customerOnly(@CurrentUser() user: User) {
    return this.usersService.customerOnly(user);
  }


  @UseGuards(JwtAuthGuard)
  @Get('admin-only')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Admin-only route',
    description: 'Accessible only by admins' })
  async adminOnly(@CurrentUser() user: User) {
    return this.usersService.adminOnly(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('super-admin-only')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Super Admin-only route',
    description: 'Accessible only by super admins' })
  async superAdminOnly(@CurrentUser() user: User) {
    return this.usersService.superAdminOnly(user);
  }


  @UseGuards(JwtAuthGuard)
  @Get('protected')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Protected Route',
    description: 'Requires valid JWT token' })
  @ApiResponse({ 
    status: 200,
    description: 'Access granted with valid token',
    type: User })
  async protectedRoute(@CurrentUser() user: User) {
    return this.usersService.protectedRoute(user);
  }


  @UseGuards(JwtAuthGuard)
  @Get('admin-or-super-admin')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Admin or Super Admin route',
    description: 'Accessible by Admin or Super Admins' })
  async adminOrSuperAdmin(@CurrentUser() user: User) {
    return this.usersService.adminOrSuperAdmin(user);
  }


  // -----------------------------
  // Profile - returns tailored profile depending on role
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get User profile',
    description: 'Accessible for CUSTOMER, ADMIN, and SUPER_ADMIN roles. Requires JWT authentication.',
  })
  async getProfile(@CurrentUser() user: User) {
    // UsersService centralizes logic to decide which fields/extra info
    return this.usersService.getProfile(user);
  }

  // -----------------------------
  // Optional auth route: user may be null
  // -----------------------------
  @UseGuards(OptionalJwtAuthGuard)
  @Get('optional-auth')
  @ApiOperation({ 
    summary: 'Optional Auth Route',
    description: 'Works with or without JWT token' })
  async optionalAuth(@CurrentUser() user?: User) {
    return this.usersService.optionalAuth(user);
  }

  // -----------------------------
  // Get one user by id: service enforces that customers can only fetch their own data
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get User By ID',
    description: 'Retrieves a single user by their ID' })
  @ApiResponse({ 
    status: 200,
    description: 'User found',
    type: User })
  async getOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.usersService.GetOneUser(id, user);
  }

  // -----------------------------
  // Update user: customers can update only themselves; admins/super-admins may update others.
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update User', 
    description: 'Updates user details by ID' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: User) {
    return this.usersService.updateUser(id, updateUserDto, user);
  }

  // -----------------------------
  // Delete user: service applies role rules (who can delete whom)
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete User',
    description: 'Delete a user by ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User): Promise<void> {
    await this.usersService.remove(id, user);
  }
}
