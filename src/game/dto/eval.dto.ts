import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenericEvalDto {
    @ApiProperty({ example: '() => { return game.data.actors }', description: 'Javascript function to evaluate in the game console.' })
    @IsString()
    fn: string;

    @ApiProperty({ example: [], description: 'Args to pass to function.' })
    @IsArray()
    @Transform(({ value }): unknown[] => {
        if (typeof value === 'string') return JSON.parse(value) as unknown[];
        if (Array.isArray(value)) return value as unknown[];
        return [];
    })
    args!: unknown[];
}
