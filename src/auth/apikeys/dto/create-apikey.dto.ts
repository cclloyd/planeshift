import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, IsMongoId, IsHexadecimal } from 'class-validator';
import { Types } from 'mongoose';

export class CreateApikeyDto {
    @ApiProperty({ description: 'ID of the user to associate with this API key', type: String, example: '507f1f77bcf86cd799439011' })
    @IsNotEmpty()
    @IsMongoId()
    user: string | Types.ObjectId;

    @ApiProperty({
        description: 'Custom API token (32-character hexadecimal). If omitted, a token will be generated automatically.',
        required: false,
        example: 'a3f5e8b0c1d2f3a4b5c6d7e8f9a0b1c2',
    })
    @IsOptional()
    @IsString()
    @Length(32, 32)
    @IsHexadecimal()
    token?: string;
}
