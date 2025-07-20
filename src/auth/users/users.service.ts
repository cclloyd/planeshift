import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from './schemas/users.schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ApiKey } from '../apikeys/schemas/apikeys.schema.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const newUser = await this.userModel.create(createUserDto);
        await this.apiKeyModel.create({ user: newUser._id });
        return newUser;
    }

    findAll() {
        return this.userModel.find();
    }

    findOne(filter: string | Types.ObjectId | UpdateUserDto) {
        const query = typeof filter === 'string' ? { _id: filter } : filter;
        return this.userModel.findOne(query);
    }

    findOneByDiscord(id: string) {
        return this.userModel.findOne({ discord_id: id });
    }

    findOneByOidc(id: string) {
        return this.userModel.findOne({ oidc_id: id });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        return this.apiKeyModel.updateOne({ _id: id }, updateUserDto);
    }

    async remove(id: string | Types.ObjectId | UpdateUserDto) {
        const user = await this.userModel.findOne({ _id: id });
        if (!user) throw new HttpException(`User ${id} not found.`, HttpStatus.NOT_FOUND);
        await this.apiKeyModel.deleteOne({ user: user._id });
        return this.userModel.deleteOne({ _id: id });
    }
}
