# Embedded Dev Tracker

> A personal development lifecycle, sprint task manager, phase checklist tracker, technical notebook, and product release gate verification suite for embedded systems engineers.

**Live Application**: [https://rethickransam.github.io/Embedded-development-tracker/](https://rethickransam.github.io/Embedded-development-tracker/)

---

## 1. Overview

**Embedded Dev Tracker** is a lightweight, fully client-side web application designed specifically for embedded systems engineers. It helps organize development from requirements through hardware study and bring-up, firmware architecture, integration testing, system validation, and formal release gates before demos, pilot trials, or production handoffs.

- **100% Client-Side & Private**: Runs directly in your browser with persistent `localStorage`. Zero backend dependencies, no external databases, and no tracking or cloud accounts required.
- **Release Readiness vs. Task Completion**: Built around the core engineering principle that task completion does *not* equate to demo or pilot readiness. Dedicated product release gates enforce verification of firmware builds, hardware revisions, power-fail recovery, and error conditions before sign-off.
- **Failure & Retest Tracking**: Log test failures, record expected vs. actual behaviors, generate corrective engineering tasks, and maintain retest histories.
- **Contextual Phase Notes**: Slide-over engineering notes panel accessible anywhere without leaving your active workspace.
- **Data Portability**: Full JSON backup and restore, plus instant CSV exports for audit tables and sign-offs.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router with Static HTML Export `output: 'export'`)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark and light engineering themes
- **Icons**: Lucide React
- **Storage**: Client-Side `localStorage` with automated schema migrations and default embedded project seeding
- **Deployment**: GitHub Pages via GitHub Actions and static `out/` export

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open your browser at **[http://localhost:3000/Embedded-development-tracker/](http://localhost:3000/Embedded-development-tracker/)** (or configure local port).

### 3. Build Static Export for Production
```bash
npm run build
```
This generates the optimized static files in the `out/` directory, ready to be hosted on GitHub Pages or any static file host.

---

## 4. Main Capabilities

### 1. Engineering Dashboard (`/`)
- Aggregate KPIs: Total, Active, and Completed projects.
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
- 7 Lifecycle Phases with dedicated checklists and tasks:
  - **Phase 1**: Requirements and Planning
  - **Phase 2**: Hardware Study and Bring-up
  - **Phase 3**: Firmware Architecture and Development
  - **Phase 4**: Unit and Integration Testing
  - **Phase 5**: System Validation and Stress Testing
  - **Phase 6**: Demo or Pilot Preparation
  - **Phase 7**: Post-Demo Review
- Sprint task tracker with Priorities (Low, Medium, High, Critical) and Statuses (To Do, In Progress, Pending, Blocked, Done).
- Interactive checklist items with mandatory status enforcement.

### 4. Product Release Gates (`/gates`)
- Three gate templates initialized per project:
  - **Gate A: Before Demo** (14 checks: functionality, build success, hardware wiring, recovery image, demo scripts)
  - **Gate B: Before Pilot Deployment** (15 checks: functional acceptance, power-loss recovery, stress tests, memory/timing)
  - **Gate C: Before Production Release** (15 checks: flash protection, production fuses, environmental validation, regulatory compliance)
- Sign-Off Workflow: Prevents passing if any mandatory checks are incomplete or failed.
- Failure Tracking: Log failures with expected vs actual behaviors, corrective actions, and retest histories.

### 5. Engineering Notes (`/notes`)
- Categorized technical notes (Architecture, Bring-up, Bug, General).
- Slide-over notes drawer available across all pages.

### 6. Settings & Data Portability (`/settings`)
- **JSON Backup**: Download all projects, phases, tasks, notes, and gates into a single `.json` file.
- **JSON Restore**: Upload and restore previous backups directly into browser storage.
- **CSV Audit Export**: Export release gate audit records and checklist states to CSV for stakeholder reviews.
- **Sample Projects Reset**: Reset storage at any time to preload realistic embedded systems projects.
- **Theme Preference**: Toggle between Dark and Light mode.

---

## 5. Deployment on GitHub Pages

The repository uses GitHub Actions (`.github/workflows/deploy.yml`) to automatically build and deploy the Next.js static site to GitHub Pages whenever changes are pushed to `main`.

To ensure GitHub Pages serves the application correctly:
1. Open the repository on GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - Set **Source** to **GitHub Actions** (recommended), OR set **Source** to **Deploy from a branch** with branch `gh-pages` and folder `/(root)`.
