package com.embedded.CLI;

import com.embedded.models.Project;
import com.embedded.services.ExportService;

import java.io.IOException;
import java.util.Scanner;

public class ExportCLI {
    private final ExportService exportService;
    private final Scanner scanner;

    public ExportCLI(ExportService exportService, Scanner scanner) {
        this.exportService = exportService;
        this.scanner = scanner;
    }

    public void showExportMenu(Project activeProject) {
        if (activeProject == null) {
            ConsoleHelper.printError("Please select an active project first.");
            return;
        }

        ConsoleHelper.printHeader("DATA PERSISTENCE & AUDIT EXPORTS (PRD Section 15)");
        System.out.println("  1. Export Project Summary (JSON)");
        System.out.println("  2. Export Release Gate Checklist Results (CSV)");
        System.out.println("  0. Back to Main Menu");

        int ch = ConsoleHelper.readInt(scanner, "Enter choice", 0, 2);
        try {
            if (ch == 1) {
                String json = exportService.exportProjectSummaryJson(activeProject.getId());
                String path = "exports/" + activeProject.getProjectCode() + "_summary.json";
                exportService.saveToFile(json, path);
                ConsoleHelper.printSuccess("Exported JSON archive to: " + path);
                System.out.println("\nPreview:\n" + json);
            } else if (ch == 2) {
                String csv = exportService.exportGatesCsv(activeProject.getId());
                String path = "exports/" + activeProject.getProjectCode() + "_gates.csv";
                exportService.saveToFile(csv, path);
                ConsoleHelper.printSuccess("Exported CSV checklist to: " + path);
                System.out.println("\nPreview:\n" + csv);
            }
        } catch (IOException e) {
            ConsoleHelper.printError("Export failed: " + e.getMessage());
        }

        System.out.println("\nPress Enter to continue...");
        scanner.nextLine();
    }
}

