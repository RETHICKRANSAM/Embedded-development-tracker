package com.embedded.models;

import java.time.LocalDateTime;

public class ReleaseGate {
    public enum GateType {
        GATE_A_DEMO,
        GATE_B_PILOT,
        GATE_C_PRODUCTION
    }

    public enum Status {
        NOT_STARTED,
        IN_PROGRESS,
        BLOCKED,
        READY_FOR_REVIEW,
        PASSED
    }

    private String id;
    private String projectId;
    private String name;
    private GateType gateType;
    private Status status;
    private String firmwareVersion;
    private String hardwareRevision;
    private String reviewNote;
    private LocalDateTime passedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReleaseGate(String id, String projectId, String name, GateType gateType) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.gateType = gateType;
        this.status = Status.NOT_STARTED;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getProjectId() { return projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public GateType getGateType() { return gateType; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
        if (status == Status.PASSED) {
            this.passedAt = LocalDateTime.now();
        }
    }
    public String getFirmwareVersion() { return firmwareVersion; }
    public void setFirmwareVersion(String firmwareVersion) { this.firmwareVersion = firmwareVersion; }
    public String getHardwareRevision() { return hardwareRevision; }
    public void setHardwareRevision(String hardwareRevision) { this.hardwareRevision = hardwareRevision; }
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    public LocalDateTime getPassedAt() { return passedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public String toString() {
        return String.format("[%s] %s - Status: %s", gateType, name, status);
    }
}

