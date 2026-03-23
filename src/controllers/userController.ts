import { AuthContext } from '../types/hono.js';
import { User } from '../models/user.js';
import { sign } from 'hono/jwt';
import { config } from '../config/env.js';
import { setCookie } from 'hono/cookie';
import { successResponse, errorResponse } from '../utils/response.js';

export class UserController {
  static async getMe(c: AuthContext) {
    const userId = c.get('userId');
    const user = await User.findById(userId).populate('organizationId');
    if (!user) return errorResponse(c, 'User not found', 404);
    return successResponse(c, user);
  }

  static async listUsers(c: AuthContext) {
    const orgId = c.get('organizationId');
    const users = await User.find({ organizationId: orgId }).populate('organizationId');
    return successResponse(c, users);
  }

  static async login(c: AuthContext) {
    try {
      const { email, password } = await c.req.json();
      if (!email || !password) return errorResponse(c, 'Email and password are required', 400);

      const user = await User.findOne({ email });
      if (!user) return errorResponse(c, 'Invalid email or password', 401);

      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) return errorResponse(c, 'Invalid email or password', 401);

      const token = await sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        },
        config.jwtSecret,
        'HS256',
      );

      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'Lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return successResponse(c, { user, token }, 'Login successful');
    } catch (err: any) {
      return errorResponse(c, err.message, 500);
    }
  }

  static async logout(c: AuthContext) {
    setCookie(c, 'auth_token', '', {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'Lax',
      maxAge: 0,
      path: '/',
    });
    return successResponse(c, null, 'Logged out successfully');
  }

  static async signup(c: AuthContext) {
    const body = (c.req as any).valid('json');
    const newUser = new User(body);
    await newUser.save();
    return successResponse(c, newUser, 'User created successfully', 201);
  }
}
