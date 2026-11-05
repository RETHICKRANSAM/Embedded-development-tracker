package com.embedded.CLI;

import com.embedded.models.Project;
import com.embedded.services.ProjectService;

import java.util.List;
import java.util.Scanner;

public class ProjectCLI {
    private final ProjectService projectService;
    private final Scanner scanner;

    public ProjectCLI(ProjectService projectService, Scanner scanner) {
        this.projectService = projectService;
        this.scanner = scanner;
    }

    public Project showProjectsMenu(Project currentActive) {
        while (true) {
            ConsoleHelper.printHeader("MY PROJECTS — EMBEDDED REPOSITORIES");
            List<Project> projects = projectService.getAllProjects();

            if (projects.isEmpty()) {
                System.out.println("  No projects found.");
            } else {
                for (int i = 0; i < projects.size(); i++) {
                    Project p = projects.get(i);
                    boolean isActive = currentActive != null && currentActive.getId().equals(p.getId());
                    System.out.printf("  %d. %s[%s] %s%s (Platform: %s, MCU: %s) [%s]\n",
                            i + 1,
                            isActive ? ConsoleHelper.GREEN + "👉 " : "   ",
                            p.getProjectCode(),
                            p.getName(),
                            isActive ? " (ACTIVE)" + ConsoleHelper.RESET : "",
                            p.getHardwarePlatform(),
                            p.getMcu(),
                            p.getStatus());
                }
            }

            System.out.println();
            System.out.println("  1. Select Active Project");
            System.out.println("  2. Create New Embedded Project");
            System.out.println("  3. View Project Details");
            System.out.println("  4. Delete Project");
            System.out.println("  0. Back to Main Menu");

            int choice = ConsoleHelper.readInt(scanner, "Enter choice", 0, 4);
            switch (choice) {
                case 1:
                    if (projects.isEmpty()) {
                        ConsoleHelper.printError("No projects available to select.");
                        break;
                    }
                    int sel = ConsoleHelper.readInt(scanner, "Select project index", 1, projects.size());
                    currentActive = projects.get(sel - 1);
                    ConsoleHelper.printSuccess("Switched active project to: " + currentActive.getName());
                    return currentActive;
                case 2:
                    currentActive = createNewProject();
                    return currentActive;
                case 3:
                    viewProjectDetails(projects);
                    break;
                case 4:
                    deleteProject(projects, currentActive);
                    break;
                case 0:
                    return currentActive;
            }
        }
    }

    private Project createNewProject() {
        ConsoleHelper.printSubHeader("Create New Embedded Development Project");
        String name = ConsoleHelper.readString(scanner, "Project Name (e.g. STM32 Sensor Hub)", false);
        String code = ConsoleHelper.readString(scanner, "Project Code (e.g. EMB-001)", false);
        String desc = ConsoleHelper.readString(scanner, "Description", true);
        String category = ConsoleHelper.readString(scanner, "Category (Firmware / IoT / Driver / Linux)", false);
        String platform = ConsoleHelper.readString(scanner, "Hardware Platform (e.g. Custom PCB, Nucleo-64)", false);
        String mcu = ConsoleHelper.readString(scanner, "MCU / SoC (e.g. STM32F401RE, ESP32-S3)", false);
        String ide = ConsoleHelper.readString(scanner, "IDE / Toolchain (e.g. STM32CubeIDE, VS Code + PlatformIO)", false);
        String lang = ConsoleHelper.readString(scanner, "Programming Language (e.g. C / C++ / Embedded Rust)", false);
        String rtos = ConsoleHelper.readString(scanner, "RTOS / OS (e.g. FreeRTOS, Zephyr, None / Bare-Metal)", true);
        String repo = ConsoleHelper.readString(scanner, "Repository URL (optional)", true);

        Project created = projectService.createProject(name, code, desc, category, platform, mcu, ide, lang, rtos, repo);
        ConsoleHelper.printSuccess("Project successfully created with 7 default phases and 3 release gates!");
        return created;
    }

    private void viewProjectDetails(List<Project> projects) {
        if (projects.isEmpty()) {
            ConsoleHelper.printError("No projects available.");
            return;
        }
        int sel = ConsoleHelper.readInt(scanner, "Select project index to view", 1, projects.size());
        Project p = projects.get(sel - 1);

        ConsoleHelper.printSubHeader("Specification: " + p.getName());
        System.out.println("  Project Code    : " + p.getProjectCode());
        System.out.println("  Category        : " + p.getCategory());
        System.out.println("  Description     : " + p.getDescription());
        System.out.println("  Hardware Board  : " + p.getHardwarePlatform());
        System.out.println("  MCU / SoC       : " + p.getMcu());
        System.out.println("  Toolchain / IDE : " + p.getIde());
        System.out.println("  Language        : " + p.getLanguage());
        System.out.println("  RTOS / OS       : " + (p.getRtos() != null ? p.getRtos() : "Bare-metal"));
        System.out.println("  Repository      : " + (p.getRepositoryUrl() != null ? p.getRepositoryUrl() : "None"));
        System.out.println("  Status          : " + p.getStatus());
        System.out.println("  Created At      : " + p.getCreatedAt());

        System.out.println("\nPress Enter to continue...");
        scanner.nextLine();
    }

    private void deleteProject(List<Project> projects, Project currentActive) {
        if (projects.isEmpty()) {
            ConsoleHelper.printError("No projects to delete.");
            return;
        }
        int sel = ConsoleHelper.readInt(scanner, "Select project index to DELETE", 1, projects.size());
        Project target = projects.get(sel - 1);
        if (ConsoleHelper.confirm(scanner, "Are you sure you want to delete '" + target.getName() + "' and all associated data?")) {
            projectService.deleteProject(target.getId());
            ConsoleHelper.printSuccess("Project deleted.");
        }
    }
}

