package com.embedded.CLI;

import com.embedded.models.*;
import com.embedded.services.*;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

public class ReleaseGateCLI {
    private final ReleaseGateService gateService;
    private final FailureService failureService;
    private final Scanner scanner;

    public ReleaseGateCLI(ReleaseGateService gateService, FailureService failureService, Scanner scanner) {
        this.gateService = gateService;
        this.failureService = failureService;
        this.scanner = scanner;
    }

    public void showGatesMenu(Project activeProject) {
        if (activeProject == null) {
            ConsoleHelper.printError("Please select an active project first.");
            return;
        }

        while (true) {
            ConsoleHelper.printHeader("PRODUCT RELEASE GATES — [" + activeProject.getProjectCode() + "]");
            System.out.println("  " + ConsoleHelper.YELLOW + "Note: Release readiness is evaluated independently from task progress." + ConsoleHelper.RESET);
            System.out.println("  " + ConsoleHelper.YELLOW + "All mandatory checklist items must be verified before passing a gate." + ConsoleHelper.RESET);
            System.out.println();

            List<ReleaseGate> gates = gateService.getGatesForProject(activeProject.getId());

            for (int i = 0; i < gates.size(); i++) {
                ReleaseGate g = gates.get(i);
                List<ReleaseGateItem> items = gateService.getGateItems(g.getId());
                long passedCount = items.stream().filter(it -> it.getStatus() == ReleaseGateItem.Status.PASSED).count();
                long failedCount = items.stream().filter(it -> it.getStatus() == ReleaseGateItem.Status.FAILED).count();
                double pct = items.isEmpty() ? 0 : ((double) passedCount / items.size()) * 100.0;

                String color = g.getStatus() == ReleaseGate.Status.PASSED ? ConsoleHelper.GREEN :
                        g.getStatus() == ReleaseGate.Status.READY_FOR_REVIEW ? ConsoleHelper.CYAN :
                        g.getStatus() == ReleaseGate.Status.BLOCKED ? ConsoleHelper.RED : ConsoleHelper.YELLOW;

                System.out.printf("  %d. %-35s -> %s[%s]%s (%.0f%% - %d/%d items)\n",
                        i + 1,
                        g.getName(),
                        color, g.getStatus(), ConsoleHelper.RESET,
                        pct, passedCount, items.size());

                if (g.getStatus() == ReleaseGate.Status.PASSED) {
                    System.out.printf("       └─ Passed for FW: %s | HW: %s at %s\n",
                            g.getFirmwareVersion(), g.getHardwareRevision(), g.getPassedAt());
                } else if (failedCount > 0) {
                    System.out.printf("       └─ " + ConsoleHelper.RED + "⚠ %d failed defect(s) blocking sign-off!\n" + ConsoleHelper.RESET, failedCount);
                }
            }

            System.out.println();
            System.out.println("  1. Inspect Gate & Verify Checklist");
            System.out.println("  2. Formal Sign-off (Mark Gate as Passed)");
            System.out.println("  3. View Gate Sign-off History");
            System.out.println("  0. Back to Main Menu");

            int choice = ConsoleHelper.readInt(scanner, "Enter choice", 0, 3);
            switch (choice) {
                case 1:
                    int gSel = ConsoleHelper.readInt(scanner, "Select gate number to inspect", 1, gates.size());
                    inspectGate(gates.get(gSel - 1), activeProject);
                    break;
                case 2:
                    int pSel = ConsoleHelper.readInt(scanner, "Select gate number to pass", 1, gates.size());
                    signOffGate(gates.get(pSel - 1), activeProject);
                    break;
                case 3:
                    int hSel = ConsoleHelper.readInt(scanner, "Select gate number to view history", 1, gates.size());
                    viewHistory(gates.get(hSel - 1));
                    break;
                case 0:
                    return;
            }
        }
    }

