import { Schema, model, models, Types } from 'mongoose';

export interface IReview {
  pullRequestId: Types.ObjectId;
  reviewerId?: Types.ObjectId;
  githubReviewId: string;
  state:
    | 'APPROVED'
    | 'CHANGES_REQUESTED'
    | 'COMMENTED'
    | 'DISMISSED'
    | 'PENDING';
  submittedAt?: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    pullRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'PullRequest',
      required: true,
    },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
    githubReviewId: { type: String, required: true },
    state: { type: String, required: true },
    submittedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const Review = models.Review || model<IReview>('Review', ReviewSchema);
