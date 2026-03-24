import { Schema, model, models, Types } from 'mongoose';

export interface IBreak {
  type: 'short_break' | 'lunch_break';
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
}

export interface IWorkSession {
  userId: Types.ObjectId;
  clockInTime: Date;
  clockOutTime?: Date;
  totalDurationMinutes?: number;
  idleMinutes?: number;
  breaks: IBreak[];
  source: 'desktop' | 'web';
}

const BreakSchema = new Schema<IBreak>({
  type: { type: String, enum: ['short_break', 'lunch_break'], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  durationMinutes: { type: Number },
});

const WorkSessionSchema = new Schema<IWorkSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clockInTime: { type: Date, required: true, default: () => new Date() },
    clockOutTime: { type: Date },
    totalDurationMinutes: { type: Number, default: 0 },
    idleMinutes: { type: Number, default: 0 },
    breaks: { type: [BreakSchema], default: [] },
    source: { type: String, enum: ['desktop', 'web'], default: 'desktop' },
  },
  {
    timestamps: true,
  },
);

export const WorkSession =
  models.WorkSession || model<IWorkSession>('WorkSession', WorkSessionSchema);
