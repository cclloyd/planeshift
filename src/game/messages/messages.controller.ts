import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { ApiAuthGuard } from '../../auth/api.guard.js';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { ChatMessageType } from './types.js';

@ApiSecurity('tokenAuth')
@UseGuards(ApiAuthGuard)
@Controller()
export class MessagesController {
    constructor(private readonly messages: MessagesService) {}

    @Get()
    @ApiOperation({ summary: 'Get all messages', description: 'Retrieve a paginated list of chat messages.' })
    @ApiOkResponse({ description: 'Array of messages.', isArray: true })
    @ApiQuery({
        name: 'type',
        enum: ChatMessageType,
        description: [
            'Filter by message type:',
            '- all: all messages',
            '- chat: only chat messages',
            '- rolls: only roll messages',
            "- ic: both 'chat' and 'rolls' messages",
            '- ooc: only out-of-character messages',
        ].join('\n'),
        required: false,
        example: ChatMessageType.ALL,
    })
    async findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
        @Query('links', new ParseBoolPipe({ optional: true })) links: boolean = false,
        @Query('order') order: 'asc' | 'desc' = 'desc',
        @Query('type') type: ChatMessageType = ChatMessageType.ALL,
        @Query('whispers') whispers: boolean = true,
    ) {
        return await this.messages.getAllMessages({ page, limit, links, order, type, whispers });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a message', description: 'Retrieve a single message by its ID.' })
    @ApiOkResponse({ description: 'Message details.' })
    async findOne(@Param('id') id: string) {
        return this.messages.getMessage(id);
    }
}
