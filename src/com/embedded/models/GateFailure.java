package com.embedded.models;

import java.time.LocalDateTime;

public class GateFailure {
    public enum Status {
        OPEN,
        FIXED,
        VERIFIED
    }

    private String id;
    private String gateItemId;
    private String description;
    private String expectedBehavior;
    private String actualBehavior;
    private String correctiveAction;
    private String retestResult;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public GateFailure(String id, String gateItemId, String description,
                       String expectedBehavior, String actualBehavior) {
        this.id = id;
        this.gateItemId = gateItemId;
        this.description = description;
        this.expectedBehavior = expectedBehavior;
        this.actualBehavior = actualBehavior;
        this.status = Status.OPEN;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getGateItemId() { return gateItemId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getExpectedBehavior() { return expectedBehavior; }
    public void setExpectedBehavior(String expectedBehavior) { this.expectedBehavior = expectedBehavior; }
    public String getActualBehavior() { return actualBehavior; }
    public void setActualBehavior(String actualBehavior) { this.actualBehavior = actualBehavior; }
    public String getCorrectiveAction() { return correctiveAction; }
    public void setCorrectiveAction(String correctiveAction) { this.correctiveAction = correctiveAction; }
    public String getRetestResult() { return retestResult; }
    public void setRetestResult(String retestResult) { this.retestResult = retestResult; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) {
        this.status = status;
        if (status == Status.VERIFIED) {
            this.resolvedAt = LocalDateTime.now();
        }
    }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }

    @Override
    public String toString() {
        return String.format("[%s] Defect: %s (Expected: %s | Actual: %s)",
                status, description, expectedBehavior, actualBehavior);
    }
}

