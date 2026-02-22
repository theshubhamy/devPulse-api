import { Schema, model, models, Types } from 'mongoose';

export interface IDailyMetrics {
  userId: Types.ObjectId;
  date: Date;
  prsOpened: number;
  prsMerged: number;
  prsReviewed: number;
  avgMergeTime: number;
  linesAdded: number;
  linesDeleted: number;
  totalWorkedMinutes: number;
  totalIdleMinutes: number;
}

const DailyMetricsSchema = new Schema<IDailyMetrics>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    prsOpened: { type: Number, default: 0 },
    prsMerged: { type: Number, default: 0 },
    prsReviewed: { type: Number, default: 0 },
    avgMergeTime: { type: Number, default: 0 },
    linesAdded: { type: Number, default: 0 },
    linesDeleted: { type: Number, default: 0 },
    totalWorkedMinutes: { type: Number, default: 0 },
    totalIdleMinutes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// Ensure uniqueness per user per date
DailyMetricsSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyMetrics =
  models.DailyMetrics ||
  model<IDailyMetrics>('DailyMetrics', DailyMetricsSchema);
