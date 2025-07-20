import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsMongoId, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'balthazar', description: 'Unique username' })
    @IsString()
    @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Username can only contain letters, numbers, underscores, and dashes' })
    username: string;

    @ApiProperty({ example: 'balthazar@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'https://cdn.example.com/avatar.png',
        description: 'URL of the user avatar.  If omitted, gravatar will be used.',
        required: false,
    })
    @IsOptional()
    @IsUrl()
    avatar?: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'Discord user ID',
        required: false,
    })
    @IsOptional()
    @IsMongoId()
    discord_id?: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'OIDC subject identifier',
        required: false,
    })
    @IsOptional()
    @IsString()
    oidc_id?: string;

    @ApiProperty({
        example: false,
        description: 'Whether this user is a GM account in the game.',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    is_gm?: boolean;

    @ApiProperty({
        example: false,
        description: 'Whether this user is a superuser (bypasses any permission checks)',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    is_superuser?: boolean;
}
