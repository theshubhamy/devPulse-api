import { Schema, model, models, Types } from 'mongoose';

export interface IPullRequest {
  repositoryId: Types.ObjectId;
  authorId?: Types.ObjectId;
  githubPrId: string;
  prNumber: number;
  title: string;
  prCreatedAt: Date;
  mergedAt?: Date;
  additions: number;
  deletions: number;
  reviewCount: number;
  status: 'open' | 'closed' | 'merged';
}

const PullRequestSchema = new Schema<IPullRequest>(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    githubPrId: { type: String, required: true },
    prNumber: { type: Number, required: true },
    title: { type: String },
    prCreatedAt: { type: Date, required: true },
    mergedAt: { type: Date },
    additions: { type: Number, default: 0 },
    deletions: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['open', 'closed', 'merged'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  },
);

export const PullRequest =
  models.PullRequest || model<IPullRequest>('PullRequest', PullRequestSchema);
