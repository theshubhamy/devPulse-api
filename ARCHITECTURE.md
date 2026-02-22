# DevPulse - System Architecture

Version: 1.0
Scope: MVP Architecture
Author: DevPulse Engineering

---

# 1. Architecture Overview

DevPulse follows a modular, event-driven architecture designed for:

- Scalability
- Asynchronous processing
- Clear separation of concerns
- Extensibility for future integrations

The system consists of four primary components:

1. Web Dashboard (Frontend)
2. API & Core Backend
3. Background Workers
4. Desktop Time Tracking Application

---

# 2. High-Level System Diagram

Desktop App (Electron)
↓
REST API (NestJS)
↓
PostgreSQL Database
↓
Redis (Queue)
↓
Background Workers (BullMQ)
↓
GitHub Webhooks + GitHub API
↓
Next.js Dashboard (Web UI)

---

# 3. Component Architecture

---

# 3.1 Web Dashboard (Frontend)

Technology:

- Next.js (App Router)
- TailwindCSS
- Recharts (Data Visualization)

Responsibilities:

- Organization onboarding
- GitHub App installation flow
- Dashboard rendering
- Developer performance views
- Attendance summaries
- Admin settings

Communication:

- Uses secure REST API
- JWT-based authentication
- Role-based access control

---

# 3.2 Backend API Layer

Technology:

- NestJS
- Prisma ORM
- PostgreSQL

Responsibilities:

- Authentication & authorization
- Organization management
- GitHub webhook handling
- Work session management
- Aggregated metric retrieval
- Plan & subscription management

Design Principles:

- Stateless API
- Modular service-based structure
- DTO validation layer
- Global error handling

Suggested Module Structure:

- auth.module
- organization.module
- github.module
- attendance.module
- analytics.module
- subscription.module

---

# 3.3 Database Layer

Primary Database:

- PostgreSQL

ORM:

- Prisma

Design Principles:

- Normalized schema for raw events
- Aggregated tables for dashboard reads
- Index-heavy read optimization
- No heavy joins in dashboard queries

Core Data Types:

- Organization
- User
- Repository
- PullRequest
- Review
- WorkSession
- DailyMetrics

---

# 3.4 Background Worker Layer

Technology:

- Redis
- BullMQ

Purpose:

All heavy computation runs asynchronously.

Worker Responsibilities:

1. Process GitHub webhook events
2. Aggregate daily PR metrics
3. Compute Delivery Reliability Score
4. Generate inactivity alerts
5. Compute daily attendance summaries

Job Types:

- processPullRequest
- processReview
- computeDailyMetrics
- computeAttendanceSummary
- generateHealthAlerts

All analytics are precomputed nightly to ensure fast dashboard loads.

---

# 3.5 GitHub Integration Architecture

Integration Type:

- GitHub App (installed at organization level)

Event Sources:

- pull_request
- pull_request_review
- push

Flow:

1. GitHub sends webhook event
2. Backend validates signature
3. Raw event stored
4. Job queued for worker
5. Worker parses and persists structured data

Rate Limiting:

- Token rotation for GitHub API
- Backoff retry strategy
- Exponential retry on failure

---

# 3.6 Desktop Application Architecture

Technology:

- Electron
- React
- Secure local token storage

Architecture Layers:

UI Layer:

- Clock In / Clock Out
- Session display
- Sync status indicator

Core Layer:

- Session timer engine
- Idle detection service
- API sync service

Communication:

- REST API calls
- Auth token stored securely
- Offline buffering if API unavailable

Session Flow:

1. User clicks Clock In
2. Timestamp stored locally
3. API notified
4. Timer runs
5. Idle detection records inactivity
6. On Clock Out → Session submitted

No:

- Screenshot capture
- Keystroke logging
- Background spyware

---

# 4. Data Flow Architecture

---

# 4.1 Pull Request Processing Flow

1. PR created on GitHub
2. GitHub sends webhook
3. Backend verifies and stores raw event
4. Worker parses event
5. PR record created/updated
6. Nightly aggregation updates DailyMetrics
7. Dashboard displays precomputed data

---

# 4.2 Work Session Flow

1. Developer clicks Clock In
2. Desktop sends start session request
3. Backend stores WorkSession (open state)
4. On Clock Out:
   - End time recorded
   - Duration computed
   - Idle time applied
5. Nightly job aggregates into AttendanceSummary
6. Dashboard displays daily hours

---

# 4.3 Dashboard Data Retrieval

Dashboard NEVER queries raw PR or session tables directly.

Instead:

- Queries DailyMetrics
- Queries AttendanceSummary
- Queries precomputed team aggregates

This ensures:

- O(1) read performance
- No heavy real-time computation

---

# 5. Security Architecture

Authentication:

- JWT-based access tokens
- Refresh token strategy
- Role-based access control (RBAC)

Authorization Roles:

- Owner
- Admin
- Manager
- Developer

Security Measures:

- HTTPS only
- Encrypted DB connections
- Webhook signature validation
- Rate limiting
- Input validation
- Prisma query sanitization

Desktop Security:

- Secure local token storage
- Token expiration enforcement
- Device-session linking

---

# 6. Scalability Considerations

Horizontal Scaling:

- Stateless API servers
- Redis-based distributed queue
- Worker replicas

Database Scaling:

- Indexed read-heavy tables
- Partition DailyMetrics by date if required
- Read replica for dashboard queries (future)

Event Volume:

- Batch processing
- Job deduplication
- Dead-letter queue for failures

---

# 7. Performance Optimization Strategy

Key Principle:

Compute heavy, read light.

Optimizations:

- Pre-aggregation
- Cached analytics responses
- Minimal dashboard API payload
- Batched GitHub API calls
- Worker-level concurrency control

---

# 8. Observability & Monitoring

Recommended:

- Structured logging (Winston / Pino)
- Error tracking (Sentry)
- Metrics (Prometheus)
- Uptime monitoring
- Worker health dashboard

Key Metrics:

- Webhook processing latency
- Worker job failure rate
- Dashboard response time
- Desktop sync failure rate

---

# 9. Deployment Architecture (MVP)

Environment:

- Dockerized services
- Managed PostgreSQL
- Managed Redis

Suggested Providers:

- Render
- Railway
- Fly.io

CI/CD:

- GitHub Actions
- Auto-deploy on main branch
- Migration automation

---

# 10. Future Architecture Extensions

Phase 2:

- Jira integration service
- Slack analytics service
- Real-time alert engine

Phase 3:

- ML-based delivery prediction
- Benchmarking engine
- Public API

---

# 11. Architectural Principles

1. No surveillance architecture.
2. Async-first analytics computation.
3. Transparent metrics.
4. Developer-visible data.
5. Scalable by design.
6. Minimal operational overhead for startups.

---

# 12. Non-Goals (MVP)

- Payroll system
- Screenshot monitoring
- Webcam capture
- AI behavior scoring
- Keystroke logging
- Deep HR policy management

---

# Conclusion

DevPulse architecture is designed to:

- Deliver fast dashboard performance
- Maintain clean separation of analytics and tracking
- Scale with growing startup teams
- Avoid toxic surveillance patterns
- Provide actionable engineering visibility

The system prioritizes:

Predictability
Transparency
Scalability
Operational simplicity
