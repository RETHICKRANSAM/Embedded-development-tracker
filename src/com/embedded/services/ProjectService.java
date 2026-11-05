package com.embedded.services;

import com.embedded.models.*;
import com.embedded.repository.*;

import java.util.*;

public class ProjectService {
    private final ProjectRepository projectRepo;
    private final PhaseRepository phaseRepo;
    private final ReleaseGateService gateService;
    private final TaskRepository taskRepo;
    private final NoteRepository noteRepo;

    public ProjectService(ProjectRepository projectRepo, PhaseRepository phaseRepo,
                          ReleaseGateService gateService, TaskRepository taskRepo,
                          NoteRepository noteRepo) {
        this.projectRepo = projectRepo;
        this.phaseRepo = phaseRepo;
        this.gateService = gateService;
        this.taskRepo = taskRepo;
        this.noteRepo = noteRepo;
    }

    public Project createProject(String name, String projectCode, String description,
                                 String category, String hardwarePlatform, String mcu,
                                 String ide, String language, String rtos, String repositoryUrl) {
        String id = UUID.randomUUID().toString();
        Project project = new Project(id, name, projectCode, description, category,
                hardwarePlatform, mcu, ide, language, rtos, repositoryUrl);

        projectRepo.save(project);

        // Initialize 7 Default Lifecycle Phases from PRD Section 6
        initializeDefaultPhases(project);

        // Initialize 3 Default Release Gates from PRD Section 9
        gateService.initializeDefaultGates(project.getId());

        return project;
    }

    private void initializeDefaultPhases(Project project) {
        String pId = project.getId();

        Phase[] phases = new Phase[]{
            new Phase(UUID.randomUUID().toString(), pId, "Requirements and Planning",
                    "Define objective, architecture constraints, and hardware/software requirements.", 1),
            new Phase(UUID.randomUUID().toString(), pId, "Hardware Study and Bring-up",
                    "Verify power supply, clock, GPIOs, debugger, and UART logging on target hardware.", 2),
            new Phase(UUID.randomUUID().toString(), pId, "Firmware Architecture and Development",
                    "Implement modular drivers, middleware, application logic, and error handling.", 3),
            new Phase(UUID.randomUUID().toString(), pId, "Unit and Integration Testing",
                    "Validate peripheral drivers, RTOS interactions, static analysis, and fix critical defects.", 4),
            new Phase(UUID.randomUUID().toString(), pId, "System Validation and Stress Testing",
                    "End-to-end integration, reset cycles, power-loss recovery, and timing analysis.", 5),
            new Phase(UUID.randomUUID().toString(), pId, "Demo or Pilot Preparation",
                    "Freeze firmware version, verify demonstration setup, and pass Release Gates.", 6),
            new Phase(UUID.randomUUID().toString(), pId, "Post-Demo Review",
                    "Record stakeholder feedback, capture anomalies, and plan next development milestone.", 7)
        };

        phases[0].setStatus(Phase.Status.IN_PROGRESS);
        project.setCurrentPhaseId(phases[0].getId());
        projectRepo.save(project);

        for (Phase phase : phases) {
            phaseRepo.savePhase(phase);
        }

        // Add Default Phase Checklist Items (Section 6)
        addDefaultChecklistItems(phases[0].getId(), pId, new String[]{
            "Define project objective",
            "Define functional requirements",
            "Define hardware and software requirements",
            "Select MCU/SoC and development board",
            "Identify peripherals and interfaces",
            "Define acceptance criteria",
            "Create project repository",
            "Record project risks and assumptions"
        });

        addDefaultChecklistItems(phases[1].getId(), pId, new String[]{
            "Review datasheet and reference manual",
            "Verify board power supply",
            "Verify clock and reset configuration",
            "Verify GPIO configuration",
            "Verify debugger connection",
            "Verify UART logging",
            "Verify required peripheral interfaces",
            "Record hardware issues and observations"
        });

        addDefaultChecklistItems(phases[2].getId(), pId, new String[]{
            "Define firmware architecture",
            "Create modular project structure",
            "Configure build system",
            "Implement drivers",
            "Implement middleware and application logic",
            "Handle errors and timeouts",
            "Add logging and diagnostics",
            "Review memory usage",
            "Review interrupt and concurrency behavior",
            "Commit changes to version control"
        });

        addDefaultChecklistItems(phases[3].getId(), pId, new String[]{
            "Test individual functions and modules",
            "Test drivers against real hardware",
            "Verify UART, SPI, I2C, ADC, PWM, DMA interfaces",
            "Verify error handling and boundary conditions",
            "Test RTOS task interactions",
            "Verify communication failures and recovery",
            "Run static analysis",
            "Fix critical defects",
            "Record test results and evidence"
        });

        addDefaultChecklistItems(phases[4].getId(), pId, new String[]{
            "Verify complete system functionality",
            "Test repeated startup and reset",
            "Test power interruption and recovery",
            "Test peripheral and communication failures",
            "Measure CPU and memory usage",
            "Perform a long-duration test",
            "Verify timing requirements",
            "Verify thermal and power behavior",
            "Record known issues and limitations"
        });

        addDefaultChecklistItems(phases[5].getId(), pId, new String[]{
            "Freeze demo firmware version",
            "Verify hardware configuration",
            "Test main use cases end-to-end",
            "Verify startup and shutdown",
            "Check logs and diagnostic messages",
            "Verify recovery from expected failures",
            "Prepare known-good backup firmware image",
            "Prepare setup and demonstration instructions",
            "Record remaining issues",
            "Complete Product Release Gates checklist"
        });

        addDefaultChecklistItems(phases[6].getId(), pId, new String[]{
            "Record demo feedback",
            "Record failures and unexpected behavior",
            "Create follow-up tasks",
            "Document improvements",
            "Decide next development milestone"
        });
    }

    private void addDefaultChecklistItems(String phaseId, String projectId, String[] items) {
        for (int i = 0; i < items.length; i++) {
            PhaseChecklistItem item = new PhaseChecklistItem(
                    UUID.randomUUID().toString(),
                    projectId,
                    phaseId,
                    items[i],
                    items[i],
                    i + 1,
                    i < 4 // First few are marked mandatory
            );
            phaseRepo.saveChecklistItem(item);
        }
    }

    public List<Project> getAllProjects() {
        return projectRepo.findAll();
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepo.findById(id);
    }

    public Optional<Project> getProjectByCode(String code) {
        return projectRepo.findByCode(code);
    }

    public void updateProject(Project project) {
        projectRepo.save(project);
    }

    public boolean deleteProject(String id) {
        phaseRepo.deleteByProjectId(id);
        gateService.deleteByProjectId(id);
        taskRepo.deleteByProjectId(id);
        noteRepo.deleteByProjectId(id);
        return projectRepo.deleteById(id);
    }

    public int count() {
        return projectRepo.count();
    }
}

