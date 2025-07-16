import { PartialType } from '@nestjs/mapped-types';
import { CreateApikeyDto } from './create-apikey.dto.js';

export class UpdateApikeyDto extends PartialType(CreateApikeyDto) {}
