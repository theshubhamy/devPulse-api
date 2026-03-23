import { Context } from 'hono';

export const successResponse = (c: Context, data: any, message = 'Success', status = 200) => {
  return c.json({
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString(),
  }, status as any);
};

export const errorResponse = (c: Context, message: string, status = 400, code = 'ERROR') => {
  return c.json({
    status: 'error',
    message,
    code,
    timestamp: new Date().toISOString(),
  }, status as any);
};
