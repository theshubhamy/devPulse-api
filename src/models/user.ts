import { Schema, model, models, Types } from 'mongoose';

export interface IUser {
  organizationId: Types.ObjectId;
  githubUserId?: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Developer';
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    githubUserId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Manager', 'Developer'],
      default: 'Developer',
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const User = models.User || model<IUser>('User', UserSchema);
