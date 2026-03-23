import { Context } from 'hono';

export interface AuthVariables {
  userId: string;
  organizationId: string;
  userEmail: string;
  userRole: string;
  requestId: string;
}

export type AuthContext = Context<{ Variables: AuthVariables }>;

export interface RequestIdVariables {
  requestId: string;
}

export type RequestIdContext = Context<{ Variables: RequestIdVariables }>;

export type AppContext = AuthContext & RequestIdContext;
