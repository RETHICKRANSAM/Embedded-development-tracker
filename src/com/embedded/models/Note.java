package com.embedded.models;

import java.time.LocalDateTime;

public class Note {
    public enum Category {
        TECHNICAL_DECISION,
        DEBUGGING,
        HARDWARE,
        FIRMWARE,
        TESTING,
        BUG,
        REFERENCE,
        GENERAL
    }

    private String id;
    private String projectId;
    private String phaseId;
    private String title;
    private String content;
    private Category category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Note(String id, String projectId, String phaseId, String title,
                String content, Category category) {
        this.id = id;
        this.projectId = projectId;
        this.phaseId = phaseId;
        this.title = title;
        this.content = content;
        this.category = category != null ? category : Category.GENERAL;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getProjectId() { return projectId; }
    public String getPhaseId() { return phaseId; }
    public void setPhaseId(String phaseId) { this.phaseId = phaseId; this.updatedAt = LocalDateTime.now(); }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; this.updatedAt = LocalDateTime.now(); }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; this.updatedAt = LocalDateTime.now(); }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; this.updatedAt = LocalDateTime.now(); }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public String toString() {
        return String.format("[%s] %s (%s)", category, title, createdAt.toLocalDate());
    }
}

