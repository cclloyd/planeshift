import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiKeysService } from './apikeys.service.js';
import { CreateApikeyDto } from './dto/create-apikey.dto.js';
import { UpdateApikeyDto } from './dto/update-apikey.dto.js';
import { ApiAuthGuard } from '../api.guard.js';

@UseGuards(ApiAuthGuard)
@Controller('auth/apikeys')
export class ApiKeysController {
    constructor(private readonly apikeysService: ApiKeysService) {}

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

    @Patch(':id')
    rotate(@Param('id') id: string) {
        return this.apikeysService.rotate(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.apikeysService.remove(id);
    }
}
