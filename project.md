# DevPulse

**Tagline:** Engineering Visibility & Smart Time Tracking for Growing Startups

---

# 1. Executive Summary

DevPulse is a hybrid engineering analytics and time-tracking platform designed for startups with 5–50 developers.

It provides:

- Git-based performance insights
- Desktop-based clock-in / clock-out tracking
- Daily work-hour summaries
- Founder-facing delivery intelligence dashboards

The goal is to give founders operational visibility without creating surveillance culture.

---

# 2. Problem Statement

As startups grow beyond 5–10 developers:

- Founders lose visibility into engineering output.
- Delivery delays become harder to diagnose.
- Attendance and working hours are not formally tracked.
- Compliance documentation becomes necessary.
- Investors request engineering performance visibility.

Existing tools are either:

- HR-heavy and not built for engineers
- Surveillance-focused
- Limited to raw Git statistics

There is no lightweight platform that combines:

Engineering performance visibility

- Simple, non-invasive time tracking

  ***

# 3. Target Market

## Primary Users

### Startup Founders (5–50 dev team)

Needs:

- Delivery visibility
- Workload balance insights
- Compliance-ready attendance logs

### Engineering Managers

Needs:

- PR velocity tracking
- Review participation metrics
- Merge time insights

### Developers

Needs:

- Transparent metrics
- Non-invasive tracking
- No spyware features

---

# 4. Product Vision

DevPulse is NOT:

- Employee surveillance software
- Screenshot monitoring tool
- Payroll-heavy HR software

DevPulse IS:

- Engineering Visibility Platform
- Delivery Intelligence System
- Compliance-Light Attendance Tracker

---

# 5. Core Features (MVP Scope)

## 5.1 Git-Based Engineering Insights

Integration:

- GitHub App installation

Metrics:

### Delivery Metrics

- PRs opened per week
- PRs merged per week
- Average merge time
- Merge time trend

### Collaboration Metrics

- Reviews per developer
- Review response time

### Workload Distribution

- PR distribution heatmap
- Overloaded vs under-active indicators

---

## 5.2 Desktop Time Tracking App

Platform:

- Windows
- macOS

Core Functions:

### Clock In

- Manual button click
- Timestamp recorded

### Clock Out

- Timestamp recorded
- Session duration calculated

### Session Tracking

- Multiple sessions per day supported
- Optional idle time detection

No:

- Screenshots
- Keystroke logging
- Webcam monitoring

---

## 5.3 Founder Dashboard

### Organization Overview

- Team total hours (daily/weekly)
- Team PR velocity
- Merge time trend
- Review participation index

### Developer View

For each developer:

- Avg working hours per day
- PRs merged per week
- Avg merge time
- Reviews completed
- Delivery reliability score

---

# 6. System Architecture

## High-Level Architecture

Desktop App (Electron)
↓
REST API (NestJS)
↓
PostgreSQL Database
↓
Background Workers (BullMQ + Redis)
↓
GitHub Webhooks
↓
Next.js Dashboard

---

# 7. Technical Stack

## Frontend (Web Dashboard)

- Next.js (App Router)
- TailwindCSS
- Recharts
- Clerk or Supabase Auth

## Backend

- NestJS
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ

## Desktop App

- Electron
- React
- Secure token storage
- Auto-update system

## Infrastructure

- Dockerized services
- Render / Railway / Fly.io
- GitHub App integration

---

# 8. Data Model

## Organization

- id
- name
- githubOrgId
- plan
- createdAt

## User

- id
- organizationId
- githubUserId
- name
- email
- role
- isActive

## Repository

- id
- organizationId
- githubRepoId
- name

## PullRequest

- id
- repositoryId
- authorId
- createdAt
- mergedAt
- additions
- deletions
- reviewCount
- status

## Review

- id
- pullRequestId
- reviewerId
- state
- createdAt

## WorkSession

- id
- userId
- clockInTime
- clockOutTime
- totalDurationMinutes
- idleMinutes
- source
- createdAt

## DailyMetrics (Aggregated)

- id
- userId
- date
- prsOpened
- prsMerged
- prsReviewed
- avgMergeTime
- linesAdded
- linesDeleted
- totalWorkedMinutes
- totalIdleMinutes

---

# 9. Background Processing

Nightly jobs:

- Aggregate PR metrics
- Compute delivery reliability score
- Update attendance summaries
- Detect inactivity alerts

Heavy computation is handled by workers, not during dashboard load.

---

# 10. Delivery Reliability Score (MVP Formula)

Score =
( PR Merge Consistency \* 30% )

- ( Review Participation \* 20% )
- ( Avg Merge Time Efficiency \* 25% )
- ( Weekly Activity Stability \* 25% )

Transparent formula. No black-box AI.

---

# 11. Security & Privacy

- No screenshot capture
- No keystroke logging
- All metrics visible to developers
- Data encrypted in transit (HTTPS)
- Encrypted at rest

---

# 12. Monetization Strategy

## Pricing Model (Per Developer)

Starter:
₹499 / developer / month (up to 10 devs)

Growth:
₹699 / developer / month

Enterprise:
Custom pricing

## Free Tier

- 7-day trial
- Limited historical data
- No advanced reports

---

# 13. Competitive Positioning

| Traditional HR Tools | DevPulse              |
| -------------------- | --------------------- |
| Biometric focus      | Engineering focus     |
| Payroll heavy        | Lightweight           |
| HR-first             | Founder-first         |
| Attendance only      | Attendance + Delivery |

---

# 14. Roadmap

## Phase 1 (MVP – 8 Weeks)

- GitHub integration
- Desktop clock-in app
- Daily metrics aggregation
- Founder dashboard
- Developer profile view

## Phase 2

- Jira integration
- Slack integration
- Email alerts
- Trend analytics

## Phase 3

- Investor-ready reports
- API access
- Predictive delivery analytics

---

# 15. Success Metrics

- Trial → Paid conversion rate
- 30-day retention rate
- Weekly founder dashboard usage
- Desktop adoption rate

---

# 16. Long-Term Vision

DevPulse evolves into:

- Engineering Operating System
- Delivery Health Indicator
- Startup Engineering Intelligence Layer

Future expansion:

- Predictive delivery insights
- Burnout detection
- Engineering benchmarking engine
