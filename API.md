# devPulse API Documentation

**Base API URL**: `https://u6qm7ngmgudbqhuxwpubpdkwvu0njbzr.lambda-url.ap-south-1.on.aws/api/v1`
**Development URL**: `http://localhost:5500/api/v1`

---

## Authentication
Most routes require a valid JWT token. This token can be provided in two ways:
1.  **Authorization Header**: `Bearer <token>`
2.  **Cookie**: `auth_token=<token>` (HTTP-only)

---

## 1. Authentication & Users
Prefix: `/auth` (or `/users`)

### Login
- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: Success (200) with `token` and `user` data.

### Signup
- **Endpoint**: `POST /auth/signup`
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "organizationId": "mongodb_id_of_org"
  }
  ```
- **Response**: Success (201)

### Get Current User Profile
- **Endpoint**: `GET /auth/me` (Protected)
- **Response**: Current authenticated user object.

### Logout
- **Endpoint**: `POST /auth/logout` (Protected)
- **Action**: Clears `auth_token` cookie.

---

## 2. Organizations
Prefix: `/organizations`

### List Current Organization
- **Endpoint**: `GET /` (Protected)
- **Response**: `{ "organizations": [...] }`

### Create Organization
- **Endpoint**: `POST /`
- **Body**: `{ "name": "Company Name" }`

### Get Organization Stats
- **Endpoint**: `GET /:id/stats` (Protected)
- **Response**: 
  ```json
  {
    "totalRepos": 5,
    "totalMembers": 10,
    "activePRs": 2,
    "avgMergeTime": 12.5
  }
  ```

---

## 3. Work Sessions (Activity Tracking)
Prefix: `/work-sessions`

### Clock In
- **Endpoint**: `POST /clock-in` (Protected)
- **Body**: `{ "source": "desktop" }` (optional)

### Clock Out
- **Endpoint**: `POST /clock-out` (Protected)
- **Body**: `{ "idleMinutes": 15 }` (optional)
- **Response**: Recalculates metrics in the background.

### Get Active Session
- **Endpoint**: `GET /active` (Protected)

### Get Work Session History
- **Endpoint**: `GET /history` (Protected)
- **Query**: `?days=7` (optional)

---

## 4. Analytics & Metrics
Prefixes: `/analytics`, `/metrics`

### Get User Dashboard (Recent History)
- **Endpoint**: `GET /analytics/user/:userId` (Protected)
- **Query**: `?limit=30`
- **Response**: Daily metrics for the last N days with aggregates.

### Get Team Summary
- **Endpoint**: `GET /analytics/team/:orgId` (Protected)
- **Response**: Performance of all team members today.

### Get Reliability Score
- **Endpoint**: `GET /metrics/score/:userId` (Protected)

### Get PR Merge Time Trend
- **Endpoint**: `GET /metrics/merge-time-trend` (Protected)
- **Query**: `?weeks=4`

---

## 5. Repositories & Pull Requests
Prefixes: `/repositories`, `/pull-requests`

### List Repositories
- **Endpoint**: `GET /repositories/` (Protected)

### List Pull Requests
- **Endpoint**: `GET /pull-requests/` (Protected)
- **Response**: List of recent PRs with author details.

### PR Velocity
- **Endpoint**: `GET /pull-requests/velocity` (Protected)
- **Query**: `?days=7`

---

## 6. Webhooks (Public)
Prefix: `/webhooks`

### GitHub Webhook
- **Endpoint**: `POST /github`
- **Headers**: `x-github-event` required.
- **Action**: Processes `pull_request` and `pull_request_review` events.
