import { ConflictException, Injectable } from '@nestjs/common';
import { CreateApikeyDto } from './dto/create-apikey.dto';
import { UpdateApikeyDto } from './dto/update-apikey.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKey } from './schemas/apikeys.schema.js';

@Injectable()
export class ApiKeysService {
    constructor(@InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>) {}

    async create(createApikeyDto: CreateApikeyDto) {
        try {
            return await this.apiKeyModel.create(createApikeyDto);
        } catch (err: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (err.code === 11000) {
                // 11000 is the Mongo duplicate‐key code
                throw new ConflictException(`User already has an API key.`);
            }
            throw err;
        }
    }

    async findAll() {
        return `This action returns all apikeys`;
    }

    async findOne(filter: string | UpdateApikeyDto) {
        const query = typeof filter === 'string' ? { _id: filter } : filter;
        return this.apiKeyModel.findOne(query);
    }

    async update(id: string, updateApikeyDto: UpdateApikeyDto) {
        return this.apiKeyModel.updateOne({ _id: id }, updateApikeyDto);
    }

    async rotate(id: string | Types.ObjectId) {
        return this.apiKeyModel.updateOne({ _id: id }, { token: ApiKey.generateToken() });
    }

    async remove(id: string) {
        return this.apiKeyModel.deleteOne({ _id: id });
    }
}
