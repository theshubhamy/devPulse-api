import { jwt } from 'hono/jwt';
import { env } from 'hono/adapter';

export const authMiddleware = (c: any, next: any) => {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
    return jwt({
        secret: JWT_SECRET,
        alg: 'HS256',
        cookie: 'auth_token',
    })(c, next);
};
