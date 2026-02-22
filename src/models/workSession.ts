import { Schema, model, models, Types } from 'mongoose';

export interface IWorkSession {
  userId: Types.ObjectId;
  clockInTime: Date;
  clockOutTime?: Date;
  totalDurationMinutes?: number;
  idleMinutes?: number;
  source: 'desktop' | 'web';
}

const WorkSessionSchema = new Schema<IWorkSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clockInTime: { type: Date, required: true, default: () => new Date() },
    clockOutTime: { type: Date },
    totalDurationMinutes: { type: Number, default: 0 },
    idleMinutes: { type: Number, default: 0 },
    source: { type: String, enum: ['desktop', 'web'], default: 'desktop' },
  },
  {
    timestamps: true,
  },
);

export const WorkSession =
  models.WorkSession || model<IWorkSession>('WorkSession', WorkSessionSchema);
