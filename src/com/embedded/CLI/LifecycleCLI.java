package com.embedded.CLI;

import com.embedded.models.*;
import com.embedded.services.*;

import java.util.List;
import java.util.Scanner;

public class LifecycleCLI {
    private final PhaseService phaseService;
    private final TaskService taskService;
    private final NoteService noteService;
    private final Scanner scanner;

    public LifecycleCLI(PhaseService phaseService, TaskService taskService,
                        NoteService noteService, Scanner scanner) {
        this.phaseService = phaseService;
        this.taskService = taskService;
        this.noteService = noteService;
        this.scanner = scanner;
    }

    public void showLifecycleMenu(Project activeProject) {
        if (activeProject == null) {
            ConsoleHelper.printError("Please select an active project first.");
            return;
        }

        while (true) {
            ConsoleHelper.printHeader("DEVELOPMENT LIFECYCLE — [" + activeProject.getProjectCode() + "]");
            List<Phase> phases = phaseService.getPhasesByProjectId(activeProject.getId());

            for (int i = 0; i < phases.size(); i++) {
                Phase ph = phases.get(i);
                double progress = phaseService.getPhaseProgress(ph.getId());
                String statusColor = ph.getStatus() == Phase.Status.COMPLETED ? ConsoleHelper.GREEN :
                        ph.getStatus() == Phase.Status.IN_PROGRESS ? ConsoleHelper.CYAN : ConsoleHelper.RESET;

                System.out.printf("  %d. Phase %d: %-40s [%s%s%s] (%.0f%% items passed)\n",
                        i + 1,
                        ph.getSequence(),
                        ph.getName(),
                        statusColor, ph.getStatus(), ConsoleHelper.RESET,
                        progress);
            }

            System.out.println();
            System.out.println("  1. Open Phase Workspace (Checklists & Tasks)");
            System.out.println("  2. Advance Phase Status");
            System.out.println("  0. Back to Main Menu");

            int choice = ConsoleHelper.readInt(scanner, "Enter choice", 0, 2);
            switch (choice) {
                case 1:
                    int pSel = ConsoleHelper.readInt(scanner, "Select phase number to inspect", 1, phases.size());
                    openPhaseWorkspace(phases.get(pSel - 1), activeProject);
                    break;
                case 2:
                    int aSel = ConsoleHelper.readInt(scanner, "Select phase to update status", 1, phases.size());
                    updatePhaseStatus(phases.get(aSel - 1));
                    break;
                case 0:
                    return;
            }
        }
    }

