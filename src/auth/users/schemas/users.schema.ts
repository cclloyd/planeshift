import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: '64b8f9e1a2c4d5f6b7c8d9e0',
    })
    id: string;

    @ApiProperty({
        description: 'The user’s chosen username',
        example: 'balthazar',
    })
    @Prop({ required: true })
    username: string;

    @ApiProperty({
        description: 'User email address',
        example: 'balthazar@example.com',
    })
    @Prop({ required: true })
    email: string;

    @ApiProperty({
        description: 'URL of the user avatar. If omitted, a gravatar is used',
        example: 'https://cdn.example.com/avatar.png',
        required: false,
    })
    @Prop()
    avatar?: string;

    @ApiProperty({
        description: 'Discord user ID',
        example: '507f1f77bcf86cd799439011',
        required: false,
    })
    @Prop()
    discord_id?: string;

    @ApiProperty({
        description: 'OIDC subject identifier',
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false,
    })
    @Prop()
    oidc_id?: string;

    @ApiProperty({
        description: 'Whether this user is a GM account in the game',
        example: false,
        required: false,
    })
    @Prop()
    is_gm?: boolean = false;

    @ApiProperty({
        description: 'Whether this user is a superuser (bypasses any permission checks)',
        example: false,
        required: false,
    })
    @Prop()
    is_superuser?: boolean = false;
}

export const UsersSchema = SchemaFactory.createForClass(User);
