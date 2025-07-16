export class CreateUserDto {
    id?: string;
    username: string;
    email: string;
    avatar?: string;
    discord_id?: string;
    oidc_id?: string;
}
