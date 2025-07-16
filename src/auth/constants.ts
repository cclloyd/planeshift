import { dotEnv } from '../env.js';

export const jwtConstants = {
    secret: dotEnv.SECRET_KEY,
};
