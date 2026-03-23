import { Context } from 'hono';
import { PullRequest, Review, Repository, User } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class WebhookController {
  static async handleGithub(c: Context) {
    try {
      const event = c.req.header('x-github-event');
      const payload = await c.req.json();

      if (event === 'pull_request') {
        const { action, pull_request, repository: ghRepo, sender } = payload;

        let repo = await Repository.findOne({ githubRepoId: ghRepo.id.toString() });
        if (!repo) return successResponse(c, { message: 'Repository not tracked' });

        const githubUserId = (pull_request.user?.id || sender.id).toString();
        let author = await User.findOne({ githubUserId });

        let pr = await PullRequest.findOne({ githubPrId: pull_request.id.toString() });
        if (!pr) {
          pr = new PullRequest({
            repositoryId: repo._id,
            authorId: author?._id,
            githubPrId: pull_request.id.toString(),
            prNumber: pull_request.number,
            title: pull_request.title,
            prCreatedAt: new Date(pull_request.created_at),
            additions: pull_request.additions || 0,
            deletions: pull_request.deletions || 0,
            status: 'open',
          });
        }

        if (action === 'closed' && pull_request.merged) {
          pr.status = 'merged';
          if (pull_request.merged_at) pr.mergedAt = new Date(pull_request.merged_at);
        } else if (action === 'closed') {
          pr.status = 'closed';
        } else if (action === 'opened' || action === 'reopened') {
          pr.status = 'open';
        }

        await pr.save();

        if (pr.status === 'merged' && author?._id) {
          const { addAggregationJob } = await import('../queues/metricsQueue.js');
          await addAggregationJob(author._id.toString());
        }
      } else if (event === 'pull_request_review') {
        const { action, review, pull_request } = payload;

        let pr = await PullRequest.findOne({ githubPrId: pull_request.id.toString() });
        if (pr && action === 'submitted') {
          let reviewer = await User.findOne({ githubUserId: review.user.id.toString() });

          let newReview = new Review({
            pullRequestId: pr._id,
            reviewerId: reviewer?._id,
            githubReviewId: review.id.toString(),
            state: review.state,
            submittedAt: new Date(review.submitted_at),
          });

          await newReview.save();
          pr.reviewCount += 1;
          await pr.save();
        }
      }

      return successResponse(c, { message: 'Webhook processed successfully' });
    } catch (err: any) {
      console.error('Webhook processing error:', err.message);
      return errorResponse(c, 'Internal Server Error', 500);
    }
  }
}
