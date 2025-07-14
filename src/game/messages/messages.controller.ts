import { Controller, Get, Param, ParseBoolPipe, ParseEnumPipe, ParseIntPipe, Query } from '@nestjs/common';
import { MessagesService } from './messages.service.js';

@Controller()
export class MessagesController {
    constructor(private readonly messages: MessagesService) {}

    @Get()
    async findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
        @Query('links', new ParseBoolPipe({ optional: true })) links: boolean = false,
        @Query('order') order: 'asc' | 'desc' = 'desc',
    ) {
        return await this.messages.getAllMessages(page, limit, links, order);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.messages.getMessage(id);
    }
}
