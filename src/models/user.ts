import { Schema, model, models } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  role: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'user' },
  },
  {
    timestamps: true,
  },
);

export const User = models.User || model<IUser>('User', UserSchema);
