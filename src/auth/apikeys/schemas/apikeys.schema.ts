import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema()
export class ApiKey {
    @ApiProperty({ description: 'ID of the user to associate with this API key', type: String, example: '507f1f77bcf86cd799439011' })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user: Types.ObjectId;

    @ApiProperty({
        description: 'Custom API token (32-character hexadecimal). If omitted, a token will be generated automatically.',
        required: false,
        example: 'a3f5e8b0c1d2f3a4b5c6d7e8f9a0b1c2',
    })
    @Prop({ required: true, default: () => ApiKey.generateToken() })
    token: string;

    static generateToken(): string {
        return randomBytes(32).toString('hex').slice(0, 32);
    }
}

export const ApiKeysSchema = SchemaFactory.createForClass(ApiKey);
