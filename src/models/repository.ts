import { Schema, model, models, Types } from 'mongoose';

export interface IRepository {
  organizationId: Types.ObjectId;
  githubRepoId: string;
  name: string;
}

const RepositorySchema = new Schema<IRepository>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    githubRepoId: { type: String, required: true },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const Repository =
  models.Repository || model<IRepository>('Repository', RepositorySchema);
