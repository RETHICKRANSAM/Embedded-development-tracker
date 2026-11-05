package com.embedded.CLI;

import java.util.Scanner;

public class ConsoleHelper {
    public static final String RESET = "\u001B[0m";
    public static final String BOLD = "\u001B[1m";
    public static final String GREEN = "\u001B[32m";
    public static final String YELLOW = "\u001B[33m";
    public static final String RED = "\u001B[31m";
    public static final String CYAN = "\u001B[36m";
    public static final String BLUE = "\u001B[34m";

    public static void printHeader(String title) {
        System.out.println();
        System.out.println(BOLD + CYAN + "================================================================================" + RESET);
        System.out.println(BOLD + "  " + title + RESET);
        System.out.println(BOLD + CYAN + "================================================================================" + RESET);
    }

    public static void printSubHeader(String title) {
        System.out.println();
        System.out.println(BOLD + BLUE + "--- " + title + " ---" + RESET);
    }

    public static void printSuccess(String msg) {
        System.out.println(GREEN + "✔ " + msg + RESET);
    }

    public static void printWarning(String msg) {
        System.out.println(YELLOW + "⚠ " + msg + RESET);
    }

    public static void printError(String msg) {
        System.out.println(RED + "✖ " + msg + RESET);
    }

    public static String readString(Scanner scanner, String prompt, boolean allowEmpty) {
        while (true) {
            System.out.print(prompt + ": ");
            String input = scanner.nextLine().trim();
            if (allowEmpty || !input.isEmpty()) {
                return input;
            }
            printError("Input cannot be blank. Please try again.");
        }
    }

    public static int readInt(Scanner scanner, String prompt, int min, int max) {
        while (true) {
            System.out.print(prompt + " (" + min + "-" + max + "): ");
            String line = scanner.nextLine().trim();
            try {
                int val = Integer.parseInt(line);
                if (val >= min && val <= max) {
                    return val;
                }
                printError("Value must be between " + min + " and " + max);
            } catch (NumberFormatException e) {
                printError("Invalid integer. Please enter a valid number.");
            }
        }
    }

    public static boolean confirm(Scanner scanner, String prompt) {
        System.out.print(prompt + " (y/n): ");
        String line = scanner.nextLine().trim().toLowerCase();
        return line.equals("y") || line.equals("yes");
    }
}

