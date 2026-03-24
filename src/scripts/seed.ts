import { Organization, User, WorkSession, DailyMetrics, Team } from '../models/index.js';
import { connectDB } from '../config/connect.js';
import { processMetricsAggregation } from '../workers/metricsWorker.js';

const SEED_DAYS = 30;

async function seed() {
    try {
        await connectDB();
        console.log('--- Starting Database Seeding ---');

        console.log('Clearing existing collections...');
        await Promise.all([
            Organization.deleteMany({}),
            User.deleteMany({}),
            WorkSession.deleteMany({}),
            DailyMetrics.deleteMany({}),
        ]);

        const org = await Organization.create({
            name: 'TechPulse Engineering',
            plan: 'Growth'
        });
        console.log(`Created Org: ${org.name}`);

        const team = await Team.create({
            name: 'Core Platform',
            organizationId: org._id
        });
        console.log(`Created Team: ${team.name}`);

        const users = await User.create([
            {
                organizationId: org._id,
                employeeId: 'EMP-001',
                name: 'Alice Johnson',
                email: 'alice@techpulse.io',
                password: 'password123',
                role: 'Owner'
            },
            {
                organizationId: org._id,
                teamId: team._id,
                employeeId: 'EMP-002',
                name: 'Bob Smith',
                email: 'bob@techpulse.io',
                password: 'password123',
                role: 'Employee'
            },
            {
                organizationId: org._id,
                teamId: team._id,
                employeeId: 'EMP-003',
                name: 'Charlie Davis',
                email: 'charlie@techpulse.io',
                password: 'password123',
                role: 'Employee'
            }
        ]);
        console.log(`Created ${users.length} users.`);

        console.log(`Generating mock attendance data for the last ${SEED_DAYS} days...`);

        for (let i = 0; i < SEED_DAYS; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(10, 0, 0, 0); // Start of day

            for (const user of users) {
                // Mock Work Sessions
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
            }
        }

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
