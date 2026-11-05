package com.embedded.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Task {
    public enum Status {
        TO_DO,
        IN_PROGRESS,
        PENDING,
        BLOCKED,
        DONE
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    private String id;
    private String projectId;
    private String phaseId;
    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private String dueDate;
    private List<TaskChecklistItem> checklistItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    public Task(String id, String projectId, String phaseId, String title,
                String description, Priority priority, String dueDate) {
        this.id = id;
        this.projectId = projectId;
        this.phaseId = phaseId;
        this.title = title;
        this.description = description;
        this.status = Status.TO_DO;
        this.priority = priority != null ? priority : Priority.MEDIUM;
        this.dueDate = dueDate;
        this.checklistItems = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getProjectId() { return projectId; }
    public String getPhaseId() { return phaseId; }
    public void setPhaseId(String phaseId) { this.phaseId = phaseId; this.updatedAt = LocalDateTime.now(); }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; this.updatedAt = LocalDateTime.now(); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedAt = LocalDateTime.now(); }

    public Status getStatus() { return status; }
    public void setStatus(Status status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
        if (status == Status.DONE) {
            this.completedAt = LocalDateTime.now();
        } else {
            this.completedAt = null;
        }
    }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; this.updatedAt = LocalDateTime.now(); }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; this.updatedAt = LocalDateTime.now(); }

    public List<TaskChecklistItem> getChecklistItems() { return checklistItems; }
    public void setChecklistItems(List<TaskChecklistItem> items) { this.checklistItems = items; }

    public void addChecklistItem(TaskChecklistItem item) {
        this.checklistItems.add(item);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    @Override
    public String toString() {
        return String.format("[%s] [%s] %s (Due: %s)",
                status, priority, title, dueDate != null ? dueDate : "N/A");
    }
}

