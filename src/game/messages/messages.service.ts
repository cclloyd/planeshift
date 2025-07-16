import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FoundryService } from '../../foundry/foundry.service.js';
import { PaginatedMessages } from './types.js';

@Injectable()
export class MessagesService {
    constructor(private readonly foundry: FoundryService) {}

    async paginateResults(input: unknown[], page: number = 1, limit: number = 100, links: boolean = false, order: 'asc' | 'desc' = 'desc') {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginated = (order === 'desc' ? input.reverse() : input).slice(startIndex, endIndex);
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
                total: input.length,
                page: page,
                totalPages: Math.ceil(input.length / limit),
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
            total: input.length,
            totalPages: Math.ceil(input.length / limit),
            page: page,
            limit: limit,
        } as PaginatedMessages;
    }

    async getAllMessages(page: number = 1, limit: number = 100, links: boolean = false, order: 'asc' | 'desc' = 'desc') {
        const messages = (await this.foundry.runFoundry(() => {
            return game.data!.messages!;
        })) as ChatMessage[];
        return this.paginateResults(messages, page, limit, links, order);
    }

    async getMessage(id: string) {
        const message = (await this.foundry.runFoundry((messageId: string) => {
            return game.messages!.get(messageId) ?? game.messages!.getName(messageId);
        }, id)) as ChatMessage;
        if (!message) throw new HttpException(`Message ${id} not found.`, HttpStatus.NOT_FOUND);
        return message;
    }
}
