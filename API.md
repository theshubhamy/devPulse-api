# DevPulse API Documentation

**Base API URL**: `https://api.devpulse.example.com/api/v1`
**Development URL**: `http://localhost:5500/api/v1`

---

## Authentication
Most routes require a valid JWT token. This token can be provided in two ways:
1.  **Authorization Header**: `Bearer <token>`
2.  **Cookie**: `auth_token=<token>` (HTTP-only)

> Note: All endpoints that are not public require the token.

---

## 1. Authentication & Users
Prefix: `/auth` (Note: Mapped to User Controller in app.ts)

### Register Organization
- **Endpoint**: `POST /auth/register-organization`
- **Access**: Public
- **Description**: Creates a new Organization and provisions the initial Owner account. The `email` becomes the Owner's login credential. Normal employees cannot register independently.
- **Body**:
  ```json
  {
    "orgName": "Company Name",
    "name": "Jane Doe",
    "email": "owner@company.com",
    "password": "securepassword123"
  }
  ```
- **Response**: Success (201) with organization and owner data.

### Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Description**: Single login endpoint for **all roles** — Organization Owner, Admin, Manager, and Employee. The JWT returned in the response and cookie contains the `role` field so the frontend can route accordingly.
- **Body**:
  ```json
  {
    "email": "user@company.com",
    "password": "securepassword123"
  }
  ```
- **Response**: Success (200) with `user` object and `token`.
  ```json
  {
    "user": { "name": "...", "role": "Owner", ... },
    "token": "<jwt>"
  }
  ```

### Create Employee Account
- **Endpoint**: `POST /auth/employee`
- **Access**: Protected (Owner/Admin Only)
- **Description**: Provisions a new employee within the current organization. The `employeeId` is for HR reference; login is done using `email + password`.
- **Body**:
  ```json
  {
    "employeeId": "EMP-003",
    "name": "John Smith",
    "email": "john@company.com",
    "password": "startpassword123",
    "role": "Employee",
    "teamId": "mongodb_id_of_team"
  }
  ```

### Get Current User Profile
- **Endpoint**: `GET /auth/me`
- **Access**: Protected
- **Response**: Current authenticated user object.

### List Organization Users
- **Endpoint**: `GET /auth/`
- **Access**: Protected
- **Response**: List of all users inside the currently authenticated organization.

### Logout
- **Endpoint**: `POST /auth/logout`
- **Access**: Protected
- **Action**: Clears `auth_token` cookie.

---

## 2. Organizations
Prefix: `/organizations`

### List Current Organization
- **Endpoint**: `GET /`
- **Access**: Protected
- **Response**: Array of organizations matching the user's `organizationId`.

### Get My Organization
- **Endpoint**: `GET /me`
- **Access**: Protected
- **Response**: `{ "_id": "...", "name": "Company Name", ... }`

---

## 3. Teams
Prefix: `/teams`

### Create Team
- **Endpoint**: `POST /`
- **Access**: Protected (Admins/Owners)
- **Body**: `{ "name": "Frontend Squad" }`

### List Teams
- **Endpoint**: `GET /`
- **Access**: Protected

### Get Team Members
- **Endpoint**: `GET /:id/members`
- **Access**: Protected
- **Response**: Returns all users where `teamId == :id`.

---

## 4. Work Sessions & Breaks (Activity Tracking)
Prefix: `/work-sessions`

### Clock In
- **Endpoint**: `POST /clock-in`
- **Access**: Protected
- **Body**: `{ "source": "desktop" }` (optional)

### Clock Out
- **Endpoint**: `POST /clock-out`
- **Access**: Protected
- **Body**: `{ "idleMinutes": 15 }` (optional)
- **Response**: Updates session duration and ends open breaks.

### Start Break
- **Endpoint**: `POST /break-start`
- **Access**: Protected
- **Body**: `{ "type": "short_break" | "lunch_break" }`

### End Break
- **Endpoint**: `POST /break-end`
- **Access**: Protected
- **Body**: `{ "type": "short_break" | "lunch_break" }`

### Get Active Session
- **Endpoint**: `GET /active`
- **Access**: Protected
- **Response**: The currently running session, including any active breaks.

### Get Work Session History
- **Endpoint**: `GET /history`
- **Access**: Protected
- **Query**: `?days=7` (optional)

---

## 5. Payroll
Prefix: `/payroll`

### Get Payroll History
- **Endpoint**: `GET /`
- **Access**: Protected
- **Response**: Retrieves recent payroll periods applicable for the current employee.

### Generate Demo Payroll
- **Endpoint**: `POST /generate-demo`
- **Access**: Protected
- **Description**: Generates a dummy entry of a generated timesheet calculation for MVP demonstration.
