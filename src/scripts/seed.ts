import mongoose from 'mongoose';
import { Organization } from '../models/organization.js';
import { User } from '../models/user.js';
import { Repository } from '../models/repository.js';
import { PullRequest } from '../models/pullRequest.js';
import { Review } from '../models/review.js';
import { WorkSession } from '../models/workSession.js';
import { DailyMetrics } from '../models/dailyMetrics.js';
import { connectDB } from '../db/connect.js';
import { processMetricsAggregation } from '../workers/metricsWorker.js';

const SEED_DAYS = 30;

async function seed() {
    try {
        await connectDB();
        console.log('--- Starting Database Seeding ---');

        // 1. Clear existing data (optional but safer for clean seed)
        console.log('Clearing existing collections...');
        await Promise.all([
            Organization.deleteMany({}),
            User.deleteMany({}),
            Repository.deleteMany({}),
            PullRequest.deleteMany({}),
            Review.deleteMany({}),
            WorkSession.deleteMany({}),
            DailyMetrics.deleteMany({}),
        ]);

        // 2. Create Organization
        const org = await Organization.create({
            name: 'TechPulse Engineering',
            githubOrgId: '12345678',
            plan: 'Growth'
        });
        console.log(`Created Org: ${org.name}`);

        // 3. Create Users
        const users = await User.insertMany([
            {
                organizationId: org._id,
                githubUserId: '001',
                name: 'Alice Johnson',
                email: 'alice@techpulse.io',
                role: 'Owner'
            },
            {
                organizationId: org._id,
                githubUserId: '002',
                name: 'Bob Smith',
                email: 'bob@techpulse.io',
                role: 'Developer'
            },
            {
                organizationId: org._id,
                githubUserId: '003',
                name: 'Charlie Davis',
                email: 'charlie@techpulse.io',
                role: 'Developer'
            }
        ]);
        console.log(`Created ${users.length} users.`);

        // 4. Create Repository
        const repo = await Repository.create({
            organizationId: org._id,
            githubRepoId: '9999',
            name: 'core-backend'
        });
        console.log(`Created Repo: ${repo.name}`);

        // 5. Generate Historical Data
        console.log(`Generating mock data for the last ${SEED_DAYS} days...`);

        for (let i = 0; i < SEED_DAYS; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(10, 0, 0, 0); // Start of day

            for (const user of users) {
                // Mock Work Sessions (Discipline)
                // Randomly 4-10 hours
                const hours = 4 + Math.random() * 6;
                const clockInTime = new Date(date);
                const clockOutTime = new Date(date);
                clockOutTime.setHours(10 + Math.floor(hours));
                const idleMinutes = Math.floor(Math.random() * 60);

                await WorkSession.create({
                    userId: user._id,
                    clockInTime,
                    clockOutTime,
                    idleMinutes,
                    totalDurationMinutes: Math.floor(hours * 60) - idleMinutes,
                    source: 'desktop'
                });

                // Mock PRs (Output)
                // Bob and Alice are very active, Charlie less so
                const prCount = user.name === 'Charlie Davis' ? (Math.random() > 0.7 ? 1 : 0) : (Math.random() > 0.5 ? 2 : 1);
                for (let p = 0; p < prCount; p++) {
                    const prDate = new Date(date);
                    const mergedAt = new Date(date);
                    mergedAt.setHours(15 + p);

                    const pr = await PullRequest.create({
                        repositoryId: repo._id,
                        authorId: user._id,
                        githubPrId: `pr_${i}_${user.githubUserId}_${p}`,
                        prNumber: 1000 + i * 10 + p,
                        title: `Feature enhancement ${i}-${p}`,
                        prCreatedAt: prDate,
                        mergedAt: Math.random() > 0.2 ? mergedAt : undefined, // 80% merged
                        additions: 100 + Math.floor(Math.random() * 500),
                        deletions: 20 + Math.floor(Math.random() * 100),
                        status: Math.random() > 0.2 ? 'merged' : 'open',
                        reviewCount: Math.floor(Math.random() * 3)
                    });

                    // Mock Reviews (Peer Support)
                    // Others review this PR
                    const reviewers = users.filter(u => u._id.toString() !== user._id.toString());
                    for (const reviewer of reviewers) {
                        if (Math.random() > 0.6) {
                            await Review.create({
                                pullRequestId: pr._id,
                                reviewerId: reviewer._id,
                                githubReviewId: `rev_${pr._id}_${reviewer.githubUserId}`,
                                state: 'APPROVED',
                                submittedAt: new Date(mergedAt.getTime() - 1000 * 60 * 30) // 30 mins before merge
                            });
                        }
                    }
                }
            }
        }

        // 6. Run Aggregation for all users for all those days
        console.log('Aggregating metrics for generated data...');
        for (let i = 0; i < SEED_DAYS; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            for (const user of users) {
                await processMetricsAggregation(user._id.toString(), date);
            }
        }

        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
