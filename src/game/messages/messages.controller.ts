import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { FoundryService } from '../../foundry/foundry.service.js';

@Controller()
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
        private readonly foundry: FoundryService,
    ) {}

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const messages = (await this.foundry.runFoundry(() => {
            return [...game.data!.messages!].reverse();
        })) as Messages[];

        const pageNumber = +page;
        const limitNumber = +limit;

        // Calculate start and end indices for slicing the messages array
        const startIndex = (pageNumber - 1) * limitNumber;
        const endIndex = startIndex + limitNumber;

        // Slice the messages array to get the paginated results
        const paginatedMessages = messages.slice(startIndex, endIndex);

        return {
            data: paginatedMessages,
            total: messages.length,
            page: pageNumber,
            limit: limitNumber,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return (await this.foundry.runFoundry((messageId: string) => {
            const message = game.messages!.get(messageId);
            return {
                ...message,
                _id: message!._id,
            } as ChatMessage;
        }, id)) as ChatMessage[];
    }
}
