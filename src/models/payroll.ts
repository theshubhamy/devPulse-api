import { Schema, model, models, Types } from 'mongoose';

export interface IPayroll {
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  totalHours: number;
  hourlyRate: number;
  grossPay: number;
  status: 'draft' | 'approved' | 'paid';
}

const PayrollSchema = new Schema<IPayroll>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    totalHours: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    grossPay: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'approved', 'paid'], default: 'draft' },
  },
  {
    timestamps: true,
  },
);

export const Payroll = models.Payroll || model<IPayroll>('Payroll', PayrollSchema);
