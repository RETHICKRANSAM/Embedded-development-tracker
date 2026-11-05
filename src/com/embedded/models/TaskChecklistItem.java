package com.embedded.models;

import java.time.LocalDateTime;

public class TaskChecklistItem {
    private String id;
    private String taskId;
    private String title;
    private boolean isCompleted;
    private int sequence;
    private LocalDateTime completedAt;

    public TaskChecklistItem(String id, String taskId, String title, int sequence) {
        this.id = id;
        this.taskId = taskId;
        this.title = title;
        this.sequence = sequence;
        this.isCompleted = false;
    }

    public String getId() { return id; }
    public String getTaskId() { return taskId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) {
        this.isCompleted = completed;
        this.completedAt = completed ? LocalDateTime.now() : null;
    }
    public int getSequence() { return sequence; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    @Override
    public String toString() {
        return String.format("[%s] %s", isCompleted ? "X" : " ", title);
    }
}

