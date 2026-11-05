# Embedded Development Tracker — Java Console Application

A modular, 3-tier object-oriented console application implementing the **Personal Embedded Development Tracker** according to the Product Requirements Document (`prd.md`).

---

## 🏛️ Project Architecture & Structure

Following the exact architectural pattern requested:

```text
src/com/embedded/
├── CLI/
│   ├── ConsoleHelper.java     # Terminal formatting, ANSI colors, safe input parsing
│   ├── DashboardCLI.java      # Executive dashboard showing tasks, gates, and blockers
│   ├── ProjectCLI.java        # Project creation, selection, and specification viewer
│   ├── LifecycleCLI.java      # Phase workspace, engineering checklists, phase progress
│   ├── TaskCLI.java           # Engineering task board, priorities, sub-checklists
│   ├── ReleaseGateCLI.java    # Product Release Gates (Gate A Demo / B Pilot / C Prod)
│   ├── FailureCLI.java        # Defect logging, corrective task spawning, retest verification
│   ├── NoteCLI.java           # Technical notes, categorization, cross-project search
│   ├── ExportCLI.java         # JSON project archives and CSV audit report exports
│   └── MainMenu.java          # Core console navigation coordinating all CLI views
├── models/
│   ├── Project.java           # Embedded project metadata (MCU, toolchain, RTOS, repo)
│   ├── Phase.java             # 7 development lifecycle phases
│   ├── Task.java              # Development tasks with status (TODO, DONE, BLOCKED, etc.)
│   ├── TaskChecklistItem.java # Granular task-level checklist items
│   ├── PhaseChecklistItem.java# Phase-specific verification checks (Mandatory/Optional)
│   ├── ReleaseGate.java       # Product Release Gates (Gate A, Gate B, Gate C)
│   ├── ReleaseGateItem.java   # Strict release verification criteria
│   ├── GateFailure.java       # Defect record (Expected vs Actual, Fix, Retest Result)
│   ├── GateHistory.java       # Formal gate sign-off audit records (FW & HW revision)
│   └── Note.java              # Technical decisions, debugging observations, bug notes
├── repository/
│   ├── ProjectRepository.java     # In-memory thread-safe storage for projects
│   ├── PhaseRepository.java       # In-memory storage for phases & phase checklists
│   ├── TaskRepository.java        # In-memory storage for tasks and checklist items
│   ├── ReleaseGateRepository.java # In-memory storage for release gates & audit history
│   ├── GateFailureRepository.java # In-memory storage for failure & retest logs
│   └── NoteRepository.java        # In-memory storage for notes with text search
├── services/
│   ├── ProjectService.java     # Project creation with 7 default phases & 3 release gates
│   ├── PhaseService.java       # Phase lifecycle progression and checklist status
│   ├── TaskService.java        # Task management, sub-item toggling, blocker detection
│   ├── ReleaseGateService.java # Strict gate validation, readiness checks, formal sign-off
│   ├── FailureService.java     # Defect capture, auto-corrective tasks, retest validation
│   ├── NoteService.java        # Engineering note tagging, filtering, keyword search
│   ├── ProgressService.java    # Task progress % vs Release readiness % (PRD Section 4 & 13)
│   └── ExportService.java      # JSON summary & CSV report generator
└── Main.java                  # Application entry point with initial sample project seed
```

---

## 🎯 PRD Compliance Highlights

1. **Development Lifecycle (7 Phases — PRD Section 6):**
   * Phase 1: Requirements and Planning
   * Phase 2: Hardware Study and Bring-up
   * Phase 3: Firmware Architecture and Development
   * Phase 4: Unit and Integration Testing
   * Phase 5: System Validation and Stress Testing
   * Phase 6: Demo or Pilot Preparation
   * Phase 7: Post-Demo Review

2. **Product Release Gates (PRD Section 9 & 10):**
   * **Gate A**: Before Demo (14 mandatory criteria)
   * **Gate B**: Before Pilot Deployment (15 mandatory criteria)
   * **Gate C**: Before Production Release (13 mandatory criteria)
   * Enforces `READY_FOR_REVIEW` when all mandatory items pass.
   * Formal sign-off requires confirming **Firmware Version**, **Hardware Revision**, and **Review Note**.

3. **Failure & Retest Tracking (PRD Section 11):**
   * Log defects with expected vs actual behavior.
   * Auto-generate corrective tasks assigned directly to the phase.
   * Retest verification updates failure status to `VERIFIED` and marks gate check `PASSED`.

4. **Task Progress vs Release Readiness (PRD Section 4 & 13):**
   * A project with 100% completed tasks is **NOT** automatically demo/pilot ready without passing the Release Gates.

---

## 🚀 How to Run

### Option 1: PowerShell Script
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".vscode\run-java.ps1"
```

### Option 2: Command Line (javac / java)
```bash
# 1. Compile into bin/
javac -d bin -sourcepath src src/com/embedded/Main.java

# 2. Run Main
java -cp bin com.embedded.Main
```

