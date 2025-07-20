import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../api.guard.js';
import { User, UserDocument } from './schemas/users.schema.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ReqUser } from './user.decorator.js';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('tokenAuth')
@ApiTags('Auth')
@UseGuards(ApiAuthGuard)
@Controller('auth/users')
export class UsersController {
    constructor(
        private readonly users: UsersService,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a user', description: 'Registers a new user.' })
    @ApiCreatedResponse({ description: 'The user has been successfully created.', type: User })
    create(@Body() createUserDto: CreateUserDto) {
        return this.users.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users', description: 'Retrieve a list of all users.' })
    @ApiOkResponse({ description: 'Array of users.', type: User, isArray: true })
    findAll() {
        return this.users.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user', description: 'Retrieve a single user by its ID.' })
    @ApiOkResponse({ description: 'The user details.', type: User })
    findOne(@Param('id') id: string) {
        return this.users.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user', description: 'Update details of an existing user.' })
    @ApiOkResponse({ description: 'The user has been successfully updated.', type: User })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.users.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user', description: 'Remove a user by its ID.' })
    @ApiNoContentResponse({ description: 'User successfully deleted.' })
    remove(@Param('id') id: string) {
        return this.users.remove(id);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user', description: 'Retrieve the currently authenticated user.' })
    @ApiOkResponse({ description: 'Current user data.', type: User })
    findOwnToken(@ReqUser() user: UserDocument) {
        return this.users.remove(user._id);
    }
}