    private void inspectGate(ReleaseGate gate, Project project) {
        while (true) {
            ConsoleHelper.printHeader("GATE INSPECTION: " + gate.getName());
            System.out.println("  Current Status: " + gate.getStatus());

            List<ReleaseGateItem> items = gateService.getGateItems(gate.getId());
            for (int i = 0; i < items.size(); i++) {
                ReleaseGateItem item = items.get(i);
                String badge = item.getStatus() == ReleaseGateItem.Status.PASSED ? ConsoleHelper.GREEN + "[PASSED]" + ConsoleHelper.RESET :
                        item.getStatus() == ReleaseGateItem.Status.FAILED ? ConsoleHelper.RED + "[FAILED]" + ConsoleHelper.RESET :
                        item.getStatus() == ReleaseGateItem.Status.BLOCKED ? ConsoleHelper.RED + "[BLOCKED]" + ConsoleHelper.RESET :
                        "[NOT STARTED]";

                System.out.printf("  %2d. %s %s%s\n",
                        i + 1,
                        badge,
                        item.getTitle(),
                        item.isMandatory() ? ConsoleHelper.YELLOW + " (*Mandatory)" + ConsoleHelper.RESET : "");

                if (item.getNotes() != null && !item.getNotes().isEmpty()) {
                    System.out.println("        Note: " + item.getNotes());
                }
            }

            System.out.println();
            System.out.println("  1. Update Item Status (Pass / Fail / Reset)");
            System.out.println("  2. Log Defect Failure & Auto-Create Fix Task");
            System.out.println("  0. Back to Release Gates Overview");

            int ch = ConsoleHelper.readInt(scanner, "Enter choice", 0, 2);
            switch (ch) {
                case 1:
                    int itemIdx = ConsoleHelper.readInt(scanner, "Select item index", 1, items.size());
                    ReleaseGateItem it = items.get(itemIdx - 1);
                    System.out.println("Choose Status: 1. PASSED | 2. FAILED | 3. BLOCKED | 4. NOT_STARTED");
                    int st = ConsoleHelper.readInt(scanner, "Status", 1, 4);
                    ReleaseGateItem.Status newSt = st == 1 ? ReleaseGateItem.Status.PASSED :
                            st == 2 ? ReleaseGateItem.Status.FAILED :
                            st == 3 ? ReleaseGateItem.Status.BLOCKED : ReleaseGateItem.Status.NOT_STARTED;

                    String note = ConsoleHelper.readString(scanner, "Verification Note / Evidence (optional)", true);
                    gateService.updateGateItemStatus(it.getId(), newSt, note.isEmpty() ? null : note);
                    ConsoleHelper.printSuccess("Item status updated.");
                    break;
                case 2:
                    int fIdx = ConsoleHelper.readInt(scanner, "Select failed item index", 1, items.size());
                    ReleaseGateItem failedItem = items.get(fIdx - 1);
                    String desc = ConsoleHelper.readString(scanner, "Defect Description", false);
                    String expected = ConsoleHelper.readString(scanner, "Expected Behavior", false);
                    String actual = ConsoleHelper.readString(scanner, "Actual Behavior", false);
                    boolean makeTask = ConsoleHelper.confirm(scanner, "Auto-create corrective task in active phase?");

                    failureService.logFailure(failedItem.getId(), desc, expected, actual,
                            makeTask, project.getId(), project.getCurrentPhaseId());
                    ConsoleHelper.printSuccess("Defect logged! Gate item marked FAILED.");
                    break;
                case 0:
                    return;
            }
        }
    }

    private void signOffGate(ReleaseGate gate, Project project) {
        ConsoleHelper.printSubHeader("Formal Gate Sign-Off: " + gate.getName());

        List<ReleaseGateItem> items = gateService.getGateItems(gate.getId());
        boolean allMandatoryPassed = items.stream()
                .filter(ReleaseGateItem::isMandatory)
                .allMatch(i -> i.getStatus() == ReleaseGateItem.Status.PASSED);

        if (!allMandatoryPassed) {
            ConsoleHelper.printError("CANNOT PASS GATE: Incomplete mandatory checklist items remain!");
            System.out.println("Pending mandatory items:");
            items.stream()
                    .filter(i -> i.isMandatory() && i.getStatus() != ReleaseGateItem.Status.PASSED)
                    .forEach(i -> System.out.println("  • " + i.getTitle() + " -> " + i.getStatus()));
            return;
        }

        System.out.println(ConsoleHelper.GREEN + "✔ All mandatory checks PASSED. Ready for formal sign-off." + ConsoleHelper.RESET);
        String fw = ConsoleHelper.readString(scanner, "Frozen Firmware Version (e.g. v1.0.0-rc1)", false);
        String hw = ConsoleHelper.readString(scanner, "Target Hardware Revision (e.g. Rev A2)", false);
        String note = ConsoleHelper.readString(scanner, "Formal Approval Note / Acceptance Criteria Confirmation", false);

        if (ConsoleHelper.confirm(scanner, "Confirm formal gate sign-off?")) {
            boolean ok = gateService.passGate(gate.getId(), fw, hw, note);
            if (ok) {
                ConsoleHelper.printSuccess("🎉 GATE OFFICIALLY PASSED! Status updated to PASSED.");
            } else {
                ConsoleHelper.printError("Sign-off could not be completed.");
            }
        }
    }

    private void viewHistory(ReleaseGate gate) {
        ConsoleHelper.printSubHeader("Audit History for " + gate.getName());
        List<GateHistory> history = gateService.getGateHistory(gate.getId());
        if (history.isEmpty()) {
            System.out.println("  No formal history events recorded for this gate.");
        } else {
            for (GateHistory h : history) {
                System.out.printf("  • %s | Event: %s | FW: %s | HW: %s\n    Details: %s\n",
                        h.getCreatedAt(), h.getEventType(), h.getFirmwareVersion(), h.getHardwareRevision(), h.getDetails());
            }
        }
        System.out.println("\nPress Enter to continue...");
        scanner.nextLine();
    }
}

