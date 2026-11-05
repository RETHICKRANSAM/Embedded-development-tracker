package com.embedded.models;

import java.time.LocalDateTime;

public class ReleaseGateItem {
    public enum Status {
        NOT_STARTED,
        PASSED,
        FAILED,
        BLOCKED
    }

    private String id;
    private String gateId;
    private String title;
    private String description;
    private boolean isMandatory;
    private Status status;
    private String notes;
    private int sequence;
    private LocalDateTime updatedAt;

    public ReleaseGateItem(String id, String gateId, String title, String description,
                           boolean isMandatory, int sequence) {
        this.id = id;
        this.gateId = gateId;
        this.title = title;
        this.description = description;
        this.isMandatory = isMandatory;
        this.sequence = sequence;
        this.status = Status.NOT_STARTED;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getGateId() { return gateId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isMandatory() { return isMandatory; }
    public void setMandatory(boolean mandatory) { isMandatory = mandatory; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public int getSequence() { return sequence; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public String toString() {
        return String.format("[%s] %s%s", status, title, isMandatory ? " (*Mandatory)" : "");
    }
}

