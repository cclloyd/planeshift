import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { randomBytes } from 'crypto';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema()
export class ApiKey {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
    user: MongooseSchema.Types.ObjectId;

    @Prop({ required: true, default: () => ApiKey.generateToken() })
    token: string;

    static generateToken(): string {
        return randomBytes(32).toString('hex').slice(0, 32);
    }
}

export const ApiKeysSchema = SchemaFactory.createForClass(ApiKey);
