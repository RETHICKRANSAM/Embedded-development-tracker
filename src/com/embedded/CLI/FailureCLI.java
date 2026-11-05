package com.embedded.CLI;

import com.embedded.models.GateFailure;
import com.embedded.services.FailureService;

import java.util.List;
import java.util.Scanner;

public class FailureCLI {
    private final FailureService failureService;
    private final Scanner scanner;

    public FailureCLI(FailureService failureService, Scanner scanner) {
        this.failureService = failureService;
        this.scanner = scanner;
    }

    public void showFailuresMenu() {
        while (true) {
            ConsoleHelper.printHeader("FAILURE & RETEST TRACKING (PRD Section 11)");
            List<GateFailure> failures = failureService.getAllFailures();

            if (failures.isEmpty()) {
                System.out.println("  No defects or failures recorded. All tests nominal.");
            } else {
                for (int i = 0; i < failures.size(); i++) {
                    GateFailure f = failures.get(i);
                    String color = f.getStatus() == GateFailure.Status.VERIFIED ? ConsoleHelper.GREEN :
                            f.getStatus() == GateFailure.Status.FIXED ? ConsoleHelper.CYAN : ConsoleHelper.RED;

                    System.out.printf("  %d. [%s%s%s] %-30s | Created: %s\n",
                            i + 1,
                            color, f.getStatus(), ConsoleHelper.RESET,
                            f.getDescription(),
                            f.getCreatedAt().toLocalDate());
                    System.out.printf("       Expected: %s\n", f.getExpectedBehavior());
                    System.out.printf("       Actual  : %s\n", f.getActualBehavior());
                    if (f.getCorrectiveAction() != null) {
                        System.out.printf("       Fix     : %s\n", f.getCorrectiveAction());
                    }
                    if (f.getRetestResult() != null) {
                        System.out.printf("       Retest  : %s\n", f.getRetestResult());
                    }
                }
            }

            System.out.println();
            System.out.println("  1. Record Defect Fix (Mark as FIXED)");
            System.out.println("  2. Record Retest Result (Mark as VERIFIED)");
            System.out.println("  0. Back to Main Menu");

            int ch = ConsoleHelper.readInt(scanner, "Enter choice", 0, 2);
            switch (ch) {
                case 1:
                    if (failures.isEmpty()) break;
                    int idx = ConsoleHelper.readInt(scanner, "Select failure index", 1, failures.size());
                    String action = ConsoleHelper.readString(scanner, "Corrective Action Taken", false);
                    failureService.markFixed(failures.get(idx - 1).getId(), action);
                    ConsoleHelper.printSuccess("Defect marked as FIXED.");
                    break;
                case 2:
                    if (failures.isEmpty()) break;
                    int rIdx = ConsoleHelper.readInt(scanner, "Select failure index", 1, failures.size());
                    String res = ConsoleHelper.readString(scanner, "Retest Observations / Evidence", false);
                    boolean passed = ConsoleHelper.confirm(scanner, "Did the retest pass successfully?");
                    failureService.verifyRetest(failures.get(rIdx - 1).getId(), res, passed);
                    if (passed) {
                        ConsoleHelper.printSuccess("Defect VERIFIED! Associated gate item updated to PASSED.");
                    } else {
                        ConsoleHelper.printWarning("Retest failed. Defect returned to OPEN status.");
                    }
                    break;
                case 0:
                    return;
            }
        }
    }
}

