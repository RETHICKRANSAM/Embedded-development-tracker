# Embedded Dev Tracker

> A personal development lifecycle, sprint task manager, phase checklist tracker, technical notebook, and product release gate verification suite for embedded systems engineers.

---

## 1. Overview

**Embedded Dev Tracker** is a lightweight, local-first web application designed specifically for embedded systems engineers. It helps organize development from requirements through hardware bring-up, firmware development, integration testing, and formal release gates before demos, pilot trials, or production handoffs.

- **100% Local & Private**: Runs completely on your computer with a persistent local SQLite database (`dev.db`). No cloud accounts, paid services, or telemetry required.
- **Release Readiness vs. Task Completion**: Built around the core engineering principle that task completion does *not* equate to demo or pilot readiness. Dedicated product release gates enforce verification of firmware builds, hardware revisions, power-fail recovery, and error conditions before sign-off.
- **Failure & Retest Tracking**: Log test failures, record expected vs. actual behaviors, generate corrective engineering tasks, and maintain retest histories.
- **Contextual Phase Notes**: Slide-over engineering notes panel accessible anywhere without leaving your active workspace.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark/light engineering themes
- **Icons**: Lucide React
- **Database & ORM**: SQLite with Prisma ORM
- **Local Persistence**: Binary SQLite (`dev.db`) + JSON/CSV export & backup

---

## 3. Quick Start & Installation

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Run Migrations
```bash
npm run db:migrate
```

### 3. (Optional) Seed Example Projects
Populates realistic embedded projects (STM32 Nucleo Sensor Gateway, ESP32-S3 Matter Monitor):
```bash
npm run seed
```

### 4. Start the Development Server
```bash
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 4. Main Sections & Capabilities

### 1. Engineering Dashboard (`/`)
- Aggregate KPIs: Total, Active, Completed projects.
- Urgent task tracker: Tasks due today, overdue tasks, and blocked tasks.
- Active Phase Pipeline: Visual distribution of projects across the 7 development phases.
- Incomplete Release Gates: Highlights gates blocking demo or pilot readiness.
- Separate display for task completion progress vs. release readiness.

### 2. My Projects (`/projects`)
- Full project lifecycle management (Create, Edit, Archive, Delete).
- Embedded hardware specifications:
  - Target MCU / SoC (e.g. STM32F401RE, ESP32-S3, nRF52840)
  - Hardware Platform (e.g. Nucleo-64, Custom PCB Rev A)
  - IDE & Toolchain (e.g. STM32CubeIDE, VS Code, Keil MDK)
  - RTOS / OS (e.g. FreeRTOS, Zephyr, Bare-Metal)
  - Programming Language (C99, C++20, Rust)
  - Category, Target Dates, and Repository links.
- Automatically initializes 7 development phases and 3 release gate checklists upon creation.

### 3. Development Lifecycle Workspace (`/lifecycle`)
- Left phase sidebar with progress indicators for each stage:
  - **Phase 1**: Requirements and Planning
  - **Phase 2**: Hardware Study and Bring-up
  - **Phase 3**: Firmware Architecture and Development
  - **Phase 4**: Unit and Integration Testing
  - **Phase 5**: System Validation and Stress Testing
  - **Phase 6**: Demo or Pilot Preparation
  - **Phase 7**: Post-Demo Review
- Phase-specific checklist verification with mandatory status tracking.
- Sprint task tracker:
  - Priorities: Low, Medium, High, Critical
  - Statuses: To Do, In Progress, Pending, Blocked, Done
  - Sub-task checklist items
  - Ability to move tasks between lifecycle phases.
- Add custom phases or checklist items at any time.

### 4. Product Release Gates (`/gates`) — Core Feature
- Three gate templates initialized per project:
  - **Gate A: Before Demo** (14 checks: functionality, build success, hardware wiring, recovery image, demo scripts)
  - **Gate B: Before Pilot Deployment** (15 checks: functional acceptance, power-loss recovery, stress tests, memory/timing)
  - **Gate C: Before Production Release** (13 checks: firmware frozen, checksum recorded, compliance, manufacturing programming)
- **Sign-Off Workflow**:
  - Gates cannot pass if any mandatory checks are incomplete or blocked.
  - When mandatory checks are satisfied, gate enters **Ready for Review**.
  - Final sign-off modal requires confirming firmware version, hardware revision, and review notes.
  - Audit trail preserved in `GateHistory`.
  - Warns if firmware or hardware configuration changes after a gate was previously passed.

### 5. Failure & Retest Tracking
- Mark any gate check as **Failed**.
- Record failure details: description, expected behavior, actual behavior, corrective action.
- Option to auto-create a Critical corrective Task in the project.
- Status progression: `Failed` -> `Fixed` -> `Verified`.
- Preserves full historical retest evidence.

### 6. Phase Notes Sidebar (Slide-Over)
- Slide-over panel accessible from the top bar or inside any phase.
- Capture technical decisions, debugging commands, register configurations, and oscilloscope findings.
- Filter by active phase or view all notes.

### 7. Personal Engineering Notes (`/notes`)
- Cross-project engineering notebook.
- Categories: Technical Decision, Debugging, Hardware, Firmware, Testing, Bug, Reference, General.
- Instant search across titles and monospaced content.

### 8. Settings, Persistence & Backup (`/settings`)
- Direct download of SQLite binary (`dev.db`).
- Export all projects as structured JSON.
- Export release gate checklists and failures as CSV.
- JSON Restore tool to import archives.

---

## 5. Administration & Maintenance

### Backup SQLite Database
```powershell
# PowerShell:
Copy-Item dev.db dev_backup.db

# Linux / macOS:
cp dev.db dev_backup.db
```

### Restore SQLite Database
```powershell
# PowerShell:
Copy-Item dev_backup.db dev.db

# Linux / macOS:
cp dev_backup.db dev.db
```

### Production Build & Linting
```bash
npm run build
npm run lint
```

---

## 6. License & Privacy

This application is personal productivity software for embedded engineers. All data stays local on your machine.
