package com.embedded.CLI;

import com.embedded.models.*;
import com.embedded.services.*;

import java.util.List;

public class DashboardCLI {
    private final ProjectService projectService;
    private final TaskService taskService;
    private final ReleaseGateService gateService;
    private final PhaseService phaseService;
    private final ProgressService progressService;

    public DashboardCLI(ProjectService projectService, TaskService taskService,
                        ReleaseGateService gateService, PhaseService phaseService,
                        ProgressService progressService) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.gateService = gateService;
        this.phaseService = phaseService;
        this.progressService = progressService;
    }

    public void showDashboard(Project activeProject) {
        ConsoleHelper.printHeader("EMBEDDED DEV TRACKER — EXECUTIVE DASHBOARD");

        List<Project> projects = projectService.getAllProjects();
        long activeCount = projects.stream().filter(p -> p.getStatus() == Project.Status.ACTIVE).count();
        long completedCount = projects.stream().filter(p -> p.getStatus() == Project.Status.COMPLETED).count();

        List<Task> allTasks = taskService.getAllTasks();
        long blockedTasks = allTasks.stream().filter(t -> t.getStatus() == Task.Status.BLOCKED).count();
        long inProgressTasks = allTasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count();
        long doneTasks = allTasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();

        System.out.println(ConsoleHelper.BOLD + "📊 OVERALL SYSTEM METRICS" + ConsoleHelper.RESET);
        System.out.printf("  Total Projects : %-5d | Active : %-5d | Completed : %-5d\n",
                projects.size(), activeCount, completedCount);
        System.out.printf("  Total Tasks    : %-5d | Done   : %-5d | In Progress : %-5d | Blocked : %-5d\n",
                allTasks.size(), doneTasks, inProgressTasks, blockedTasks);

        if (activeProject != null) {
            ConsoleHelper.printSubHeader("ACTIVE PROJECT: [" + activeProject.getProjectCode() + "] " + activeProject.getName());
            System.out.printf("  Hardware Platform : %-20s | MCU/SoC: %-20s\n",
                    activeProject.getHardwarePlatform(), activeProject.getMcu());
            System.out.printf("  IDE / Toolchain   : %-20s | RTOS   : %-20s\n",
                    activeProject.getIde(), activeProject.getRtos() != null ? activeProject.getRtos() : "Bare-metal");

            ProgressService.ProjectMetrics m = progressService.calculateMetrics(activeProject.getId());

            System.out.println();
            System.out.println(ConsoleHelper.BOLD + "📈 PROGRESS vs RELEASE READINESS (PRD Section 4 & 13)" + ConsoleHelper.RESET);
            System.out.printf("  Development Task Progress : %.1f%% (%d/%d tasks done)\n",
                    m.devTaskProgressPercent, m.completedTasks, m.totalTasks);
            System.out.printf("  Product Release Readiness : %.1f%% (%d/%d gate checks passed)\n",
                    m.releaseReadinessPercent, m.passedGateItems, m.totalGateItems);

            System.out.print("  Readiness Badges: ");
            if (m.isDemoReady) System.out.print(ConsoleHelper.GREEN + "[DEMO READY] " + ConsoleHelper.RESET);
            else System.out.print(ConsoleHelper.YELLOW + "[DEMO: INCOMPLETE] " + ConsoleHelper.RESET);

            if (m.isPilotReady) System.out.print(ConsoleHelper.GREEN + "[PILOT READY] " + ConsoleHelper.RESET);
            else System.out.print(ConsoleHelper.YELLOW + "[PILOT: PENDING] " + ConsoleHelper.RESET);

            if (m.isProductionReady) System.out.print(ConsoleHelper.GREEN + "[PRODUCTION READY] " + ConsoleHelper.RESET);
            else System.out.print(ConsoleHelper.YELLOW + "[PROD: LOCKED] " + ConsoleHelper.RESET);
            System.out.println();

            // Gates Status summary
            List<ReleaseGate> gates = gateService.getGatesForProject(activeProject.getId());
            System.out.println();
            System.out.println("  Release Gate Summary:");
            for (ReleaseGate g : gates) {
                String color = g.getStatus() == ReleaseGate.Status.PASSED ? ConsoleHelper.GREEN :
                        g.getStatus() == ReleaseGate.Status.READY_FOR_REVIEW ? ConsoleHelper.CYAN :
                        g.getStatus() == ReleaseGate.Status.BLOCKED ? ConsoleHelper.RED : ConsoleHelper.YELLOW;
                System.out.printf("    • %-35s -> %s%s%s (FW: %s)\n",
                        g.getName(), color, g.getStatus(), ConsoleHelper.RESET,
                        g.getFirmwareVersion() != null ? g.getFirmwareVersion() : "Not frozen");
            }

            // Blockers warning
            if (m.blockedTasks > 0 || m.failedGateItems > 0) {
                System.out.println();
                ConsoleHelper.printWarning(String.format("Critical Blockers Present: %d blocked tasks, %d failed gate verification items!",
                        m.blockedTasks, m.failedGateItems));
            }
        } else {
            System.out.println();
            ConsoleHelper.printWarning("No active project selected. Choose 'My Projects' to select or create a project.");
        }
    }
}

