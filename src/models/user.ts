import { Schema, model, models, Types } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface IUser {
  organizationId: Types.ObjectId;
  teamId?: Types.ObjectId;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Employee';
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Manager', 'Employee'],
      default: 'Employee',
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);


UserSchema.pre('save', async function () {
  const user = this as any;
  if (!user.password || !user.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};


export const User = models.User || model<IUser>('User', UserSchema);
