import { Body, Controller, Delete, Get, Param, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiKeysService } from './apikeys.service.js';
import { CreateApikeyDto } from './dto/create-apikey.dto.js';
import { UpdateApikeyDto } from './dto/update-apikey.dto.js';
import { ApiAuthGuard } from '../api.guard.js';
import { UserDocument } from '../users/schemas/users.schema.js';
import { ApiKey } from './schemas/apikeys.schema.js';
import { ReqUser } from '../users/user.decorator.js';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiSecurity('tokenAuth')
@ApiTags('Auth')
@UseGuards(ApiAuthGuard)
@Controller('auth/apikeys')
export class ApiKeysController {
    constructor(
        private readonly apikeysService: ApiKeysService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create an API key', description: 'Generates a new API key for a user.' })
    @ApiCreatedResponse({ description: 'The API key has been successfully created.', type: ApiKey })
    create(@Body() createApikeyDto: CreateApikeyDto) {
        return this.apikeysService.create(createApikeyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all API keys', description: 'Retrieve a list of all API keys.' })
    @ApiOkResponse({ description: 'Array of API keys.', type: ApiKey })
    findAll() {
        return this.apikeysService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an API key', description: 'Retrieve a single API key by its ID.' })
    @ApiOkResponse({ description: 'The API key details.', type: ApiKey })
    findOne(@Param('id') id: string) {
        return this.apikeysService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an API key', description: 'Update details of an existing API key.' })
    @ApiOkResponse({ description: 'The API key has been successfully updated.', type: ApiKey })
    update(@Param('id') id: string, @Body() updateApikeyDto: UpdateApikeyDto) {
        return this.apikeysService.update(id, updateApikeyDto);
    }

    @Get(':id/rotate')
    @ApiOperation({ summary: 'Rotate a users API key', description: 'Invalidates existing keys for a user and generates a new one.' })
    @ApiResponse({
        status: 201,
        description: 'The API key has been successfully rotated.',
        example: '3e048cf92558adb72c61985b624b9b1d',
    })
    async rotate(@ReqUser() user: UserDocument, @Param('id') id: string) {
        const apiKey = await this.apikeysService.findOne(`${id}`);
        if (!apiKey) throw new UnauthorizedException('Not authorized to rotate this API key');
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        if (!apiKey || `${apiKey.user}` !== `${user._id}`) throw new UnauthorizedException('Not authorized to rotate this API key');
        return this.apikeysService.rotate(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an API key', description: 'Remove an API key by its ID.' })
    @ApiNoContentResponse({ description: 'API key successfully deleted.' })
    remove(@Param('id') id: string) {
        return this.apikeysService.remove(id);
    }
}
