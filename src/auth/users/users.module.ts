import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from './schemas/users.schema.js';
import { ApiKey, ApiKeysSchema } from '../apikeys/schemas/apikeys.schema.js';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]), MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeysSchema }])],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
