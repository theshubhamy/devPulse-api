import { Schema, model, models, Types } from 'mongoose';

export interface ITeam {
  name: string;
  organizationId: Types.ObjectId;
  managerId?: Types.ObjectId;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

export const Team = models.Team || model<ITeam>('Team', TeamSchema);
