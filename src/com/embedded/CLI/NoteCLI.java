package com.embedded.CLI;

import com.embedded.models.Note;
import com.embedded.models.Project;
import com.embedded.services.NoteService;

import java.util.List;
import java.util.Scanner;

public class NoteCLI {
    private final NoteService noteService;
    private final Scanner scanner;

    public NoteCLI(NoteService noteService, Scanner scanner) {
        this.noteService = noteService;
        this.scanner = scanner;
    }

    public void showNotesMenu(Project activeProject) {
        while (true) {
            ConsoleHelper.printHeader("ENGINEERING TECHNICAL NOTES");

            System.out.println("  1. View Notes for Current Project");
            System.out.println("  2. View All Notes Across Projects");
            System.out.println("  3. Search Notes by Keyword");
            System.out.println("  4. Capture New Engineering Note");
            System.out.println("  0. Back to Main Menu");

            int ch = ConsoleHelper.readInt(scanner, "Enter choice", 0, 4);
            switch (ch) {
                case 1:
                    if (activeProject == null) {
                        ConsoleHelper.printError("No active project selected.");
                    } else {
                        displayNotes(noteService.getNotesByProject(activeProject.getId()),
                                "Notes for " + activeProject.getName());
                    }
                    break;
                case 2:
                    displayNotes(noteService.getAllNotes(), "All System Notes");
                    break;
                case 3:
                    String query = ConsoleHelper.readString(scanner, "Search keyword", false);
                    displayNotes(noteService.searchNotes(query), "Search results for: '" + query + "'");
                    break;
                case 4:
                    createNote(activeProject);
                    break;
                case 0:
                    return;
            }
        }
    }

    private void displayNotes(List<Note> notes, String heading) {
        ConsoleHelper.printSubHeader(heading + " (" + notes.size() + ")");
        if (notes.isEmpty()) {
            System.out.println("  No matching notes found.");
        } else {
            for (int i = 0; i < notes.size(); i++) {
                Note n = notes.get(i);
                System.out.printf("  %d. [%-18s] %s (%s)\n",
                        i + 1, n.getCategory(), n.getTitle(), n.getCreatedAt().toLocalDate());
                System.out.printf("       %s\n\n", n.getContent());
            }
        }
        System.out.println("Press Enter to continue...");
        scanner.nextLine();
    }

    private void createNote(Project activeProject) {
        ConsoleHelper.printSubHeader("Capture Engineering Note");
        String pId = activeProject != null ? activeProject.getId() :
                ConsoleHelper.readString(scanner, "Project ID (or leave empty)", true);
        String phaseId = activeProject != null ? activeProject.getCurrentPhaseId() : null;

        String title = ConsoleHelper.readString(scanner, "Title", false);
        String content = ConsoleHelper.readString(scanner, "Content / Technical Observation", false);

        System.out.println("Select Category:");
        System.out.println("1. TECHNICAL_DECISION | 2. DEBUGGING | 3. HARDWARE | 4. FIRMWARE | 5. TESTING | 6. BUG | 7. REFERENCE | 8. GENERAL");
        int c = ConsoleHelper.readInt(scanner, "Category", 1, 8);
        Note.Category cat = switch (c) {
            case 1 -> Note.Category.TECHNICAL_DECISION;
            case 2 -> Note.Category.DEBUGGING;
            case 3 -> Note.Category.HARDWARE;
            case 4 -> Note.Category.FIRMWARE;
            case 5 -> Note.Category.TESTING;
            case 6 -> Note.Category.BUG;
            case 7 -> Note.Category.REFERENCE;
            default -> Note.Category.GENERAL;
        };

        noteService.createNote(pId, phaseId, title, content, cat);
        ConsoleHelper.printSuccess("Note captured successfully!");
    }
}

