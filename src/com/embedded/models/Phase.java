package com.embedded.models;

import java.time.LocalDateTime;

public class Phase {
    public enum Status {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }

    private String id;
    private String projectId;
    private String name;
    private String description;
    private int sequence;
    private Status status;
    private String startDate;
    private String dueDate;
    private LocalDateTime completedAt;

    public Phase(String id, String projectId, String name, String description, int sequence) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.description = description;
        this.sequence = sequence;
        this.status = Status.NOT_STARTED;
    }

    public String getId() { return id; }
    public String getProjectId() { return projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getSequence() { return sequence; }
    public void setSequence(int sequence) { this.sequence = sequence; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) {
        this.status = status;
        if (status == Status.COMPLETED) {
            this.completedAt = LocalDateTime.now();
        } else {
            this.completedAt = null;
        }
    }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    @Override
    public String toString() {
        return String.format("Phase %d: %s [%s]", sequence, name, status);
    }
}

