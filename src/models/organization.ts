import { Schema, model, models } from 'mongoose';

export interface IOrganization {
  name: string;
  githubOrgId?: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    githubOrgId: { type: String },
    plan: {
      type: String,
      enum: ['Starter', 'Growth', 'Enterprise'],
      default: 'Starter',
    },
  },
  {
    timestamps: true,
  },
);

export const Organization =
  models.Organization ||
  model<IOrganization>('Organization', OrganizationSchema);
