package com.embedded.models;

import java.time.LocalDateTime;

public class Project {
    public enum Status {
        ACTIVE,
        ON_HOLD,
        COMPLETED,
        ARCHIVED
    }

    private String id;
    private String name;
    private String description;
    private String projectCode;
    private String category;
    private String hardwarePlatform;
    private String mcu;
    private String ide;
    private String language;
    private String rtos;
    private String repositoryUrl;
    private Status status;
    private String startDate;
    private String targetDate;
    private String currentPhaseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Project(String id, String name, String projectCode, String description,
                   String category, String hardwarePlatform, String mcu,
                   String ide, String language, String rtos, String repositoryUrl) {
        this.id = id;
        this.name = name;
        this.projectCode = projectCode;
        this.description = description;
        this.category = category;
        this.hardwarePlatform = hardwarePlatform;
        this.mcu = mcu;
        this.ide = ide;
        this.language = language;
        this.rtos = rtos;
        this.repositoryUrl = repositoryUrl;
        this.status = Status.ACTIVE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; this.updatedAt = LocalDateTime.now(); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedAt = LocalDateTime.now(); }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; this.updatedAt = LocalDateTime.now(); }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; this.updatedAt = LocalDateTime.now(); }

    public String getHardwarePlatform() { return hardwarePlatform; }
    public void setHardwarePlatform(String hardwarePlatform) { this.hardwarePlatform = hardwarePlatform; this.updatedAt = LocalDateTime.now(); }

    public String getMcu() { return mcu; }
    public void setMcu(String mcu) { this.mcu = mcu; this.updatedAt = LocalDateTime.now(); }

    public String getIde() { return ide; }
    public void setIde(String ide) { this.ide = ide; this.updatedAt = LocalDateTime.now(); }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; this.updatedAt = LocalDateTime.now(); }

    public String getRtos() { return rtos; }
    public void setRtos(String rtos) { this.rtos = rtos; this.updatedAt = LocalDateTime.now(); }

    public String getRepositoryUrl() { return repositoryUrl; }
    public void setRepositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; this.updatedAt = LocalDateTime.now(); }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; this.updatedAt = LocalDateTime.now(); }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getTargetDate() { return targetDate; }
    public void setTargetDate(String targetDate) { this.targetDate = targetDate; }

    public String getCurrentPhaseId() { return currentPhaseId; }
    public void setCurrentPhaseId(String currentPhaseId) { this.currentPhaseId = currentPhaseId; this.updatedAt = LocalDateTime.now(); }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public String toString() {
        return String.format("[%s] %s (%s) - MCU: %s | Status: %s",
                projectCode, name, hardwarePlatform, mcu, status);
    }
}