    private void openPhaseWorkspace(Phase phase, Project project) {
        while (true) {
            ConsoleHelper.printHeader("PHASE WORKSPACE: Phase " + phase.getSequence() + " - " + phase.getName());
            System.out.println("  Description: " + phase.getDescription());
            System.out.println("  Current Status: " + phase.getStatus());

            List<PhaseChecklistItem> items = phaseService.getChecklistItems(phase.getId());
            ConsoleHelper.printSubHeader("Engineering Verification Checklist");
            if (items.isEmpty()) {
                System.out.println("  No checklist items configured.");
            } else {
                for (int i = 0; i < items.size(); i++) {
                    PhaseChecklistItem it = items.get(i);
                    String stat = it.getStatus() == PhaseChecklistItem.Status.PASSED ? ConsoleHelper.GREEN + "[PASSED]" + ConsoleHelper.RESET :
                            it.getStatus() == PhaseChecklistItem.Status.FAILED ? ConsoleHelper.RED + "[FAILED]" + ConsoleHelper.RESET :
                            it.getStatus() == PhaseChecklistItem.Status.WAIVED ? ConsoleHelper.YELLOW + "[WAIVED]" + ConsoleHelper.RESET :
                            "[PENDING]";
                    System.out.printf("  %d. %s %s%s\n",
                            i + 1, stat, it.getTitle(), it.isMandatory() ? ConsoleHelper.YELLOW + " (*Mandatory)" + ConsoleHelper.RESET : "");
                }
            }

            List<Task> tasks = taskService.getTasksByPhaseId(phase.getId());
            ConsoleHelper.printSubHeader("Phase Development Tasks (" + tasks.size() + ")");
            for (Task t : tasks) {
                System.out.printf("  • [%s] [%s] %s\n", t.getStatus(), t.getPriority(), t.getTitle());
            }

            System.out.println();
            System.out.println("  1. Update Checklist Item Status");
            System.out.println("  2. Add Custom Checklist Item");
            System.out.println("  3. Add Quick Task to This Phase");
            System.out.println("  4. View/Add Notes for This Phase");
            System.out.println("  0. Back to Lifecycle Overview");

            int ch = ConsoleHelper.readInt(scanner, "Enter choice", 0, 4);
            switch (ch) {
                case 1:
                    if (items.isEmpty()) break;
                    int itemIdx = ConsoleHelper.readInt(scanner, "Select item index to toggle", 1, items.size());
                    PhaseChecklistItem targetItem = items.get(itemIdx - 1);
                    System.out.println("Choose new status: 1. PASSED | 2. FAILED | 3. WAIVED | 4. PENDING");
                    int sChoice = ConsoleHelper.readInt(scanner, "Status", 1, 4);
                    PhaseChecklistItem.Status newStat = sChoice == 1 ? PhaseChecklistItem.Status.PASSED :
                            sChoice == 2 ? PhaseChecklistItem.Status.FAILED :
                            sChoice == 3 ? PhaseChecklistItem.Status.WAIVED : PhaseChecklistItem.Status.PENDING;
                    phaseService.updateChecklistItemStatus(targetItem.getId(), newStat);
                    ConsoleHelper.printSuccess("Updated item status to " + newStat);
                    break;
                case 2:
                    String title = ConsoleHelper.readString(scanner, "Item Title", false);
                    String desc = ConsoleHelper.readString(scanner, "Item Description (optional)", true);
                    boolean mand = ConsoleHelper.confirm(scanner, "Is this check mandatory?");
                    phaseService.addCustomChecklistItem(project.getId(), phase.getId(), title, desc, mand);
                    ConsoleHelper.printSuccess("Checklist item added.");
                    break;
                case 3:
                    String tTitle = ConsoleHelper.readString(scanner, "Task Title", false);
                    String tDesc = ConsoleHelper.readString(scanner, "Task Description", true);
                    taskService.createTask(project.getId(), phase.getId(), tTitle, tDesc, Task.Priority.HIGH, null);
                    ConsoleHelper.printSuccess("Task created in " + phase.getName());
                    break;
                case 4:
                    List<Note> phaseNotes = noteService.getNotesByPhase(phase.getId());
                    ConsoleHelper.printSubHeader("Phase Notes (" + phaseNotes.size() + ")");
                    for (Note n : phaseNotes) {
                        System.out.printf("  • [%s] %s: %s\n", n.getCategory(), n.getTitle(), n.getContent());
                    }
                    if (ConsoleHelper.confirm(scanner, "Add a new note to this phase?")) {
                        String nTitle = ConsoleHelper.readString(scanner, "Note Title", false);
                        String nContent = ConsoleHelper.readString(scanner, "Content", false);
                        noteService.createNote(project.getId(), phase.getId(), nTitle, nContent, Note.Category.DEBUGGING);
                        ConsoleHelper.printSuccess("Note added.");
                    }
                    break;
                case 0:
                    return;
            }
        }
    }

    private void updatePhaseStatus(Phase phase) {
        System.out.println("Select Status for Phase " + phase.getSequence() + ":");
        System.out.println("1. NOT_STARTED | 2. IN_PROGRESS | 3. COMPLETED");
        int c = ConsoleHelper.readInt(scanner, "Status", 1, 3);
        Phase.Status s = c == 1 ? Phase.Status.NOT_STARTED : c == 2 ? Phase.Status.IN_PROGRESS : Phase.Status.COMPLETED;
        phaseService.updatePhaseStatus(phase.getId(), s);
        ConsoleHelper.printSuccess("Phase status updated to " + s);
    }
}

