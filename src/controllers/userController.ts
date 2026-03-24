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
      if (!user) return errorResponse(c, 'Invalid credentials', 401);

      if (!user.isActive) return errorResponse(c, 'Account is inactive. Contact your admin.', 403);

      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) return errorResponse(c, 'Invalid credentials', 401);

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

      return successResponse(c, { user }, 'Login successful');
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

  static async createEmployee(c: AuthContext) {
    const orgId = c.get('organizationId');
    const role = c.get('userRole');

    if (role !== 'Owner' && role !== 'Admin') {
      return errorResponse(c, 'Only Admins can create employees', 403);
    }

    const body = (c.req as any).valid('json');
    body.organizationId = orgId; // Force employee to belong to the creator's org

    const existingUser = await User.findOne({ employeeId: body.employeeId });
    if (existingUser) return errorResponse(c, 'Employee ID already exists', 400);

    const newUser = new User(body);
    await newUser.save();
    return successResponse(c, newUser, 'Employee created successfully', 201);
  }

  static async registerOrganization(c: AuthContext) {
    // Expected body: { orgName: string, name: string, email: string, password: string }
    // email must be unique — this becomes the Owner's login credential
    const { orgName, ...userData } = await c.req.json();

    const { Organization } = await import('../models/organization.js');

    // Create Org
    const org = new Organization({ name: orgName });
    await org.save();

    // Create Owner User
    userData.organizationId = org._id;
    userData.role = 'Owner';
    const newUser = new User(userData);
    await newUser.save();

    return successResponse(c, { organization: org, owner: newUser }, 'Organization registered successfully', 201);
  }
}
