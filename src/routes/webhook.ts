import { Hono } from 'hono';
import { PullRequest } from '../models/pullRequest';
import { Review } from '../models/review';
import { Repository } from '../models/repository';
import { User } from '../models/user';

const app = new Hono();

// GitHub Webhook payload handler
app.post('/github', async c => {
  try {
    const event = c.req.header('x-github-event');
    const payload = await c.req.json();

    if (event === 'pull_request') {
      const { action, pull_request, repository: ghRepo, sender } = payload;

      // Upsert Repository
      let repo = await Repository.findOne({
        githubRepoId: ghRepo.id.toString(),
      });
      if (!repo) {
        // Find owner or create dummy organization logic could go here
        // For MVP assuming repo already registered by the organization
        return c.json({ message: 'Repository not tracked' }, 200);
      }

      // Upsert User
      let author = await User.findOne({ githubUserId: sender.id.toString() });

      // Upsert PR
      let pr = await PullRequest.findOne({
        githubPrId: pull_request.id.toString(),
      });
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
        if (pull_request.merged_at)
          pr.mergedAt = new Date(pull_request.merged_at);
      } else if (action === 'closed') {
        pr.status = 'closed';
      } else if (action === 'opened' || action === 'reopened') {
        pr.status = 'open';
      }

      await pr.save();
      console.log(
        `Processed PR event: ${action} for PR #${pull_request.number}`,
      );
    } else if (event === 'pull_request_review') {
      const { action, review, pull_request } = payload;

      let pr = await PullRequest.findOne({
        githubPrId: pull_request.id.toString(),
      });
      if (pr && action === 'submitted') {
        let reviewer = await User.findOne({
          githubUserId: review.user.id.toString(),
        });

        let newReview = new Review({
          pullRequestId: pr._id,
          reviewerId: reviewer?._id,
          githubReviewId: review.id.toString(),
          state: review.state,
          submittedAt: new Date(review.submitted_at),
        });

        await newReview.save();

        // Increase PR review count
        pr.reviewCount += 1;
        await pr.save();
        console.log(
          `Processed PR Review event: ${action} for PR #${pull_request.number}`,
        );
      }
    }

    return c.json({ message: 'Webhook processed successfully' }, 200);
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default app;
