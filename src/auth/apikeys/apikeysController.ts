import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiKeysService } from './apikeys.service.js';
import { CreateApikeyDto } from './dto/create-apikey.dto.js';
import { UpdateApikeyDto } from './dto/update-apikey.dto.js';
import { ApiAuthGuard } from '../api.guard.js';
import { User, UserDocument } from '../users/schemas/users.schema.js';
import { ReqUser } from '../user.decorator.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiKey } from './schemas/apikeys.schema.js';

@UseGuards(ApiAuthGuard)
@Controller('auth/apikeys')
export class ApiKeysController {
    constructor(
        private readonly apikeysService: ApiKeysService,
        @InjectModel(ApiKey.name) private userModel: Model<User>,
    ) {}

    @Post()
    create(@Body() createApikeyDto: CreateApikeyDto) {
        return this.apikeysService.create(createApikeyDto);
    }

    @Get()
    findAll() {
        return this.apikeysService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.apikeysService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateApikeyDto: UpdateApikeyDto) {
        return this.apikeysService.update(id, updateApikeyDto);
    }

    @Get(':id/rotate')
    async rotate(@ReqUser() user: UserDocument, @Param('id') id: string) {
        const apiKey = await this.apikeysService.findOne(`${id}`);
        if (!apiKey) throw new UnauthorizedException('Not authorized to rotate this API key');
        // eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions
        if (!apiKey || `${apiKey.user}` !== `${user._id}`) throw new UnauthorizedException('Not authorized to rotate this API key');
        return this.apikeysService.rotate(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.apikeysService.remove(id);
    }
}
