package com.embedded;

import com.embedded.CLI.*;
import com.embedded.models.*;
import com.embedded.repository.*;
import com.embedded.services.*;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // 1. Repositories
        ProjectRepository projectRepo = new ProjectRepository();
        PhaseRepository phaseRepo = new PhaseRepository();
        TaskRepository taskRepo = new TaskRepository();
        ReleaseGateRepository gateRepo = new ReleaseGateRepository();
        GateFailureRepository failureRepo = new GateFailureRepository();
        NoteRepository noteRepo = new NoteRepository();

        // 2. Services
        ReleaseGateService gateService = new ReleaseGateService(gateRepo);
        TaskService taskService = new TaskService(taskRepo);
        ProjectService projectService = new ProjectService(projectRepo, phaseRepo, gateService, taskRepo, noteRepo);
        PhaseService phaseService = new PhaseService(phaseRepo);
        FailureService failureService = new FailureService(failureRepo, gateRepo, taskService, gateService);
        NoteService noteService = new NoteService(noteRepo);
        ProgressService progressService = new ProgressService(taskRepo, phaseRepo, gateRepo);
        ExportService exportService = new ExportService(projectRepo, phaseRepo, taskRepo, gateRepo, noteRepo);

        // 3. Seed Initial Example Projects
        seedData(projectService, phaseService, taskService, gateService, noteService);

        // 4. CLI Setup
        Scanner scanner = new Scanner(System.in);
        DashboardCLI dashboardCLI = new DashboardCLI(projectService, taskService, gateService, phaseService, progressService);
        ProjectCLI projectCLI = new ProjectCLI(projectService, scanner);
        LifecycleCLI lifecycleCLI = new LifecycleCLI(phaseService, taskService, noteService, scanner);
        TaskCLI taskCLI = new TaskCLI(taskService, phaseService, scanner);
        ReleaseGateCLI releaseGateCLI = new ReleaseGateCLI(gateService, failureService, scanner);
        FailureCLI failureCLI = new FailureCLI(failureService, scanner);
        NoteCLI noteCLI = new NoteCLI(noteService, scanner);
        ExportCLI exportCLI = new ExportCLI(exportService, scanner);

        MainMenu mainMenu = new MainMenu(
                dashboardCLI, projectCLI, lifecycleCLI, taskCLI,
                releaseGateCLI, failureCLI, noteCLI, exportCLI,
                projectService, scanner
        );

        // 5. Run Application
        mainMenu.start();
    }

    private static void seedData(ProjectService projectService, PhaseService phaseService,
                                 TaskService taskService, ReleaseGateService gateService,
                                 NoteService noteService) {
        // Sample Project 1: STM32 Environmental Sensor Node
        Project p1 = projectService.createProject(
                "STM32 Environmental Sensor Hub",
                "STM32-ENV-01",
                "Low-power environmental sensor node monitoring temperature, humidity, and VOC over LoRaWAN.",
                "IoT / Firmware",
                "Nucleo-WL55JC2",
                "STM32WL55CC",
                "STM32CubeIDE",
                "C / Embedded C",
                "FreeRTOS",
                "https://github.com/engineer/stm32-env-hub"
        );

        // Add sample tasks to Phase 1 & 2
        var phases = phaseService.getPhasesByProjectId(p1.getId());
        if (!phases.isEmpty()) {
            Phase ph1 = phases.get(0);
            Task t1 = taskService.createTask(p1.getId(), ph1.getId(), "Draft LoRaWAN payload specification",
                    "Define bitmask and byte compression for sensor telemetry payload.", Task.Priority.HIGH, "2026-11-15");
            t1.setStatus(Task.Status.DONE);
            taskService.addChecklistItem(t1.getId(), "Calculate payload airtime under SF7");
            taskService.addChecklistItem(t1.getId(), "Review byte-ordering (endianness)");
            taskService.toggleChecklistItem(t1.getId(), t1.getChecklistItems().get(0).getId());

            Task t2 = taskService.createTask(p1.getId(), ph1.getId(), "Select low-quiescent LDO regulator",
                    "Benchmark quiescent current for battery-backed sleep modes.", Task.Priority.MEDIUM, "2026-11-20");

            if (phases.size() > 1) {
                Phase ph2 = phases.get(1);
                taskService.createTask(p1.getId(), ph2.getId(), "Verify SPI bus clock integrity with oscilloscope",
                        "Probe clock ringing on I2C/SPI lines when sensor daughterboard is attached.", Task.Priority.CRITICAL, "2026-11-25");
            }
        }

        // Add sample notes
        noteService.createNote(p1.getId(), phases.get(0).getId(),
                "Power Budget & Sleep Current Target",
                "Target sleep current in STOP2 mode is < 3.5 uA. Wake-up interval set to 15 minutes using RTC alarm.",
                Note.Category.TECHNICAL_DECISION);

        noteService.createNote(p1.getId(), phases.get(1).getId(),
                "I2C Pull-Up Resistor Observation",
                "Internal pull-ups on B-L072Z board were insufficient at 400kHz Fast Mode. Added 2.2k external pull-ups.",
                Note.Category.HARDWARE);

        // Sample Project 2: ESP32-S3 Matter Smart Gateway
        projectService.createProject(
                "Matter Smart Home Bridge",
                "ESP-MATTER-02",
                "Thread and WiFi Matter bridge coordinating Zigbee end-devices with Apple HomeKit and Google Home.",
                "Smart Home / Edge-AI",
                "ESP32-S3-DevKitC-1",
                "ESP32-S3",
                "VS Code + ESP-IDF v5.1",
                "C++",
                "FreeRTOS (ESP-IDF)",
                "https://github.com/engineer/esp32-matter-bridge"
        );
    }
}

