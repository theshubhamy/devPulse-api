# DevPulse MVP Specifications

**Tagline:** Smart Time Tracking and Payroll Management for Growing Startups

DevPulse is a comprehensive time-tracking and attendance platform designed for startups. It provides simple, non-invasive desktop-based clock-in/clock-out tracking, integrated break management, team organization, and automated payroll calculations. The primary goal is to give founders and HR teams operational visibility into attendance and streamline payroll processing without resorting to a toxic surveillance culture.

---

## Minimum Viable Product (MVP) Scope

The MVP encompasses an 8-week development phase aimed at delivering:
1. A cross-platform desktop clock-in application with break management.
2. Web-based attendance monitoring logically separated by Organization and Teams.
3. Automated payroll calculations based on working hours.
4. Top-down managed authentication (Employees strictly authenticate via assigned IDs).

**Non-Goals for MVP:** GitHub integration, PR performance metrics, repository analytics, screenshot monitoring, webcam capture, keystroke logging, black-box AI behavior scoring, and public individual signups.

---

## Features and Sub-Features Detail

### 1. Web Dashboard (Frontend)
The centralized web portal where founders monitor attendance, structure their business, and where employees view transparent logs.

- **Strict Organization Authorization**
  - **No Open Signups:** An organization acts as a closed workspace. The public signup endpoint creates an entire Organization and an "Owner". 
  - **Employee Login:** Employees are provisioned exclusively by Admins and login via an assigned `employeeId` securely.
  - Role-Based Access Control (Owner, Admin, Manager, Employee).
- **Structure & Team Management**
  - Group employees into functional "Teams" within the Organization.
- **Founder / Admin Dashboard**
  - **Attendance Overview:** Daily and weekly views of who is clocked in, on break, or absent.
  - **Timesheet Management:** Review, edit, and approve employee timesheets.
  - **Payroll Processing:** Automated payroll calculations based on total approved hours, hourly rates, and standard salary structures.
- **Employee Transparency View**
  - Personal dashboard for employees to view their own daily time logs, break history, and estimated payroll to foster trust and transparency.

### 2. Desktop Time Tracking Application
A lightweight Electron-based desktop client for Windows and macOS.

- **Time Logging**
  - **Clock In:** Manual button click to log the start of the workday.
  - **Clock Out:** Manual button click to log the end of the workday and calculate total shift duration.
- **Break Management**
  - **Short Break:** Specific toggle to log paid or unpaid short breaks accurately.
  - **Lunch Break:** Specific toggle to start and end meal breaks, ensuring compliance with labor hours.
- **Activity & Resilience**
  - **Offline Support:** Secure local auth token storage. Offline buffering of clock-in/out and break events if the backend API is temporarily unavailable, syncing when reconnected.
  - **Strictly No Spyware:** Explicit architectural block against screenshots, keystroke logging, or webcam use.

### 3. Attendance & Timesheet Processing
Robust backend logic to handle shift calculations and compliance.

- **Daily Attendance Aggregation**
  - Calculate total "Gross Hours" (Clock-in to Clock-out).
  - Calculate "Net Working Hours" by subtracting unpaid breaks (e.g., Lunch Breaks).
- **Timesheet Generation**
  - Auto-generate weekly and monthly timesheets from daily logs.
  - Flag anomalies such as missing clock-outs or excessive break durations.

### 4. Payroll Engine
An automated module to translate tracked time into financial figures.

- **Compensation Profiles**
  - Configure employee compensation models (Hourly wage vs. fixed Salary with overtime configurations).
- **Payroll Calculation**
  - Calculate gross pay based on Net Working Hours and compensation profiles.
  - Generate payroll summaries for a specified pay period (weekly, bi-weekly, monthly).
- **Export Capabilities**
  - Export payroll data to standard formats (CSV/Excel) for integration with banking or accounting software.

### 5. Technical Infrastructure & Security
- **Frontend / Dashboard:** Next.js (App Router), TailwindCSS, Recharts.
- **Backend API:** NestJS/Hono mapped via Mongoose, backing PostgreSQL or MongoDB.
- **Background Processing:** Redis/BullMQ for asynchronous attendance aggregation and payroll generation jobs.
- **Desktop Application:** Electron, React.
- **Security Posture:** Encrypted DB connections, rate limiting, strictly partitioned data access based on user roles, bounded strictly by standard Organization authentication layers.
