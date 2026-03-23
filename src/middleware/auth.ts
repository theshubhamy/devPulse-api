import { Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { config } from '../config/env.js';
import { AuthContext } from '../types/hono.js';
import { errorResponse } from '../utils/response.js';

export const authMiddleware = async (c: AuthContext, next: Next) => {
    const jwtSecret = config.jwtSecret;

    const authHeader = c.req.header('Authorization');
    const token = authHeader ? authHeader.split(' ')[1] : getCookie(c, 'auth_token');

    if (!token) {
        return errorResponse(c, 'No authentication token found', 401, 'MISSING_TOKEN');
    }

    try {
        const payload = await verify(token, jwtSecret, 'HS256');

        if (!payload || !payload.organizationId) {
            return errorResponse(c, 'Token missing organization context', 401, 'AUTH_SCOPING_ERROR');
        }

        // Set easy-access context variables
        c.set('userId', payload.userId as string);
        c.set('organizationId', payload.organizationId as string);
        c.set('userEmail', payload.email as string);
        c.set('userRole', payload.role as string);
        c.set('jwtPayload', payload);
        const requestId = c.get('requestId')

        console.log(`[Auth Success] Request ID: ${requestId} | User: ${payload.userId} | Org: ${payload.organizationId}`);

        return await next();
    } catch (err: any) {
        console.error(`Auth Error: ${err.message}`);

        if (getCookie(c, 'auth_token')) {
            const { setCookie } = await import('hono/cookie');
            setCookie(c, 'auth_token', '', { maxAge: 0 });
        }

        return errorResponse(c, err.message || 'Invalid or expired token', 401, 'AUTH_ERROR');
    }
};
