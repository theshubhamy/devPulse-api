import { env } from 'hono/adapter';
import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

export const authMiddleware = async (c: Context, next: Next) => {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);

    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment');
        return c.json({ error: 'Internal Server Error (Auth)' }, 500);
    }

    const authHeader = c.req.header('Authorization');
    const token = authHeader ? authHeader.split(' ')[1] : getCookie(c, 'auth_token');

    if (!token) {
        return c.json({ error: 'Unauthorized', message: 'No authentication token found', code: 'MISSING_TOKEN' }, 401);
    }

    try {
        const payload = await verify(token, JWT_SECRET, 'HS256');

        // Critical scoping check: All requests must belong to an organization
        if (!payload || !payload.organizationId) {
            return c.json({
                error: 'Unauthorized',
                message: 'Token missing organization context',
                code: 'AUTH_SCOPING_ERROR'
            }, 401);
        }

        // Set easy-access context variables
        c.set('userId', payload.userId);
        c.set('organizationId', payload.organizationId);
        c.set('userEmail', payload.email);
        c.set('userRole', payload.role);
        c.set('jwtPayload', payload);

        console.log(`[Auth Success] User: ${payload.userId} | Org: ${payload.organizationId}`);

        return await next();
    } catch (err: any) {
        console.error(`Auth Error: ${err.message}`);

        if (getCookie(c, 'auth_token')) {
            const { setCookie } = await import('hono/cookie');
            setCookie(c, 'auth_token', '', { maxAge: 0 });
        }

        return c.json(
            {
                error: 'Unauthorized',
                message: err.message || 'Invalid or expired token',
                code: 'AUTH_ERROR'
            },
            401
        );
    }
};
