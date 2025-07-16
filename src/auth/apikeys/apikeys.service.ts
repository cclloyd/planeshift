import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateApikeyDto } from './dto/create-apikey.dto';
import { UpdateApikeyDto } from './dto/update-apikey.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { ApiKey } from './schemas/apikeys.schema.js';

@Injectable()
export class ApiKeysService {
    constructor(@InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>) {}

    async create(createApikeyDto: CreateApikeyDto) {
        return await this.apiKeyModel.create(createApikeyDto);
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

    async rotate(id: string | MongooseSchema.Types.ObjectId) {
        return this.apiKeyModel.updateOne({ _id: id }, { token: ApiKey.generateToken() });
    }

    async remove(id: string) {
        return this.apiKeyModel.deleteOne({ _id: id });
    }
}
