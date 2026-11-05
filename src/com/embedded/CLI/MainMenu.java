package com.embedded.CLI;

import com.embedded.models.Project;
import com.embedded.services.ProjectService;

import java.util.List;
import java.util.Scanner;

public class MainMenu {
    private final DashboardCLI dashboardCLI;
    private final ProjectCLI projectCLI;
    private final LifecycleCLI lifecycleCLI;
    private final TaskCLI taskCLI;
    private final ReleaseGateCLI releaseGateCLI;
    private final FailureCLI failureCLI;
    private final NoteCLI noteCLI;
    private final ExportCLI exportCLI;
    private final ProjectService projectService;
    private final Scanner scanner;

    private Project activeProject;

    public MainMenu(DashboardCLI dashboardCLI, ProjectCLI projectCLI,
                    LifecycleCLI lifecycleCLI, TaskCLI taskCLI,
                    ReleaseGateCLI releaseGateCLI, FailureCLI failureCLI,
                    NoteCLI noteCLI, ExportCLI exportCLI,
                    ProjectService projectService, Scanner scanner) {
        this.dashboardCLI = dashboardCLI;
        this.projectCLI = projectCLI;
        this.lifecycleCLI = lifecycleCLI;
        this.taskCLI = taskCLI;
        this.releaseGateCLI = releaseGateCLI;
        this.failureCLI = failureCLI;
        this.noteCLI = noteCLI;
        this.exportCLI = exportCLI;
        this.projectService = projectService;
        this.scanner = scanner;

        // Auto-select first project if available
        List<Project> all = projectService.getAllProjects();
        if (!all.isEmpty()) {
            this.activeProject = all.get(0);
        }
    }

    public void start() {
        boolean running = true;
        while (running) {
            ConsoleHelper.printHeader("EMBEDDED DEV TRACKER — MAIN CONSOLE");

            if (activeProject != null) {
                System.out.printf("  Active Project: %s[%s] %s%s (MCU: %s | Platform: %s)\n",
                        ConsoleHelper.GREEN, activeProject.getProjectCode(), activeProject.getName(),
                        ConsoleHelper.RESET, activeProject.getMcu(), activeProject.getHardwarePlatform());
            } else {
                System.out.println("  Active Project: " + ConsoleHelper.YELLOW + "None (select a project to begin)" + ConsoleHelper.RESET);
            }

            System.out.println("\n  1. Executive Dashboard");
            System.out.println("  2. My Projects (Create / Switch / Manage)");
            System.out.println("  3. Development Lifecycle (7 Phases & Checklists)");
            System.out.println("  4. Engineering Task Board");
            System.out.println("  5. Product Release Gates (Gate A Demo / B Pilot / C Prod)");
            System.out.println("  6. Failure & Retest Tracking");
            System.out.println("  7. Engineering Technical Notes");
            System.out.println("  8. Data Persistence & Export (JSON / CSV)");
            System.out.println("  0. Exit");

            int choice = ConsoleHelper.readInt(scanner, "Choose navigation option", 0, 8);
            switch (choice) {
                case 1:
                    dashboardCLI.showDashboard(activeProject);
                    break;
                case 2:
                    activeProject = projectCLI.showProjectsMenu(activeProject);
                    break;
                case 3:
                    lifecycleCLI.showLifecycleMenu(activeProject);
                    break;
                case 4:
                    taskCLI.showTasksMenu(activeProject);
                    break;
                case 5:
                    releaseGateCLI.showGatesMenu(activeProject);
                    break;
                case 6:
                    failureCLI.showFailuresMenu();
                    break;
                case 7:
                    noteCLI.showNotesMenu(activeProject);
                    break;
                case 8:
                    exportCLI.showExportMenu(activeProject);
                    break;
                case 0:
                    System.out.println(ConsoleHelper.CYAN + "\nExiting Embedded Dev Tracker. Happy hacking!" + ConsoleHelper.RESET);
                    running = false;
                    break;
            }
        }
    }
}

