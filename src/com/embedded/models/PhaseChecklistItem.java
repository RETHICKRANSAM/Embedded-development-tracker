package com.embedded.models;

public class PhaseChecklistItem {
    public enum Status {
        PENDING,
        PASSED,
        FAILED,
        WAIVED
    }

    private String id;
    private String projectId;
    private String phaseId;
    private String title;
    private String description;
    private Status status;
    private int sequence;
    private boolean isMandatory;
    private String notes;

    public PhaseChecklistItem(String id, String projectId, String phaseId,
                              String title, String description, int sequence, boolean isMandatory) {
        this.id = id;
        this.projectId = projectId;
        this.phaseId = phaseId;
        this.title = title;
        this.description = description;
        this.sequence = sequence;
        this.isMandatory = isMandatory;
        this.status = Status.PENDING;
    }

    public String getId() { return id; }
    public String getProjectId() { return projectId; }
    public String getPhaseId() { return phaseId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public int getSequence() { return sequence; }
    public void setSequence(int sequence) { this.sequence = sequence; }
    public boolean isMandatory() { return isMandatory; }
    public void setMandatory(boolean mandatory) { isMandatory = mandatory; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    @Override
    public String toString() {
        return String.format("[%s] %s%s", status, title, isMandatory ? " (*Mandatory)" : "");
    }
}

