import { AuthContext } from '../types/hono.js';
import { Team } from '../models/team.js';
import { User } from '../models/user.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class TeamController {
  static async createTeam(c: AuthContext) {
    const body = await c.req.json();
    const orgId = c.get('organizationId');
    
    // Only admins/owners should hit this (ensure middleware applies if needed)
    body.organizationId = orgId;
    
    const team = new Team(body);
    await team.save();
    return successResponse(c, team, 'Team created successfully', 201);
  }

  static async listTeams(c: AuthContext) {
    const orgId = c.get('organizationId');
    const teams = await Team.find({ organizationId: orgId }).populate('managerId', 'name employeeId');
    return successResponse(c, teams, 'Teams retrieved');
  }

  static async getTeamMembers(c: AuthContext) {
    const { id } = c.req.param();
    const orgId = c.get('organizationId');

    const team = await Team.findOne({ _id: id, organizationId: orgId });
    if (!team) return errorResponse(c, 'Team not found', 404);

    const members = await User.find({ teamId: id });
    return successResponse(c, members, 'Team members retrieved');
  }
}
