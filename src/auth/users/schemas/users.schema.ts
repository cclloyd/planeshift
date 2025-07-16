import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    email: string;

    @Prop()
    avatar: string;

    @Prop()
    discord_id?: string;

    @Prop()
    oidc_id?: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
