import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FoundryService } from '../../foundry/foundry.service.js';
import { ChatMessageType, PaginatedMessages } from './types.js';

export interface GetPaginatedMessagesOptions {
    page?: number;
    limit?: number;
    links?: boolean;
    order?: 'asc' | 'desc';
    type?: ChatMessageType;
    whispers?: boolean;
}

@Injectable()
export class MessagesService {
    constructor(private readonly foundry: FoundryService) {}

    async paginateResults(
        input: unknown[],
        page: number = 1,
        limit: number = 100,
        links: boolean = false,
        order: 'asc' | 'desc' = 'desc',
        type: ChatMessageType = ChatMessageType.ALL,
        whispers = true,
    ) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        let filtered = order === 'asc' ? input.reverse() : input;

        // Filter out messages based on their types
        if (!whispers) filtered = filtered.filter((message: ChatMessage) => message.whisper.length === 0);
        if (type !== ChatMessageType.ALL) {
            if (type === ChatMessageType.CHAT) filtered = filtered.filter((message: ChatMessage) => message.rolls.length === 0);
            else if (type === ChatMessageType.ROLLS) filtered = filtered.filter((message: ChatMessage) => message.rolls.length > 0);
            else if (type === ChatMessageType.IC) filtered = filtered.filter((message: ChatMessage) => message.speaker.actor !== null);
            else if (type === ChatMessageType.OOC) filtered = filtered.filter((message: ChatMessage) => message.speaker.actor === null);
        }

        const paginated = filtered.slice(startIndex, endIndex);
        if (links) {
            const game = (await this.foundry.runFoundry(() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                return game.data;
            })) as Game.Data;

            const scenes = game.scenes! as unknown as Scene[];
            const actors = game.actors! as unknown as Actor[];
            const tokens = Array.from(
                game
                    .scenes!.flatMap((scene) => scene.tokens)
                    .reduce((map, token) => map.set(token._id, token), new Map())
                    .values(),
            ) as unknown as Token[];

            const uniqueScenes = new Set<Scene>();
            const uniqueActors = new Set<Actor>();
            const uniqueTokens = new Set<Token>();

            paginated.forEach((message: ChatMessage) => {
                if (message.speaker?.scene) uniqueScenes.add(scenes.filter((scene) => scene._id === message.speaker.scene)[0]);
                if (message.speaker?.scene) uniqueActors.add(actors.filter((actor) => actor._id === message.speaker.actor)[0]);
                if (message.speaker?.scene) {
                    uniqueTokens.add(
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        tokens.filter((token) => token._id === message.speaker.token)[0],
                    );
                }
            });

            return {
                data: paginated,
                length: paginated.length,
                total: filtered.length,
                page: page,
                totalPages: Math.ceil(filtered.length / limit),
                limit: limit,
                links: {
                    scenes: Array.from(uniqueScenes).reduce(
                        (map, scene) => {
                            if (scene._id) map[scene._id] = scene;
                            return map;
                        },
                        {} as Record<string, Scene>,
                    ),
                    actors: Array.from(uniqueActors).reduce(
                        (map, actor) => {
                            if (actor._id) map[actor._id] = actor;
                            return map;
                        },
                        {} as Record<string, Actor>,
                    ),
                    tokens: Array.from(uniqueTokens).reduce(
                        (map, token) => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            if (token._id) map[token._id] = token;
                            return map;
                        },
                        {} as Record<string, Token>,
                    ),
                },
            } as PaginatedMessages;
        }
        return {
            data: paginated.reverse(),
            length: paginated.length,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
            page: page,
            limit: limit,
        } as PaginatedMessages;
    }

    async getAllMessages(options: GetPaginatedMessagesOptions = {}) {
        const _start = new Date();
        const { page = 1, limit = 100, links = false, order = 'desc', type = ChatMessageType.ALL, whispers = true } = options;
        const messages = (await this.foundry.runFoundry(() => {
            //return game.data!.messages!;
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            // TODO: Get in browser paginate function working
            // TODO: Then once it works, define a type for the in game window to put helper functions on
            return window.paginateRaw(game.data!.messages!, page, limit, order, type);
        })) as ChatMessage[];
        const _end = new Date();
        console.log(`getAllMessages took ${_end.getTime() - _start.getTime()}ms`);
        return messages;
        // TODO: See if its faster to inject a paginate callback into the page onPageLoad then pass in paginate query params to the runFoundry function to get a smaller list back vs parsing the list ourselves
        const paginated = this.paginateResults(messages, page, limit, links, order, type, whispers);
        // const _end = new Date();
        // console.log(`getAllMessages took ${_end.getTime() - _start.getTime()}ms`);
        return paginated;
    }

    async getMessage(id: string) {
        const message = (await this.foundry.runFoundry((messageId: string) => {
            return game.messages!.get(messageId) ?? game.messages!.getName(messageId);
        }, id)) as ChatMessage;
        if (!message) throw new HttpException(`Message ${id} not found.`, HttpStatus.NOT_FOUND);
        return message;
    }
}
