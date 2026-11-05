package com.embedded.CLI;

import com.embedded.models.*;
import com.embedded.services.*;

import java.util.List;
import java.util.Scanner;

public class TaskCLI {
    private final TaskService taskService;
    private final PhaseService phaseService;
    private final Scanner scanner;

    public TaskCLI(TaskService taskService, PhaseService phaseService, Scanner scanner) {
        this.taskService = taskService;
        this.phaseService = phaseService;
        this.scanner = scanner;
    }

    public void showTasksMenu(Project activeProject) {
        if (activeProject == null) {
            ConsoleHelper.printError("Please select an active project first.");
            return;
        }

        while (true) {
            ConsoleHelper.printHeader("ENGINEERING TASK BOARD — [" + activeProject.getProjectCode() + "]");
            List<Task> tasks = taskService.getTasksByProjectId(activeProject.getId());

            if (tasks.isEmpty()) {
                System.out.println("  No tasks created yet for this project.");
            } else {
                for (int i = 0; i < tasks.size(); i++) {
                    Task t = tasks.get(i);
                    String color = t.getStatus() == Task.Status.DONE ? ConsoleHelper.GREEN :
                            t.getStatus() == Task.Status.BLOCKED ? ConsoleHelper.RED :
                            t.getStatus() == Task.Status.IN_PROGRESS ? ConsoleHelper.CYAN : ConsoleHelper.RESET;

                    System.out.printf("  %d. [%s%s%s] [%-8s] %-35s (Due: %s)\n",
                            i + 1,
                            color, t.getStatus(), ConsoleHelper.RESET,
                            t.getPriority(),
                            t.getTitle(),
                            t.getDueDate() != null ? t.getDueDate() : "None");

                    // Sub checklist items
                    for (TaskChecklistItem ci : t.getChecklistItems()) {
                        System.out.printf("       └─ [%s] %s\n", ci.isCompleted() ? "✔" : " ", ci.getTitle());
                    }
                }
            }

            System.out.println();
            System.out.println("  1. Create New Task");
            System.out.println("  2. Change Task Status");
            System.out.println("  3. Add Sub-checklist Item to Task");
            System.out.println("  4. Toggle Sub-checklist Item");
            System.out.println("  5. Delete Task");
            System.out.println("  0. Back to Main Menu");

            int choice = ConsoleHelper.readInt(scanner, "Enter choice", 0, 5);
            switch (choice) {
                case 1:
                    createNewTask(activeProject);
                    break;
                case 2:
                    changeTaskStatus(tasks);
                    break;
                case 3:
                    addSubChecklistItem(tasks);
                    break;
                case 4:
                    toggleSubChecklistItem(tasks);
                    break;
                case 5:
                    deleteTask(tasks);
                    break;
                case 0:
                    return;
            }
        }
    }

    private void createNewTask(Project project) {
        ConsoleHelper.printSubHeader("Create New Task");
        String title = ConsoleHelper.readString(scanner, "Task Title", false);
        String desc = ConsoleHelper.readString(scanner, "Description", true);

        List<Phase> phases = phaseService.getPhasesByProjectId(project.getId());
        System.out.println("Assign to development phase:");
        for (int i = 0; i < phases.size(); i++) {
            System.out.printf("  %d. Phase %d: %s\n", i + 1, phases.get(i).getSequence(), phases.get(i).getName());
        }
        int pChoice = ConsoleHelper.readInt(scanner, "Phase number", 1, phases.size());
        String phaseId = phases.get(pChoice - 1).getId();

        System.out.println("Select Priority: 1. LOW | 2. MEDIUM | 3. HIGH | 4. CRITICAL");
        int prChoice = ConsoleHelper.readInt(scanner, "Priority", 1, 4);
        Task.Priority priority = prChoice == 1 ? Task.Priority.LOW :
                prChoice == 2 ? Task.Priority.MEDIUM :
                prChoice == 3 ? Task.Priority.HIGH : Task.Priority.CRITICAL;

        String dueDate = ConsoleHelper.readString(scanner, "Due Date (YYYY-MM-DD or leave blank)", true);
        if (dueDate.isEmpty()) dueDate = null;

        taskService.createTask(project.getId(), phaseId, title, desc, priority, dueDate);
        ConsoleHelper.printSuccess("Task created successfully!");
    }

    private void changeTaskStatus(List<Task> tasks) {
        if (tasks.isEmpty()) return;
        int idx = ConsoleHelper.readInt(scanner, "Select task index to change status", 1, tasks.size());
        Task target = tasks.get(idx - 1);

        System.out.println("Select Status for [" + target.getTitle() + "]:");
        System.out.println("1. TO_DO | 2. IN_PROGRESS | 3. PENDING | 4. BLOCKED | 5. DONE");
        int c = ConsoleHelper.readInt(scanner, "Status", 1, 5);
        Task.Status s = c == 1 ? Task.Status.TO_DO :
                c == 2 ? Task.Status.IN_PROGRESS :
                c == 3 ? Task.Status.PENDING :
                c == 4 ? Task.Status.BLOCKED : Task.Status.DONE;

        taskService.updateTaskStatus(target.getId(), s);
        ConsoleHelper.printSuccess("Updated status to " + s);
    }

    private void addSubChecklistItem(List<Task> tasks) {
        if (tasks.isEmpty()) return;
        int idx = ConsoleHelper.readInt(scanner, "Select task index", 1, tasks.size());
        Task target = tasks.get(idx - 1);
        String title = ConsoleHelper.readString(scanner, "Sub-item Title", false);
        taskService.addChecklistItem(target.getId(), title);
        ConsoleHelper.printSuccess("Checklist sub-item added.");
    }

    private void toggleSubChecklistItem(List<Task> tasks) {
        if (tasks.isEmpty()) return;
        int idx = ConsoleHelper.readInt(scanner, "Select task index", 1, tasks.size());
        Task target = tasks.get(idx - 1);
        if (target.getChecklistItems().isEmpty()) {
            ConsoleHelper.printError("No sub-items exist on this task.");
            return;
        }

        System.out.println("Checklist items:");
        for (int i = 0; i < target.getChecklistItems().size(); i++) {
            TaskChecklistItem ci = target.getChecklistItems().get(i);
            System.out.printf("  %d. [%s] %s\n", i + 1, ci.isCompleted() ? "✔" : " ", ci.getTitle());
        }
        int ciIdx = ConsoleHelper.readInt(scanner, "Select item to toggle", 1, target.getChecklistItems().size());
        taskService.toggleChecklistItem(target.getId(), target.getChecklistItems().get(ciIdx - 1).getId());
        ConsoleHelper.printSuccess("Toggled item.");
    }

    private void deleteTask(List<Task> tasks) {
        if (tasks.isEmpty()) return;
        int idx = ConsoleHelper.readInt(scanner, "Select task index to delete", 1, tasks.size());
        taskService.deleteTask(tasks.get(idx - 1).getId());
        ConsoleHelper.printSuccess("Task deleted.");
    }
}

